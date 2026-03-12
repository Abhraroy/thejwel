import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import adminsupabase from "@/lib/supabase/admin";
import {
  createOrderWithItems,
} from "@/app/utils/orderCheckout";
import { redis } from "@/app/utils/Redis";
import { createRapidShypOrderForOrder } from "@/app/utils/rapidShyp";

export async function POST(request: NextRequest) {
  let razorpayOrderId: string | null = null;
  let razorpayPaymentId: string | null = null;
  let razorpaySignature: string | null = null;

  try {
    const body = await request.json();
    razorpayOrderId =
      typeof body?.razorpay_order_id === "string" ? body.razorpay_order_id.trim() : null;
    razorpayPaymentId =
      typeof body?.razorpay_payment_id === "string" ? body.razorpay_payment_id.trim() : null;
    razorpaySignature =
      typeof body?.razorpay_signature === "string" ? body.razorpay_signature : null;
  } catch {
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 }
    );
  }

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return NextResponse.json(
      { message: "Missing razorpay_order_id, razorpay_payment_id, or razorpay_signature" },
      { status: 400 }
    );
  }

  const signBody = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(signBody)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    return NextResponse.json(
      { message: "Invalid payment signature" },
      { status: 400 }
    );
  }

  const redisKey = `razorpay_checkout:${razorpayOrderId}`;
  const storedData = await redis.get<string>(redisKey);

  if (!storedData) {
    return NextResponse.json(
      { message: "Checkout session expired" },
      { status: 410 }
    );
  }

  let checkoutData: { context: any; couponCode: string | null };
  try {
    checkoutData =
      typeof storedData === "string" ? JSON.parse(storedData) : storedData;
  } catch {
    return NextResponse.json(
      { message: "Invalid checkout data" },
      { status: 500 }
    );
  }

  const { context: payableContext, couponCode } = checkoutData;
  if (!payableContext) {
    return NextResponse.json(
      { message: "Invalid checkout context" },
      { status: 500 }
    );
  }

  const existingOrder = await adminsupabase
    .from("orders")
    .select("order_id, order_number")
    .eq("transaction_id", razorpayPaymentId)
    .maybeSingle();

  if (!existingOrder.error && existingOrder.data) {
    await redis.del(redisKey);
    return NextResponse.json(
      {
        order_id: existingOrder.data.order_id,
        order_number: existingOrder.data.order_number,
      },
      { status: 200 }
    );
  }

  const now = Date.now();
  const prepaidOrderNumber = `PREPAID-${payableContext.user.user_id.slice(0, 8)}-${now}`;

  const orderRes = await createOrderWithItems(payableContext, {
    orderNumber: prepaidOrderNumber,
    paymentStatus: "confirm",
    orderStatus: "processing",
    transactionId: razorpayPaymentId,
    couponCode: couponCode ?? undefined,
  });

  if (!orderRes.success) {
    return NextResponse.json(
      { message: orderRes.message },
      { status: orderRes.status }
    );
  }

  const updatedOrderData = orderRes.order;

  try {
    const items = orderRes.orderItemsPayload ?? [];
    const qtyByProductId = new Map<string, number>();
    for (const item of items) {
      const pid = item.product_id;
      const qty = Number(item.quantity) || 0;
      if (!pid || qty <= 0) continue;
      qtyByProductId.set(pid, (qtyByProductId.get(pid) || 0) + qty);
    }

    for (const [productId, orderedQty] of qtyByProductId.entries()) {
      const productRes = await adminsupabase
        .from("products")
        .select("stock_quantity")
        .eq("product_id", productId)
        .single();

      if (productRes.error) {
        console.error("Failed to fetch product for stock update:", productRes.error);
        continue;
      }

      const currentStock = Number(productRes.data?.stock_quantity) || 0;
      const nextStock = Math.max(0, currentStock - orderedQty);

      await adminsupabase
        .from("products")
        .update({ stock_quantity: nextStock })
        .eq("product_id", productId);
    }
  } catch (stockError) {
    console.error("Stock update error:", stockError);
  }

  const appliedCouponCode = couponCode && typeof couponCode === "string" && couponCode.trim().length > 0
    ? couponCode.trim()
    : null;
  if (appliedCouponCode) {
    try {
      const { data: couponRow } = await adminsupabase
        .from("coupons")
        .select("usage_count")
        .eq("coupon_code", appliedCouponCode)
        .maybeSingle();

      if (couponRow) {
        const usageCount = Number(couponRow.usage_count ?? 0);
        const nextUsageCount = Math.max(0, usageCount + 1);
        await adminsupabase
          .from("coupons")
          .update({ usage_count: nextUsageCount })
          .eq("coupon_code", appliedCouponCode);
      }
    } catch (couponError) {
      console.error("Failed to update coupon usage count:", couponError);
    }
  }

  try {
    await createRapidShypOrderForOrder(updatedOrderData.order_id, "PREPAID");
  } catch (rapidShypError) {
    console.error("RapidShyp order creation error:", rapidShypError);
  }

  await redis.del(redisKey);

  return NextResponse.json(
    {
      order_id: updatedOrderData.order_id,
      order_number: updatedOrderData.order_number,
    },
    { status: 200 }
  );
}
