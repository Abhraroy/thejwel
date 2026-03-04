import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import adminsupabase from "@/lib/supabase/admin";
import axios from "axios";
import { redis } from "@/app/utils/Redis";
import { createRapidShypOrderForOrder } from "@/app/utils/rapidShyp";
export async function GET(request: NextRequest) {
  const userSupabase = await createClient();
  const { data, error } = await userSupabase.auth.getUser();
  if (error) {
    return NextResponse.json(
      { message: "User is not authenticated found" },
      { status: 404 }
    );
  }
  const { data: userData } = await adminsupabase
    .from("users")
    .select("user_id")
    .eq("phone_number", "+" + data.user?.phone)
    .single();
  if (!userData?.user_id) {
    return NextResponse.json({ message: "User is not found" }, { status: 404 });
  }
  const searchParams = request.nextUrl.searchParams;
  const merchantOrderId = searchParams.get("merchantOrderId");
  if (!merchantOrderId) {
    return NextResponse.json(
      { message: "Merchant order id is not found" },
      { status: 404 }
    );
  }
  console.log("merchantOrderId", merchantOrderId);
  const authToken = await redis.get(merchantOrderId);
  if (!authToken || authToken === null) {
    return NextResponse.json(
      { message: "Auth token is not found" },
      { status: 404 }
    );
  }
  console.log("authToken", authToken);

  const sandbox = `https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order/${merchantOrderId}/status?details=true&errorContext=true`;
  const orderStatusRequestHeaders = {
    "Content-Type": "application/json",
    Authorization: `O-Bearer ${authToken}`,
  };
  const orderStatusResponse = await axios.get(sandbox, {
    headers: orderStatusRequestHeaders,
  });
  console.log("orderStatusResponse", orderStatusResponse.data);

  // Get payment state from response
  const paymentState =
    orderStatusResponse.data?.paymentDetails?.[0]?.state ||
    orderStatusResponse.data?.state;

  if (paymentState === "COMPLETED") {
    // Idempotency guard: this route is polled from `/redirect`, so we must not run side-effects twice.
    // If the order is already completed, return early.
    const existingOrder = await adminsupabase
      .from("orders")
      .select("order_id, payment_status")
      .eq("order_number", orderStatusResponse.data.orderId)
      .single();

    if (!existingOrder.error && existingOrder.data?.payment_status === "confirm") {
      return NextResponse.json(
        {
          message: "Order already completed",
          orderStatusResponse: { state: "COMPLETED" },
        },
        { status: 200 }
      );
    }

    const { data: orderData, error } = await adminsupabase
      .from("orders")
      .update({
        payment_status: "confirm",
        order_status: "processing",
        transaction_id:
          orderStatusResponse.data.paymentDetails[0].transactionId,
      })
      .select(
        `*,
        order_items(*, products(*))
        `
      )
      .eq("order_number", orderStatusResponse.data.orderId);
    if (error) {
      console.log("error", error);
      return NextResponse.json(
        {
          message: "Error updating order",
          orderStatusResponse: { state: "FAILED" },
        },
        { status: 500 }
      );
    }
    console.log(
      "order updated successfully ",
      JSON.stringify(orderData?.[0], null, 2)
    );
    console.log(
      "order_items:",
      JSON.stringify(orderData?.[0]?.order_items, null, 2)
    );
    const updatedOrderData = orderData?.[0];

    // Decrease stock quantity for each ordered product
    // Note: We clamp at 0 to avoid negative values if stock is already low.
    try {
      const items = updatedOrderData?.order_items ?? [];
      const qtyByProductId = new Map<string, number>();
      for (const item of items) {
        const pid = item.product_id as string | undefined;
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

        const updateStockRes = await adminsupabase
          .from("products")
          .update({ stock_quantity: nextStock })
          .eq("product_id", productId);

        if (updateStockRes.error) {
          console.error("Failed to update stock quantity:", updateStockRes.error);
        }
      }
    } catch (stockError) {
      // Payment is already successful, so we don't fail the whole request here.
      console.error("Stock update error:", stockError);
    }

    // Increment coupon usage_count after successful purchase (tracks usage; reduces remaining uses)
    const couponCode = updatedOrderData?.coupon_code as string | undefined;
    if (couponCode && typeof couponCode === "string" && couponCode.trim().length > 0) {
      try {
        const { data: couponRow } = await adminsupabase
          .from("coupons")
          .select("usage_count")
          .eq("coupon_code", couponCode.trim())
          .maybeSingle();

        if (couponRow) {
          const usageCount = Number(couponRow.usage_count ?? 0);
          const nextUsageCount = Math.max(0, usageCount + 1);
          await adminsupabase
            .from("coupons")
            .update({ usage_count: nextUsageCount })
            .eq("coupon_code", couponCode.trim());
        }
      } catch (couponError) {
        console.error("Failed to update coupon usage count:", couponError);
      }
    }

    await createRapidShypOrderForOrder(updatedOrderData.order_id, "PREPAID");

    return NextResponse.json(
      {
        message: "Order updated successfully",
        orderStatusResponse: { state: "COMPLETED" },
      },
      { status: 200 }
    );
  }

  if (paymentState === "FAILED") {
    return NextResponse.json(
      {
        message: "Payment failed",
        orderStatusResponse: { state: "FAILED" },
      },
      { status: 200 }
    );
  }

  // Return PENDING state for any other case
  return NextResponse.json(
    {
      message: "Order status is pending",
      orderStatusResponse: { state: "PENDING" },
    },
    { status: 200 }
  );
}
