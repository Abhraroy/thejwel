

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.addresses (
  address_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  address_type character varying CHECK (address_type::text = ANY (ARRAY['billing'::character varying, 'shipping'::character varying]::text[])),
  street_address text NOT NULL,
  city character varying NOT NULL,
  state character varying NOT NULL,
  postal_code character varying NOT NULL,
  country character varying NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  address_line1 text,
  address_line2 text,
  CONSTRAINT addresses_pkey PRIMARY KEY (address_id),
  CONSTRAINT addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.admin_key (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  key text,
  admin uuid DEFAULT auth.uid(),
  created_at timestamp with time zone,
  CONSTRAINT admin_key_pkey PRIMARY KEY (id)
);
CREATE TABLE public.cart (
  cart_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT cart_pkey PRIMARY KEY (cart_id),
  CONSTRAINT cart_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.cart_items (
  cart_item_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  cart_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  added_at timestamp without time zone DEFAULT now(),
  size text,
  CONSTRAINT cart_items_pkey PRIMARY KEY (cart_item_id),
  CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.cart(cart_id),
  CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id)
);
CREATE TABLE public.categories (
  category_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  category_name character varying NOT NULL,
  slug character varying NOT NULL UNIQUE,
  description text,
  category_image_url text,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (category_id)
);
CREATE TABLE public.coupons (
  coupon_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  coupon_code character varying NOT NULL UNIQUE,
  description text,
  discount_type character varying CHECK (discount_type::text = ANY (ARRAY['percentage'::character varying, 'fixed'::character varying]::text[])),
  discount_value numeric NOT NULL,
  min_purchase_amount numeric DEFAULT 0,
  max_discount_amount numeric,
  usage_limit integer,
  usage_count integer DEFAULT 0,
  valid_from timestamp without time zone NOT NULL,
  valid_until timestamp without time zone NOT NULL,
  is_active boolean DEFAULT true,
  CONSTRAINT coupons_pkey PRIMARY KEY (coupon_id)
);
CREATE TABLE public.order_items (
  order_item_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL,
  product_id uuid,
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  ordered_at timestamp without time zone DEFAULT now(),
  CONSTRAINT order_items_pkey PRIMARY KEY (order_item_id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id),
  CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id)
);
CREATE TABLE public.orders (
  order_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  order_number character varying UNIQUE,
  order_status character varying DEFAULT NULL::character varying,
  payment_status character varying NOT NULL DEFAULT NULL::character varying,
  tax_amount numeric DEFAULT 0,
  total_amount numeric NOT NULL,
  shipping_address_id uuid,
  order_date timestamp without time zone DEFAULT now(),
  shipped_date timestamp without time zone,
  delivered_date timestamp without time zone,
  merchant_order_id character varying,
  transaction_id character varying,
  address_text text,
  CONSTRAINT orders_pkey PRIMARY KEY (order_id),
  CONSTRAINT orders_shipping_address_id_fkey FOREIGN KEY (shipping_address_id) REFERENCES public.addresses(address_id),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.payments (
  payment_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL,
  payment_method character varying NOT NULL,
  transaction_id character varying,
  amount numeric NOT NULL,
  payment_status character varying DEFAULT 'pending'::character varying,
  payment_date timestamp without time zone DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (payment_id),
  CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id)
);
CREATE TABLE public.product_images (
  image_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  product_id uuid NOT NULL,
  image_url text NOT NULL,
  CONSTRAINT product_images_pkey PRIMARY KEY (image_id),
  CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id)
);
CREATE TABLE public.products (
  product_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  category_id uuid,
  product_name character varying NOT NULL,
  description text,
  base_price numeric NOT NULL,
  discount_percentage numeric DEFAULT 0,
  final_price numeric NOT NULL,
  stock_quantity integer DEFAULT 0,
  weight_grams numeric,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  subcategory_id uuid,
  thumbnail_image text,
  size ARRAY,
  tags ARRAY,
  occasion text,
  collection text,
  listed_status boolean DEFAULT false,
  sku text UNIQUE,
  CONSTRAINT products_pkey PRIMARY KEY (product_id),
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(category_id),
  CONSTRAINT products_subcategory_id_fkey FOREIGN KEY (subcategory_id) REFERENCES public.sub_categories(subcategory_id)
);
CREATE TABLE public.review_images (
  review_image_id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  review_id uuid NOT NULL,
  review_image_url text,
  CONSTRAINT review_images_pkey PRIMARY KEY (review_image_id),
  CONSTRAINT review_images_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.reviews(review_id)
);
CREATE TABLE public.reviews (
  review_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  product_id uuid NOT NULL,
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title character varying,
  review_text text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (review_id),
  CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id),
  CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.sub_categories (
  subcategory_id uuid NOT NULL DEFAULT gen_random_uuid(),
  category_id uuid DEFAULT gen_random_uuid(),
  subcategory_name text,
  subcategory_image_url text,
  is_active boolean DEFAULT true,
  CONSTRAINT sub_categories_pkey PRIMARY KEY (subcategory_id),
  CONSTRAINT sub_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(category_id)
);
CREATE TABLE public.users (
  user_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  email character varying UNIQUE,
  password_hash character varying,
  first_name character varying,
  last_name character varying,
  phone_number character varying UNIQUE,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (user_id)
);
CREATE TABLE public.wishlist (
  wishlist_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  CONSTRAINT wishlist_pkey PRIMARY KEY (wishlist_id),
  CONSTRAINT wishlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.wishlist_items (
  wishlist_item_id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  wishlist_id uuid,
  product_id uuid,
  CONSTRAINT wishlist_items_pkey PRIMARY KEY (wishlist_item_id),
  CONSTRAINT wishlist_items_wishlist_id_fkey FOREIGN KEY (wishlist_id) REFERENCES public.wishlist(wishlist_id),
  CONSTRAINT wishlist_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id)
);