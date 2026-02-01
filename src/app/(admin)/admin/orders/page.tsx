import { createClient } from "@/app/utils/supabase/server";
import Orders from "../../../../components/AdminComponents/order/Orders";

export default async function OrdersPage() {
  const supabase = await createClient();
  
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
    return (
      <div className="w-full p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error fetching orders: {error.message}</p>
        </div>
      </div>
    );
  }

  return <Orders initialOrders={ordersData ?? []} />;
}
