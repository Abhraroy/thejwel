
export const addToLocalCart = (product: any) => {
    console.log(product)
    console.log("Adding to local cart")
    let cartMap = new Map();
    const product_obj = {
      ...product,
    }
    
    const localCartItems = localStorage.getItem('cartItems')
    let localCartItemsArray = localCartItems ? JSON.parse(localCartItems) : [];
    // console.log("localCartItemsArray before adding product", localCartItemsArray)
    if(localCartItemsArray.length === 0){
        cartMap.set(product_obj.product_id,{products:product_obj,quantity:1})
    }
    else{
        localCartItemsArray.forEach((item: any) => {
            console.log("item",item)
            cartMap.set(item.products.product_id, item)
        })
        console.log("cartMap",cartMap)
        if(cartMap.has(product_obj.product_id)){
            console.log("Product already exists in cart")
            cartMap.get(product_obj.product_id).quantity += 1
        }
        else{
            console.log("Product does not exist in cart adding new product")
            cartMap.set(product_obj.product_id, {products:product_obj,quantity:1})
        }
    }
    const updatedCart = Array.from(cartMap.values())
    console.log("updatedCart",updatedCart)
    localStorage.setItem("cartItems",JSON.stringify(updatedCart))
    return updatedCart;
}


export const removeFromLocalCart = (product:any)=>{
    console.log("Removing from local cart")
    console.log("product to remove", product)
    let cartMap = new Map();
    const localCartItems = localStorage.getItem('cartItems')
    let localCartItemsArray = localCartItems ? JSON.parse(localCartItems) : [];
    if(localCartItemsArray.length === 0){
        console.log("No items in cart")
        return localCartItemsArray;
    }
    else{
        // Get the product_id from the item structure
        // item can be {products: {...}, quantity: 1} or the product itself
        const productToRemove = product?.products ?? product?.product ?? product;
        const productIdToRemove = productToRemove?.product_id;
        
        if(!productIdToRemove){
            console.log("No product_id found in item to remove")
            return localCartItemsArray;
        }
        
        localCartItemsArray.forEach((item: any) => {
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

export const decreaseQuantityFromLocalCart = (product:any)=>{
    console.log("Decreasing quantity from local cart")
    console.log("product to decrease", product)
    let cartMap = new Map();
    const localCartItems = localStorage.getItem('cartItems')
    let localCartItemsArray = localCartItems ? JSON.parse(localCartItems) : [];
    if(localCartItemsArray.length === 0){
        console.log("No items in cart")
        return localCartItemsArray;
    }
    else{
        // Get the product_id from the item structure
        // item can be {products: {...}, quantity: 1} or the product itself
        const productToDecrease = product?.products ?? product?.product ?? product;
        const productIdToDecrease = productToDecrease?.product_id;
        
        if(!productIdToDecrease){
            console.log("No product_id found in item to decrease")
            return localCartItemsArray;
        }
        
        localCartItemsArray.forEach((item: any) => {
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


export const createCart = async(AuthUserId:string,supabase:any)=>{
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


export const getCartData = async(CartId:string,supabase:any)=>{
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
        return {success:true,data:data,message:"Cart data fetched successfully"}
    }
}












export const addToDbCart = async(product:any,CartId:string,supabase:any)=>{
    console.log("Adding to db cart")
    console.log("product",product.product_id)
    console.log("supabase",supabase)
    const productExistsInCart = await supabase.from("cart_items").select("*").eq("cart_id",CartId).eq("product_id",product.product_id)
    console.log("Existence of product in cart",productExistsInCart)
    if(productExistsInCart.data && productExistsInCart.data.length > 0){
        console.log("product exists in cart")
        console.log("quantity before updating",productExistsInCart.data[0].quantity)
        const {data,error} = await supabase.from("cart_items").update({
            quantity:productExistsInCart.data[0].quantity + 1,
        }).eq("cart_id",CartId).eq("product_id",product.product_id)
        if(error){
            console.log("error",error)
            return {success:false,error:error,message:"Failed to update cart item"}
        }
        else{
            console.log("cart item updated",data)
            const updatedCartItems = await getCartData(CartId,supabase)
            if(updatedCartItems.success){
                console.log("updatedCartItems from function ",updatedCartItems.data)
                return updatedCartItems.data;
            }
            else{
                // console.log("error",updatedCartItems.error)
                // return {success:false,error:updatedCartItems.error,message:"Failed to get cart data"}
            }
        }
    }
    else{
        console.log("product does not exist in cart")
        console.log("product",product)
        console.log("cartID",CartId)
        const {data,error} = await supabase.from("cart_items").insert({
            cart_id:CartId,
            product_id:product.product_id,
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
                return updatedCartItems.data;
            }
            else{
                // console.log("error",updatedCartItems.error)
                // return {success:false,error:updatedCartItems.error,message:"Failed to get cart data"}
            }
        }
    }
    
}

/**
 * Returns the current quantity of a product in the cart (works for both DB cart item shape and local cart item shape)
 */
export const getCartQuantityForProduct = (cartItems: any[] | null | undefined, productId: string): number => {
    if (!Array.isArray(cartItems) || !productId) return 0;
    let qty = 0;
    for (const item of cartItems) {
        const pid =
            item?.product_id ||
            item?.products?.product_id ||
            item?.product?.product_id ||
            item?.products?.id ||
            item?.product?.id;
        if (pid === productId) {
            qty += Number(item?.quantity ?? 1) || 0;
        }
    }
    return qty;
};


export const removeFromDbCart = async(product:any,CartId:string,supabase:any)=>{
    console.log("Removing from db cart")
    console.log("product",product.product_id)
    const {data,error} = await supabase.from("cart_items").delete().eq("cart_id",CartId).eq("product_id",product.product_id)
    if(error){
        console.log("error",error)
        return {success:false,error:error,message:"Failed to remove from cart"}
    }
    else{
        console.log("cart item removed",data)
        const updatedCartItems = await getCartData(CartId,supabase)
        if(updatedCartItems.success){
            console.log("updatedCartItems from function ",updatedCartItems.data)
            return updatedCartItems.data;
        }
        else{
            // console.log("error",updatedCartItems.error)
            // return {success:false,error:updatedCartItems.error,message:"Failed to get cart data"}
        }
    }
}

export const decreaseQuantityFromDbCart = async(product:any,CartId:string,supabase:any)=>{
    console.log("Decreasing quantity from db cart")
    console.log("product",product.product_id)
    const {data,error} = await supabase.from("cart_items").update({
        quantity:product.quantity - 1,
    }).eq("cart_id",CartId).eq("product_id",product.product_id)
    console.log("data",data)
    if(error){
        console.log("error",error)
        return {success:false,error:error,message:"Failed to decrease quantity from cart"}
    }
    else{
        console.log("cart item quantity decreased",data)
        const updatedCartItems = await getCartData(CartId,supabase)
        if(updatedCartItems.success){
            console.log("updatedCartItems from function ",updatedCartItems.data)
            return updatedCartItems.data;
        }
        else{
            // console.log("error",updatedCartItems.error)
            // return {success:false,error:updatedCartItems.error,message:"Failed to get cart data"}
        }
    }
}

// Calculate cart count from cart items array
export const calculateCartCount = (cartItems: any[]): number => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) return 0;
    return cartItems.reduce((sum: number, item: any) => sum + (item.quantity ?? 1), 0);
}

// Get cart count from local storage
export const getLocalCartCount = (): number => {
    if (typeof window === 'undefined') return 0;
    const localCartItems = localStorage.getItem('cartItems');
    if (!localCartItems) return 0;
    try {
        const cartItems = JSON.parse(localCartItems);
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