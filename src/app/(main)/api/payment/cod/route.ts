import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import adminsupabase from "@/lib/supabase/admin";
import {
  createOrderWithItems,
  prepareCheckoutContext,
} from "@/app/utils/orderCheckout";

const COD_ORDER_PREFIX = "COD";

export async function POST(request: NextRequest) {
  const userSupabase = await createClient();
  const {
    data: { user },
  } = await userSupabase.auth.getUser();

  if (!user?.phone) {
    return NextResponse.json(
      { message: "User is not authenticated found" },
      { status: 404 }
    );
  }

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

  const contextRes = await prepareCheckoutContext("+" + user.phone, addressId);
  if (!contextRes.success) {
    return NextResponse.json(
      { message: contextRes.message },
      { status: contextRes.status }
    );
  }

  const context = contextRes.data;
  let totalAmount = context.totalAmount;

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

    if (!couponRes.error && couponRes.data) {
      const coupon = couponRes.data;
      const usageLimit = Number(coupon.usage_limit ?? 0);
      const usageCount = Number(coupon.usage_count ?? 0);
      const minPurchaseAmount = Number(coupon.min_purchase_amount ?? 0);

      if ((usageLimit <= 0 || usageCount < usageLimit) && context.totalAmount >= minPurchaseAmount) {
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
        totalAmount = Math.max(0, Math.round(context.totalAmount - computedDiscount));
      }
    }
  }

  const payableContext = {
    ...context,
    totalAmount,
    amountInPaise: Math.round(totalAmount * 100),
  };

  const now = Date.now();
  const codOrderNumber = `${COD_ORDER_PREFIX}-${context.user.user_id.slice(0, 8)}-${now}`;

  // Server-side duplicate guard for accidental double-clicks.
  const ninetySecondsAgo = new Date(now - 90 * 1000).toISOString();
  const duplicateRes = await adminsupabase
    .from("orders")
    .select("order_id, order_number, total_amount, order_date")
    .eq("user_id", context.user.user_id)
    .eq("shipping_address_id", context.addressId)
    .eq("payment_status", "pending(cod)")
    .eq("order_status", "pending")
    .gte("order_date", ninetySecondsAgo)
    .like("order_number", `${COD_ORDER_PREFIX}-%`)
    .order("order_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!duplicateRes.error && duplicateRes.data) {
    return NextResponse.json(
      {
        message: "COD order already created",
        orderId: duplicateRes.data.order_id,
        orderNumber: duplicateRes.data.order_number,
      },
      { status: 200 }
    );
  }

  const orderRes = await createOrderWithItems(payableContext, {
    orderNumber: codOrderNumber,
    merchantOrderId: codOrderNumber,
    paymentStatus: "pending(cod)",
    orderStatus: "pending",
  });

  if (!orderRes.success) {
    return NextResponse.json(
      { message: orderRes.message },
      { status: orderRes.status }
    );
  }

  return NextResponse.json(
    {
      message: "COD order created successfully",
      orderId: orderRes.order.order_id,
      orderNumber: orderRes.order.order_number,
    },
    { status: 200 }
  );
}
