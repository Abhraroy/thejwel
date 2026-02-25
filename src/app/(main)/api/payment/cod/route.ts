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
  try {
    const body = await request.json();
    addressId = body?.address_id ?? null;
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

  const orderRes = await createOrderWithItems(context, {
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
