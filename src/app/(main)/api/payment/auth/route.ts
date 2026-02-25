import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/lib/supabase/server";
import adminsupabase from "@/lib/supabase/admin";
import { getAuthToken } from "@/app/utils/Phonepe";
import { redis } from "@/app/utils/Redis";
import {
  createOrderWithItems,
  prepareCheckoutContext,
} from "@/app/utils/orderCheckout";

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
      { message: "User is not authenticated found" },
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
        "coupon_code, discount_type, discount_value, min_purchase_amount, max_discount_amount, usage_limit, usage_count, is_active, valid_from, valid_until"
      )
      .eq("coupon_code", couponCode)
      .eq("is_active", true)
      .lte("valid_from", nowIso)
      .gte("valid_until", nowIso)
      .maybeSingle();

    if (couponRes.error || !couponRes.data) {
      return NextResponse.json(
        { message: "Coupon is invalid or expired" },
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

    computedDiscount = Math.max(0, Math.min(computedDiscount, context.totalAmount));
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
  const merchantOrderId = uuidv4();

  const authToken = await getAuthToken();
  if (!authToken) {
    return NextResponse.json(
      { message: "Error getting auth token" },
      { status: 500 }
    );
  }

  redis.set(merchantOrderId, authToken, { ex: 1200 });
  const paymentRequestHeaders = {
    "Content-Type": "application/json",
    Authorization: `O-Bearer ${authToken}`,
  };

  const orderRes = await createOrderWithItems(payableContext, {
    merchantOrderId,
    paymentStatus: "pending",
    orderStatus: "pending",
  });

  if (!orderRes.success) {
    return NextResponse.json(
      { message: orderRes.message },
      { status: orderRes.status }
    );
  }

  const paymentRequestBody = {
    amount: payableContext.amountInPaise,
    expireAfter: 1200,
    metaInfo: {
      udf1: payableContext.user.user_id,
      udf2: merchantOrderId,
      udf3: payableContext.totalAmount,
      udf4: payableContext.lastAddedProductTime || "additional-information-4",
      udf5: payableContext.cartId || "additional-information-5",
      udf6: payableContext.addressId || "additional-information-6",
      udf7: payableContext.addressText || null,
      udf8: couponCode || "additional-information-8",
      udf9: "additional-information-9",
      udf10: "additional-information-10",
      udf11: "additional-information-11",
      udf12: "additional-information-12",
      udf13: "additional-information-13",
      udf14: "additional-information-14",
      udf15: "additional-information-15",
    },
    paymentFlow: {
      type: "PG_CHECKOUT",
      message: "Payment message used for collect requests",
      merchantUrls: {
        redirectUrl:
          "https://following-blessed-fold-edgar.trycloudflare.com/redirect",
      },
    },
    merchantOrderId,
    paymentModeConfig: {
      enabledPaymentModes: [
        { type: "UPI_INTENT" },
        { type: "UPI_COLLECT" },
        { type: "UPI_QR" },
        { type: "NET_BANKING" },
        {
          type: "CARD",
          cardTypes: ["DEBIT_CARD", "CREDIT_CARD"],
        },
      ],
    },
  };

  try {
    const paymentRes = await axios.post(
      "https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay",
      paymentRequestBody,
      { headers: paymentRequestHeaders }
    );

    if (paymentRes.data?.orderId) {
      await adminsupabase
        .from("orders")
        .update({
          order_number: paymentRes.data.orderId,
          payment_status: "pending",
        })
        .eq("order_id", orderRes.order.order_id);
    }

    return NextResponse.json(
      { data: paymentRes.data, merchantOrderId },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating payment", error },
      { status: 500 }
    );
  }
}
