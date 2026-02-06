import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/lib/supabase/server";
import { getAuthToken } from "@/app/utils/Phonepe";
import { redis } from "@/app/utils/Redis";
let cachedToken = {
  access_token: null,
  expires_at: null,
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  let totalAmount = 0;
  let amountInPaise = 0;
  let user_id = null;
  let cart_id = null;
  let lastAddedProductTime = null;
  let address_id = null;
  let cartData = null;
  let address_data = null;
  let address_text = null;

  // Get address_id from request body
  try {
    const body = await request.json();
    if (!body?.address_id) {
      return NextResponse.json(
        { message: "Shipping address is required" },
        { status: 400 }
      );
    }
    address_id = body.address_id || null;
    console.log("Address ID received:", address_id);
    address_data = await supabase
      .from("addresses")
      .select("*")
      .eq("address_id", address_id)
      .single();
    console.log("address_data", address_data?.data);
    if (address_data?.data) {
      address_text = `${address_data?.data?.street_address}, ${address_data?.data?.address_line1}, ${address_data?.data?.address_line2}, ${address_data?.data?.city}, ${address_data?.data?.state} - ${address_data?.data?.postal_code}`;
    }
  } catch (error) {
    console.log("No address_id in request body or invalid JSON");
    return NextResponse.json(
      { message: "No address_id in request body or invalid JSON" },
      { status: 400 }
    );
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { message: "User is not authenticated found" },
      { status: 404 }
    );
  }
  if (user) {
    const userData = await supabase
      .from("users")
      .select("*, cart(*)")
      .eq("phone_number", "+" + user.phone)
      .single();
    console.log("userData", userData);
    if (userData.error) {
      return NextResponse.json(
        { message: "User is not found" },
        { status: 404 }
      );
    }
    if (!userData.error && userData.data) {
      const userDataResult = userData.data as any;
      if (userDataResult.cart) {
        user_id = userDataResult.user_id;
        cart_id = userDataResult.cart?.cart_id;
        if (cart_id) {
          cartData = await supabase
            .from("cart_items")
            .select(
              `
                product_id,
                quantity,
                added_at,
                products(
                final_price
                )
              `
            )
            .eq("cart_id", cart_id)
            .order("added_at", { ascending: false });
          console.log("cartData", cartData);
          console.log("cartdata products", cartData?.data?.[0]?.products);
          if (!cartData?.data || cartData.data.length === 0) {
            return NextResponse.json(
              { message: "Cart is empty" },
              { status: 400 }
            );
          }

          lastAddedProductTime = cartData?.data?.[0]?.added_at;
          if (cartData && cartData.error) {
            console.error("Error fetching cart data:", cartData.error);
          }
          if (cartData && cartData.data && cartData.data.length > 0) {
            totalAmount = cartData.data.reduce((sum: number, item: any) => {
              if (item.products && item.products.final_price) {
                return sum + item.products.final_price * item.quantity;
              }
              return sum;
            }, 0);
            console.log("totalAmount", totalAmount);
            if (totalAmount <= 0) {
              return NextResponse.json(
                { message: "Invalid order amount" },
                { status: 400 }
              );
            }
            amountInPaise = Math.round(Number(totalAmount.toFixed(2)) * 100);
          }
        }
      }
    }
  }

  const merchantOrderId = uuidv4();

  

  const sandbox = "https://api-preprod.phonepe.com/apis/pg-sandbox";

 
  const authToken = await getAuthToken();
  if (!authToken) {
    return NextResponse.json(
      { message: "Error getting auth token" },
      { status: 500 }
    );
  }
  redis.set(merchantOrderId, authToken, {
    ex: 1200,
  });
    const payment_requestHeaders = {
    "Content-Type": "application/json",
    Authorization: `O-Bearer ${authToken}`,
  };

 

  const orderData = {
    user_id: user_id,
    merchant_order_id: merchantOrderId,
    order_status: "pending",
    payment_status: "pending",
    total_amount: amountInPaise / 100,
    shipping_address_id: address_id,
    address_text: address_text,
  };
  if (
    !cartData ||
    cartData.error ||
    !cartData.data ||
    cartData.data.length === 0
  ) {
    console.log("Error in cart data, no order created");
    return NextResponse.json(
      { message: "Error in cart data, no order created" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("orders")
    .insert(orderData)
    .select("*")
    .single();
  if (error) {
    console.log("error", error);
    return NextResponse.json(
      { message: "Error creating order" },
      { status: 500 }
    );
  }




  // Create order items for each cart item
  const orderItemsPayload = cartData.data.map((item: any) => ({
    order_id: data.order_id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.products?.final_price || 0,
    total_price: (item.products?.final_price || 0) * item.quantity,
  }));

  console.log("orderItemsPayload", orderItemsPayload);
  
  const { error: orderItemsError } = await supabase
    .from("order_items")
    .insert(orderItemsPayload);
  
  if (orderItemsError) {
    return NextResponse.json(
      { message: "Failed to create order items" },
      { status: 500 }
    );
  }


  const payment_requestBody = {
    amount: amountInPaise,
    expireAfter: 1200,
    metaInfo: {
      udf1: user_id,
      udf2: merchantOrderId,
      udf3: totalAmount,
      udf4: lastAddedProductTime || "additional-information-4",
      udf5: cart_id || "additional-information-5",
      udf6: address_id || "additional-information-6",
      udf7: address_text || null,
      udf8: "additional-information-8",
      udf9: "additional-information-9",
      udf10: "additional-information-10",
      udf11: "additional-information-11",
      udf12: "additional-information-12",
      udf13: "additional-information-13",
      udf14: "additional-information-14",
      udf15: "additional-information-15",
    },
    paymentFlow: {
      type: "PG_CHECKOUT",
      message: "Payment message used for collect requests",
      merchantUrls: {
        redirectUrl:
          "https://following-blessed-fold-edgar.trycloudflare.com/redirect",
      },
    },

    merchantOrderId: merchantOrderId,
    paymentModeConfig: {
      enabledPaymentModes: [
        {
          type: "UPI_INTENT",
        },
        {
          type: "UPI_COLLECT",
        },
        {
          type: "UPI_QR",
        },
        {
          type: "NET_BANKING",
        },
        {
          type: "CARD",
          cardTypes: ["DEBIT_CARD", "CREDIT_CARD"],
        },
      ],
    },
  };
  


  console.log(
    "Order Payload Sent:",
    JSON.stringify(payment_requestBody, null, 2)
  );
  console.log(
    "Order Headers Sent:",
    JSON.stringify(payment_requestHeaders, null, 2)
  );

  try{
  const payment_res = await axios.post(
    sandbox + "/checkout/v2/pay",
    payment_requestBody,
    { headers: payment_requestHeaders }
  );
  console.log("payment_res", payment_res.data);
  if (payment_res.data && payment_res.data.orderId) {
    const payment_res_phonepay = await supabase
      .from("orders")
      .update({
        order_number: payment_res.data.orderId,
        payment_status: "pending",
      })
      .eq("order_id", data.order_id);
  } else {
    console.log("No orderId in response, skipping order update");
  }
  return NextResponse.json(
    { data: payment_res.data, merchantOrderId: merchantOrderId },
    { status: 200 }
  );
  } catch (error) {
    console.log("error", error);
    return NextResponse.json(
      { message: "Error creating payment", error: error },
      { status: 500, }
    );
  }
}
