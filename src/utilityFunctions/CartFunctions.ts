import type {
  AnyCart,
  CartProduct,
  DbCart,
  DbCartItem,
  LocalCart,
  LocalCartItem,
} from "@/types/CartTypes";
import { SupabaseClient } from "@supabase/supabase-js";

             

export const addToLocalCart = (product: CartProduct): LocalCart => {
    console.log(product)
    console.log("Adding to local cart")
    let cartMap = new Map<string, LocalCartItem>();
    const product_obj: CartProduct = { ...product };
    
    const localCartItems = localStorage.getItem('cartItems')
    let localCartItemsArray: LocalCart = localCartItems ? JSON.parse(localCartItems) : [];
    // console.log("localCartItemsArray before adding product", localCartItemsArray)
    if(localCartItemsArray.length === 0){
        cartMap.set(product_obj.product_id,{products:product_obj,quantity:1})
    }
    else{
        localCartItemsArray.forEach((item: LocalCartItem) => {
            console.log("item",item)
            cartMap.set(item.products.product_id, item)
        })
        console.log("cartMap",cartMap)
        if(cartMap.has(product_obj.product_id)){
            console.log("Product already exists in cart")
            const existing = cartMap.get(product_obj.product_id);
            if (existing) existing.quantity += 1;
        }
        else{
            console.log("Product does not exist in cart adding new product")
            cartMap.set(product_obj.product_id, {products:product_obj,quantity:1})
        }
    }
    const updatedCart: LocalCart = Array.from(cartMap.values())
    console.log("updatedCart",updatedCart)
    localStorage.setItem("cartItems",JSON.stringify(updatedCart))
    return updatedCart;
}


export const removeFromLocalCart = (
  itemOrProduct: LocalCartItem | CartProduct
): LocalCart => {
    console.log("Removing from local cart")
    console.log("item/product to remove", itemOrProduct)
    let cartMap = new Map<string, LocalCartItem>();
    const localCartItems = localStorage.getItem('cartItems')
    let localCartItemsArray: LocalCart = localCartItems ? JSON.parse(localCartItems) : [];
    if(localCartItemsArray.length === 0){
        console.log("No items in cart")
        return localCartItemsArray;
    }
    else{
        // Get the product_id from the item structure
        // item can be {products: {...}, quantity: 1} or the product itself
        const productToRemove = (itemOrProduct as any)?.products ?? (itemOrProduct as any)?.product ?? itemOrProduct;
        const productIdToRemove = (productToRemove as any)?.product_id ?? (itemOrProduct as any)?.product_id;
        
        if(!productIdToRemove){
            console.log("No product_id found in item to remove")
            return localCartItemsArray;
        }
        
        localCartItemsArray.forEach((item: LocalCartItem) => {
            const itemProductId = item?.products?.product_id;
            if(itemProductId){
                cartMap.set(itemProductId, item)
            }
        })
        
        if(cartMap.has(productIdToRemove)){
            cartMap.delete(productIdToRemove)
            console.log("Item removed from cart")
        }
        else{
            console.log("Item not found in cart")
        }
    }
    localStorage.setItem("cartItems",JSON.stringify(Array.from(cartMap.values())))
    return Array.from(cartMap.values())
}

export const decreaseQuantityFromLocalCart = (
  itemOrProduct: LocalCartItem | CartProduct
): LocalCart => {
    console.log("Decreasing quantity from local cart")
    console.log("item/product to decrease", itemOrProduct)
    let cartMap = new Map<string, LocalCartItem>();
    const localCartItems = localStorage.getItem('cartItems')
    let localCartItemsArray: LocalCart = localCartItems ? JSON.parse(localCartItems) : [];
    if(localCartItemsArray.length === 0){
        console.log("No items in cart")
        return localCartItemsArray;
    }
    else{
        // Get the product_id from the item structure
        // item can be {products: {...}, quantity: 1} or the product itself
        console.log("item from localcart",itemOrProduct)
        const productToDecrease = (itemOrProduct as any)?.products ?? (itemOrProduct as any)?.product ?? itemOrProduct;
        const productIdToDecrease = (productToDecrease as any)?.product_id ?? (itemOrProduct as any)?.product_id;
        
        if(!productIdToDecrease){
            console.log("No product_id found in item to decrease")
            return localCartItemsArray;
        }
        
        localCartItemsArray.forEach((item: LocalCartItem) => {
            const itemProductId = item?.products?.product_id;
            if(itemProductId){
                cartMap.set(itemProductId, item)
            }
        })
        
        if(cartMap.has(productIdToDecrease)){
            const itemToUpdate = cartMap.get(productIdToDecrease);
            if(itemToUpdate && itemToUpdate.quantity > 1){
                itemToUpdate.quantity -= 1;
                cartMap.set(productIdToDecrease, itemToUpdate);
            }
            else{
                console.log("Quantity is already 1, cannot decrease further")
                return localCartItemsArray;
            }
        }
        else{
            console.log("Item not found in cart")
            return localCartItemsArray;
        }
    }
    localStorage.setItem("cartItems",JSON.stringify(Array.from(cartMap.values())))
    return Array.from(cartMap.values())
}


