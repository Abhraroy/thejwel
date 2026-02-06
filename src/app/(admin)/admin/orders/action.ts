"use server";
import supabase from "@/lib/supabase/admin";

export async function getOrders() {
    const { data: ordersData, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      users(*),
      shipping:addresses!orders_shipping_address_id_fkey(*),
      order_items(*, products(*))
    `
    )
    .order("order_date", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Error fetching orders:", error);
    return { success: false, data: null, message: error.message };
  }
  return { success: true, data: ordersData, message: "Orders fetched successfully" };
}


