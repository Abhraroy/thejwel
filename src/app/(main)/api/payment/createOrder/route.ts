import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import adminsupabase from "@/lib/supabase/admin";
import { prepareCheckoutContext } from "@/app/utils/orderCheckout";
import razorpayInstance from "@/app/utils/RazorPay";
import { redis } from "@/app/utils/Redis";

export async function POST(request: NextRequest) {
  const userSupabase = await createClient();
  let addressId: string | null = null;
  let couponCode: string | null = null;

  try {
    const body = await request.json();
    addressId = body?.address_id ?? null;
    couponCode =
      typeof body?.coupon_code === "string" ? body.coupon_code.trim() : null;
  } catch {
    return NextResponse.json(
      { message: "No address_id in request body or invalid JSON" },
      { status: 400 }
    );
  }

  if (!addressId) {
    return NextResponse.json(
      { message: "Shipping address is required" },
      { status: 400 }
    );
  }

  const {
    data: { user },
  } = await userSupabase.auth.getUser();
  if (!user?.phone) {
    return NextResponse.json(
      { message: "User is not authenticated" },
      { status: 404 }
    );
  }

  const contextRes = await prepareCheckoutContext("+" + user.phone, addressId);
  if (!contextRes.success) {
    return NextResponse.json(
      { message: contextRes.message },
      { status: contextRes.status }
    );
  }
  const context = contextRes.data;
  let discountedTotalAmount = context.totalAmount;
  let discountedAmountInPaise = context.amountInPaise;

  if (couponCode) {
    const nowIso = new Date().toISOString();
    const couponRes = await adminsupabase
      .from("coupons")
      .select(
        "coupon_code, coupon_type, discount_type, discount_value, min_purchase_amount, max_discount_amount, usage_limit, usage_count, is_active, valid_from, valid_until"
      )
      .eq("coupon_code", couponCode)
      .eq("coupon_type", "PREPAID")
      .eq("is_active", true)
      .lte("valid_from", nowIso)
      .gte("valid_until", nowIso)
      .maybeSingle();

    if (couponRes.error || !couponRes.data) {
      return NextResponse.json(
        {
          message:
            "Coupon is invalid, expired, or not valid for prepaid payment",
        },
        { status: 400 }
      );
    }

    const coupon = couponRes.data;
    const usageLimit = Number(coupon.usage_limit ?? 0);
    const usageCount = Number(coupon.usage_count ?? 0);
    if (usageLimit > 0 && usageCount >= usageLimit) {
      return NextResponse.json(
        { message: "Coupon usage limit reached" },
        { status: 400 }
      );
    }

    const minPurchaseAmount = Number(coupon.min_purchase_amount ?? 0);
    if (context.totalAmount < minPurchaseAmount) {
      return NextResponse.json(
        { message: `Minimum purchase should be ₹${minPurchaseAmount}` },
        { status: 400 }
      );
    }

    const discountValue = Number(coupon.discount_value ?? 0);
    let computedDiscount = 0;
    if (coupon.discount_type === "percentage") {
      computedDiscount = (context.totalAmount * discountValue) / 100;
    } else if (coupon.discount_type === "fixed") {
      computedDiscount = discountValue;
    }

    const maxDiscountAmount = Number(coupon.max_discount_amount ?? 0);
    if (maxDiscountAmount > 0) {
      computedDiscount = Math.min(computedDiscount, maxDiscountAmount);
    }

    computedDiscount = Math.max(
      0,
      Math.min(computedDiscount, context.totalAmount)
    );
    discountedTotalAmount = Math.max(
      0,
      Math.round(context.totalAmount - computedDiscount)
    );
    discountedAmountInPaise = discountedTotalAmount * 100;
  }

  const payableContext = {
    ...context,
    totalAmount: discountedTotalAmount,
    amountInPaise: discountedAmountInPaise,
  };

  const checkoutData = {
    context: payableContext,
    couponCode: couponCode ?? null,
  };

  try {
    const receipt = crypto.randomUUID().replace(/-/g, "");
    const razorpayOptions = {
      amount: payableContext.amountInPaise,
      currency: "INR",
      receipt,
    };
    const razorpayOrder = await razorpayInstance.orders.create(razorpayOptions);

    const redisKey = `razorpay_checkout:${razorpayOrder.id}`;
    await redis.set(redisKey, JSON.stringify(checkoutData), { ex: 1800 });

    return NextResponse.json(
      {
        total_amount: payableContext.totalAmount,
        amount_in_paise: payableContext.amountInPaise,
        address_id: payableContext.addressId,
        address_text: payableContext.addressText,
        user_id: payableContext.user.user_id,
        razorpay_order_id: razorpayOrder.id,
        razorpay_order: razorpayOrder,
      },
      { status: 200 }
    );
  } catch (razorpayError: unknown) {
    console.error("Razorpay order creation failed:", razorpayError);
    return NextResponse.json(
      { message: "Failed to create payment order", error: razorpayError },
      { status: 500 }
    );
  }
}
