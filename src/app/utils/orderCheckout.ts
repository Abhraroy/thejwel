import { revalidatePath } from "next/cache";
import adminsupabase from "@/lib/supabase/admin";

type CheckoutCartItem = {
  product_id: string;
  quantity: number;
  added_at?: string | null;
  products?: {
    final_price?: number | null;
    product_name?: string | null;
  } | null;
};

type CheckoutAddress = {
  address_id: string;
  user_id: string;
  street_address: string;
  address_line1?: string | null;
  address_line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
};

type CheckoutUser = {
  user_id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  cart?: { cart_id: string }[] | { cart_id: string } | null;
};

export interface CheckoutContext {
  user: CheckoutUser;
  cartId: string;
  cartData: CheckoutCartItem[];
  addressId: string;
  addressText: string;
  totalAmount: number;
  amountInPaise: number;
  lastAddedProductTime: string | null;
}

export interface OrderCreationOptions {
  orderNumber?: string | null;
  paymentStatus?: string;
  orderStatus?: string;
  transactionId?: string | null;
  couponCode?: string | null;
}

const formatAddressText = (address: CheckoutAddress) =>
  `${address.street_address}, ${address.address_line1 ?? "null"}, ${address.address_line2 ?? "null"}, ${address.city}, ${address.state} - ${address.postal_code}`;

export async function prepareCheckoutContext(
  phoneNumber: string,
  addressId: string
): Promise<{ success: true; data: CheckoutContext } | { success: false; message: string; status: number }> {
  const userRes = await adminsupabase
    .from("users")
    .select("user_id, first_name, last_name, email, phone_number, cart(*)")
    .eq("phone_number", phoneNumber)
    .single();

  if (userRes.error || !userRes.data) {
    return { success: false, message: "User is not found", status: 404 };
  }

  const user = userRes.data as unknown as CheckoutUser;
  const userCart = Array.isArray(user.cart) ? user.cart[0] : user.cart;
  const cartId = userCart?.cart_id;
  if (!cartId) {
    return { success: false, message: "Cart not found for user", status: 400 };
  }

  const addressRes = await adminsupabase
    .from("addresses")
    .select("*")
    .eq("address_id", addressId)
    .eq("user_id", user.user_id)
    .single();

  if (addressRes.error || !addressRes.data) {
    return { success: false, message: "Shipping address is invalid", status: 400 };
  }

  const address = addressRes.data as CheckoutAddress;

  const cartRes = await adminsupabase
    .from("cart_items")
    .select(
      `
      product_id,
      quantity,
      added_at,
      products(
        product_name,
        final_price
      )
      `
    )
    .eq("cart_id", cartId)
    .order("added_at", { ascending: false });

  if (cartRes.error || !cartRes.data || cartRes.data.length === 0) {
    return { success: false, message: "Cart is empty", status: 400 };
  }

  const cartData = cartRes.data as CheckoutCartItem[];
  const qtyByProductId = new Map<string, { qty: number; name: string }>();

  for (const item of cartData) {
    const pid = item.product_id;
    const qty = Number(item.quantity) || 0;
    if (!pid || qty <= 0) continue;
    const prev = qtyByProductId.get(pid);
    qtyByProductId.set(pid, {
      qty: (prev?.qty || 0) + qty,
      name: item.products?.product_name || "Product",
    });
  }

  const productIds = Array.from(qtyByProductId.keys());
  if (productIds.length === 0) {
    return { success: false, message: "Cart is empty", status: 400 };
  }

  const stockRes = await adminsupabase
    .from("products")
    .select("product_id, product_name, stock_quantity")
    .in("product_id", productIds);

  if (stockRes.error) {
    return { success: false, message: "Could not validate stock", status: 500 };
  }

  const stockMap = new Map<string, { stock: number; name: string }>();
  for (const row of stockRes.data || []) {
    stockMap.set(row.product_id, {
      stock: Number(row.stock_quantity) || 0,
      name: row.product_name || "Product",
    });
  }

  for (const [pid, info] of qtyByProductId.entries()) {
    const productStock = stockMap.get(pid);
    const available = productStock?.stock ?? 0;
    if (available <= 0) {
      return {
        success: false,
        message: `${productStock?.name || info.name} is out of stock`,
        status: 409,
      };
    }
    if (info.qty > available) {
      return {
        success: false,
        message: `${productStock?.name || info.name} has only ${available} in stock`,
        status: 409,
      };
    }
  }

  const totalAmount = cartData.reduce((sum, item) => {
    const price = Number(item.products?.final_price ?? 0);
    return sum + price * (Number(item.quantity) || 0);
  }, 0);

  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    return { success: false, message: "Invalid order amount", status: 400 };
  }

  return {
    success: true,
    data: {
      user,
      cartId,
      cartData,
      addressId,
      addressText: formatAddressText(address),
      totalAmount: Number(totalAmount.toFixed(2)),
      amountInPaise: Math.round(Number(totalAmount.toFixed(2)) * 100),
      lastAddedProductTime: cartData[0]?.added_at || null,
    },
  };
}

export async function createOrderWithItems(
  context: CheckoutContext,
  options: OrderCreationOptions = {}
): Promise<
  | { success: true; order: any; orderItemsPayload: any[] }
  | { success: false; message: string; status: number }
> {
  const orderPayload: Record<string, unknown> = {
    user_id: context.user.user_id,
    order_number: options.orderNumber || null,
    order_status: options.orderStatus || "pending",
    payment_status: options.paymentStatus || "pending",
    total_amount: context.totalAmount,
    shipping_address_id: context.addressId,
    address_text: context.addressText,
    transaction_id: options.transactionId || null,
  };
  if (options.couponCode != null && options.couponCode !== "") {
    orderPayload.coupon_code = options.couponCode;
  }

  const orderRes = await adminsupabase
    .from("orders")
    .insert(orderPayload)
    .select("*")
    .single();

  if (orderRes.error || !orderRes.data) {
    return { success: false, message: "Error creating order", status: 500 };
  }

  const orderItemsPayload = context.cartData.map((item) => {
    const unitPrice = Number(item.products?.final_price || 0);
    const quantity = Number(item.quantity) || 0;
    return {
      order_id: orderRes.data.order_id,
      product_id: item.product_id,
      quantity,
      unit_price: unitPrice,
      total_price: unitPrice * quantity,
    };
  });

  const orderItemsRes = await adminsupabase
    .from("order_items")
    .insert(orderItemsPayload);

  if (orderItemsRes.error) {
    await adminsupabase.from("orders").delete().eq("order_id", orderRes.data.order_id);
    return { success: false, message: "Failed to create order items", status: 500 };
  }

  revalidatePath("/admin/orders");
  return { success: true, order: orderRes.data, orderItemsPayload };
}
