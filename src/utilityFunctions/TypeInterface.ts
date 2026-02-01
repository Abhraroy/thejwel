export interface Product {
product_id: string;
  category_id: string;
  product_name: string;
  description: string;
  base_price: number;
  discount_percentage: number;
  final_price: number;
  stock_quantity: number;
  weight_grams: number;
  created_at: string;
  updated_at: string;
  subcategory_id: string;
  thumbnail_image: string;
  sub_images_id: string;
  size: string;
  collection: string;
  occasion: string;
}