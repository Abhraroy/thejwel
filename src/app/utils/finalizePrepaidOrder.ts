import "server-only";
import adminsupabase from "@/lib/supabase/admin";
import { createOrderWithItems } from "@/app/utils/orderCheckout";
import { redis } from "@/app/utils/Redis";
import { createRapidShypOrderForOrder } from "@/app/utils/rapidShyp";
import { sendPurchaseEvent } from "@/lib/meta/capi";
import type { AttributionPayload } from "@/lib/attribution";

const devLog = (...args: unknown[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log("[finalizePrepaidOrder]", ...args);
  }
};

export type FinalizePrepaidResult =
  | {
      success: true;
      alreadyExisted: boolean;
      order: { order_id: string; order_number: string | null };
    }
  | { success: false; message: string; status: number };

interface StoredCheckoutData {
  context: any;
  couponCode: string | null;
  attribution?: Partial<AttributionPayload> | null;
}

/**
 * Idempotently turn a captured Razorpay payment into a DB order, then fire the
 * server Conversions API. Shared by:
 *   - POST /api/payment/complete-razorpay (client-driven happy path)
 *   - POST /api/payment/razorpay-webhook  (server-driven recovery path)
 *
 * Idempotency is keyed on `transaction_id == razorpay_payment_id`, so whichever
 * path runs first wins and the other is a no-op.
 */
export async function finalizePrepaidOrder(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  source: "client" | "webhook";
}): Promise<FinalizePrepaidResult> {
  const { razorpayOrderId, razorpayPaymentId, source } = params;

  const redisKey = `razorpay_checkout:${razorpayOrderId}`;
  const storedData = await redis.get<string>(redisKey);

  // Idempotency check first so recovery still works after the Redis TTL.
  const existingOrder = await adminsupabase
    .from("orders")
    .select("order_id, order_number")
    .eq("transaction_id", razorpayPaymentId)
    .maybeSingle();

  if (!existingOrder.error && existingOrder.data) {
    devLog("already-existed", {
      source,
      razorpayPaymentId,
      orderId: existingOrder.data.order_id,
    });
    if (storedData) await redis.del(redisKey);
    return {
      success: true,
      alreadyExisted: true,
      order: {
        order_id: existingOrder.data.order_id,
        order_number: existingOrder.data.order_number ?? null,
      },
    };
  }

  if (!storedData) {
    devLog("checkout-session-expired", { source, redisKey });
    return { success: false, message: "Checkout session expired", status: 410 };
  }

  let checkoutData: StoredCheckoutData;
  try {
    checkoutData =
      typeof storedData === "string" ? JSON.parse(storedData) : (storedData as StoredCheckoutData);
  } catch {
    devLog("invalid-checkout-data", { source, redisKey });
    return { success: false, message: "Invalid checkout data", status: 500 };
  }

  const { context: payableContext, couponCode, attribution } = checkoutData;
  if (!payableContext) {
    devLog("missing-payable-context", { source, redisKey });
    return { success: false, message: "Invalid checkout context", status: 500 };
  }

  const orderNumber = `PREPAID-${payableContext.user.user_id.slice(0, 8)}-${Date.now()}`;

  const orderRes = await createOrderWithItems(payableContext, {
    orderNumber,
    paymentStatus: "confirm",
    orderStatus: "processing",
    transactionId: razorpayPaymentId,
    couponCode: couponCode ?? undefined,
  });

  if (!orderRes.success) {
    devLog("createOrderWithItems-failed", {
      source,
      razorpayPaymentId,
      message: orderRes.message,
      status: orderRes.status,
    });
    return { success: false, message: orderRes.message, status: orderRes.status };
  }

  const order = orderRes.order;
  devLog("order-created", {
    source,
    orderId: order.order_id,
    orderNumber: order.order_number,
    transactionId: razorpayPaymentId,
  });

  // --- Stock decrement ---
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
    devLog("stock-update-error", { source, orderId: order.order_id, error: stockError });
    console.error("Stock update error:", stockError);
  }

  // --- Coupon usage ---
  const appliedCouponCode =
    couponCode && typeof couponCode === "string" && couponCode.trim().length > 0
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
        await adminsupabase
          .from("coupons")
          .update({ usage_count: Math.max(0, usageCount + 1) })
          .eq("coupon_code", appliedCouponCode);
      }
    } catch (couponError) {
      devLog("coupon-usage-update-failed", { source, appliedCouponCode, error: couponError });
      console.error("Failed to update coupon usage count:", couponError);
    }
  }

  // --- Shipping ---
  try {
    await createRapidShypOrderForOrder(order.order_id, "PREPAID");
  } catch (rapidShypError) {
    devLog("rapidshyp-create-failed", { source, orderId: order.order_id, error: rapidShypError });
    console.error("RapidShyp order creation error:", rapidShypError);
  }

  // --- Meta Conversions API (source of truth; never blocks the order) ---
  try {
    const contentIds = (orderRes.orderItemsPayload ?? [])
      .map((item: any) => item.product_id)
      .filter(Boolean);
    await sendPurchaseEvent({
      eventId: order.order_id,
      value: Number(payableContext.totalAmount) || 0,
      currency: "INR",
      contentIds,
      user: {
        email: payableContext.user?.email,
        phone: payableContext.user?.phone_number,
        firstName: payableContext.user?.first_name,
        lastName: payableContext.user?.last_name,
      },
      attribution: attribution ?? null,
    });
  } catch (capiError) {
    devLog("capi-error", { source, orderId: order.order_id, error: capiError });
  }

  await redis.del(redisKey);
  devLog("checkout-session-cleared", { source, redisKey, orderId: order.order_id });

  return {
    success: true,
    alreadyExisted: false,
    order: { order_id: order.order_id, order_number: order.order_number ?? null },
  };
}
