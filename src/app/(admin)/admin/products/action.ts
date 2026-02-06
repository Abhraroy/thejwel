"use server";
import supabase from "@/lib/supabase/admin";

export async function getProducts() {
    const { data: productsData, error } = await supabase
        .from('products')
        .select('*, categories(*), sub_categories(*), product_images(*)')
        // Use a stable deterministic order so items don't "jump pages" when many rows share the same created_at
        .order('created_at', { ascending: false })
        .order('product_id', { ascending: false });

    if (error) {
        console.error('Error fetching products:', error);
        return { success: false, data: null, message: error.message };
    }
    return { success: true, data: productsData, message: "Products fetched successfully" };
}