export const createCart = async(AuthUserId:string,supabase:SupabaseClient)=>{
    const {data,error} = await supabase.from("cart").insert({
        user_id:AuthUserId,
    }).select().single();
    if(error){
        console.log("error",error)
        return {success:false,error:error,message:"Failed to create cart"}
    }
    else{
        console.log("cart created",data)
        return {success:true,data:data,message:"Cart created successfully"}
    }
}


export const getCartData = async (CartId: string, supabase: SupabaseClient) => {
    const {data,error} = await supabase
    .from("cart_items")
    .select(`
        *,
    cart(*),
    products(*)
    `)
    .eq("cart_id",CartId)
    // Ensure stable ordering so UI list doesn't reorder on quantity updates
    .order("cart_item_id", { ascending: true })
    if(error){
        console.log("error",error)
        return {success:false,data:null,message:error.message}
    }
    else{
        console.log("cart data",data)
        return {success:true,data:(data as DbCart),message:"Cart data fetched successfully"}
    }
}












export type DbCartOpError = { success: false; error: unknown; message: string };
export type DbCartOpResult = DbCart | DbCartOpError;

type DbCartProductRef = { product_id: string };

const getProductIdFromInput = (input: DbCartItem | LocalCartItem | CartProduct | DbCartProductRef): string | null => {
  const fromItem = (input as any)?.product_id;
  if (typeof fromItem === "string" && fromItem) return fromItem;
  const fromLocal = (input as any)?.products?.product_id;
  if (typeof fromLocal === "string" && fromLocal) return fromLocal;
  const fromProduct = (input as any)?.product?.product_id;
  if (typeof fromProduct === "string" && fromProduct) return fromProduct;
  const fromPlain = (input as any)?.product_id;
  if (typeof fromPlain === "string" && fromPlain) return fromPlain;
  return null;
};

export const addToDbCart = async (
  product: CartProduct | DbCartProductRef,
  CartId: string,
  supabase: SupabaseClient
): Promise<DbCartOpResult> => {
    console.log("Adding to db cart")
    const pid = getProductIdFromInput(product as any);
    if (!pid) {
        return { success: false, error: null, message: "Missing product_id" };
    }
    console.log("product",pid)
    console.log("supabase",supabase)
    const productExistsInCart = await supabase.from("cart_items").select("*").eq("cart_id",CartId).eq("product_id",pid)
    console.log("Existence of product in cart",productExistsInCart)
    if(productExistsInCart.data && productExistsInCart.data.length > 0){
        console.log("product exists in cart")
        console.log("quantity before updating",productExistsInCart.data[0].quantity)
        const {data,error} = await supabase.from("cart_items").update({
            quantity:productExistsInCart.data[0].quantity + 1,
        }).eq("cart_id",CartId).eq("product_id",pid)
        if(error){
            console.log("error",error)
            return {success:false,error:error,message:"Failed to update cart item"}
        }
        else{
            console.log("cart item updated",data)
            const updatedCartItems = await getCartData(CartId,supabase)
            if(updatedCartItems.success){
                console.log("updatedCartItems from function ",updatedCartItems.data)
                return updatedCartItems.data as DbCart;
            }
            return { success: false, error: null, message: "Failed to get cart data" };
        }
    }
    else{
        console.log("product does not exist in cart")
        console.log("product",product)
        console.log("cartID",CartId)
        const {data,error} = await supabase.from("cart_items").insert({
            cart_id:CartId,
            product_id:pid,
            quantity:1,
        })
        if(error){
            console.log("error",error)
            return {success:false,error:error,message:"Failed to add to cart"}
        }
        else{
            console.log("cart item added",data)
            const updatedCartItems = await getCartData(CartId,supabase)
            if(updatedCartItems.success){
                console.log("updatedCartItems from function ",updatedCartItems.data)
                return updatedCartItems.data as DbCart;
            }
            return { success: false, error: null, message: "Failed to get cart data" };
        }
    }
    
}

