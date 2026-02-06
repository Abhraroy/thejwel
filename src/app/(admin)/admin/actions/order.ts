"use server";

import supabase from "@/lib/supabase/admin";



type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";
  interface Order {
    order_id: string;
    merchant_order_id?: string | null;
    user_id: string | null;
    order_date: string;
    shipped_date?: string | null;
    delivered_date?: string | null;
    total_amount: number;
    order_status: OrderStatus;
    shipping_address_id?: string | null;
    shipping?: {
      full_name?: string;
      street_address?: string;
      address_line1?: string;
      address_line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
      phone_number?: string;
    } | null;
    users?: {
      first_name?: string;
      last_name?: string;
      phone_number?: string;
      email?: string;
    } | null;
    order_items?: Array<{
      order_item_id: string;
      order_id?: string;
      ordered_at?: string;
      quantity: number;
      unit_price?: number;
      total_price?: number;
      price?: number;
      products?: {
        product_name?: string;
        final_price?: number;
        base_price?: number;
        discount_percentage?: number;
      } | null;
    }> | null;
  }


const statusDateField: Partial<Record<OrderStatus, keyof Order>> = {
    shipped: "shipped_date",
    delivered: "delivered_date",
  };






export async function updateOrdersStatus(orderId: string, status: string) {
    try {
        const dateField = statusDateField[status as OrderStatus];
        if (!dateField) {
            return { success: false, data: null, message: "Invalid status" };
        }
        const timestamp = dateField ? new Date().toISOString() : undefined;
        const updatePayload: Partial<Order> = {
            order_status: status as OrderStatus,
            ...(dateField && timestamp ? { [dateField]: timestamp } : {}),
        };
        const { data, error } = await supabase
            .from("orders")
            .update(updatePayload)
            .eq("order_id", orderId);
        if (error) {
            console.error("Error updating order status:", error);
            return { success: false, data: null, message: error.message };
        }
        return { success: true, data: data, message: "Order status updated successfully" };
    } catch (error) {
        console.error("Error updating order status:", error);
        return { success: false, data: null, message: error instanceof Error ? error.message : "Failed to update order status" };
    }
}