/**
 * Returns the current quantity of a product in the cart (works for both DB cart item shape and local cart item shape)
 */
export const getCartQuantityForProduct = (
  cartItems: AnyCart | null | undefined,
  productId: string
): number => {
  if (!Array.isArray(cartItems) || !productId) return 0;
  let qty = 0;
  for (const item of cartItems) {
    // DB cart item: has cart_id + product_id on the item itself
    if ((item as any)?.cart_id) {
      if ((item as DbCartItem).product_id === productId) {
        qty += Number((item as DbCartItem).quantity ?? 1) || 0;
      }
      continue;
    }

    // Local cart item: product_id lives on item.products
    const local = item as LocalCartItem;
    if (local?.products?.product_id === productId) {
      qty += Number(local?.quantity ?? 1) || 0;
    }
  }
  return qty;
};


export const removeFromDbCart = async (
  itemOrProduct: DbCartItem | CartProduct,
  CartId: string,
  supabase: SupabaseClient
): Promise<DbCartOpResult> => {
    console.log("Removing from db cart")
    const pid = getProductIdFromInput(itemOrProduct as any);
    if (!pid) {
        return { success: false, error: null, message: "Missing product_id" };
    }
    console.log("product_id",pid)
    const {data,error} = await supabase.from("cart_items").delete().eq("cart_id",CartId).eq("product_id",pid)
    if(error){
        console.log("error",error)
        return {success:false,error:error,message:"Failed to remove from cart"}
    }
    else{
        console.log("cart item removed",data)
        const updatedCartItems = await getCartData(CartId,supabase)
        if(updatedCartItems.success){
            console.log("updatedCartItems from function ",updatedCartItems.data)
            return updatedCartItems.data as DbCart;
        }
        return { success: false, error: null, message: "Failed to get cart data" };
    }
}

export const decreaseQuantityFromDbCart = async (
  item: DbCartItem,
  CartId: string,
  supabase: SupabaseClient
): Promise<DbCartOpResult> => {
  console.log("Decreasing quantity from db cart");
  const pid = item?.product_id;
  if (!pid) return { success: false, error: null, message: "Missing product_id" };
  if (Number(item.quantity) <= 1) {
    const updatedCartItems = await getCartData(CartId, supabase);
    return updatedCartItems.success
      ? (updatedCartItems.data as DbCart)
      : { success: false, error: null, message: "Quantity is already 1" };
  }

  const nextQty = Math.max(Number(item.quantity) - 1, 1);
  const { data, error } = await supabase
    .from("cart_items")
    .update({ quantity: nextQty })
    .eq("cart_id", CartId)
    .eq("product_id", pid);
  console.log("data", data);

  if (error) {
    console.log("error", error);
    return { success: false, error: error, message: "Failed to decrease quantity from cart" };
  }

  const updatedCartItems = await getCartData(CartId, supabase);
  if (updatedCartItems.success) {
    return updatedCartItems.data as DbCart;
  }
  return { success: false, error: null, message: "Failed to get updated cart" };
};

// Calculate cart count from cart items array
export const calculateCartCount = (cartItems: AnyCart | any[]): number => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) return 0;
    return cartItems.reduce((sum: number, item: any) => sum + (item.quantity ?? 1), 0);
}

// Get cart items from local storage
export const getLocalCartItems = (): LocalCart => {
    if (typeof window === 'undefined') return [];
    const localCartItems = localStorage.getItem('cartItems');
    if (!localCartItems) return [];
    try {
        const cartItems: LocalCart = JSON.parse(localCartItems);
        return Array.isArray(cartItems) ? cartItems : [];
    } catch {
        return [];
    }
};

// Get cart count from local storage
export const getLocalCartCount = (): number => {
    if (typeof window === 'undefined') return 0;
    const localCartItems = localStorage.getItem('cartItems');
    if (!localCartItems) return 0;
    try {
        const cartItems: LocalCart = JSON.parse(localCartItems);
        return calculateCartCount(cartItems);
    } catch {
        return 0;
    }
}

// Get cart count from database
export const getDbCartCount = async (cartId: string, supabase: any): Promise<number> => {
    if (!cartId) return 0;
    const { data, error } = await supabase
        .from("cart_items")
        .select("quantity")
        .eq("cart_id", cartId);
    
    if (error || !data) return 0;
    return data.reduce((sum: number, item: any) => sum + (item.quantity ?? 0), 0);
}