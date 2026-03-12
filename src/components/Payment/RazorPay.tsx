"use client";

import Script from "next/script";
import { useState } from "react";
import { toAbsoluteUrl } from "@/lib/seo/metadata";

interface RazorPayProps {
    /** Amount in rupees */
    amount: number;
    /** Razorpay order id returned from your backend (e.g. `razorpay_order_id`) */
    razorpayOrderId: string;
    /** Display name on the Razorpay widget */
    name?: string;
    /** Description shown on the widget */
    description?: string;
    /** Logo URL */
    image?: string;
    /** Prefill customer info (name, email, contact) per Razorpay API */
    prefill?: { name?: string; email?: string; contact?: string };
    /** Optional callback URL for server-side verification */
    callbackUrl?: string;
    /** Called when payment succeeds (client-side) */
    onSuccess?: (response: { razorpay_payment_id: string; razorpay_order_id: string, razorpay_signature: string }) => void;
    /** Called when payment fails or user closes popup */
    onClose?: () => void;
    /** Called as soon as the Razorpay popup is opened */
    onPaymentInitiated?: () => void;
}

export default function RazorPayButton({
    amount,
    razorpayOrderId,
    name = "TheJWEL",
    description = "Order Payment",
    image,
    prefill,
    callbackUrl,
    onSuccess,
    onClose,
    onPaymentInitiated,
}: RazorPayProps) {
    const [sdkReady, setSdkReady] = useState(false);

    const initiatePayment = async () => {
        const RazorpayConstructor = (window as any).Razorpay;

        if (!RazorpayConstructor) {
            alert("Razorpay is still loading… please wait");
            return;
        }

        const options: Record<string, unknown> = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
            amount: Math.round(amount * 100), // convert rupees to paise
            currency: "INR",
            name,
            description,
            image: "https://pub-6da66eab69fe457ca97348b35f86f86b.r2.dev/resources/logo/cropped-logo.svg",
            order_id: razorpayOrderId,
            theme: {
                color: "#3399cc",
            },
            config: {
                display: {
                    blocks: {
                        banks: {
                            name: 'Pay via UPI',
                            instruments: [
                                {
                                    method: 'upi',
                                    flows: ["qr"],
                                    apps: ["google_pay", "phonepe"]
                                }
                            ],
                        },
                    },
                    sequence: ['block.banks'],
                    preferences: {
                        show_default_blocks: true,
                    },
                },
            }
        };
        if (prefill?.name || prefill?.email || prefill?.contact) {
            options.prefill = {
                ...(prefill.name && { name: prefill.name }),
                ...(prefill.email && { email: prefill.email }),
                ...(prefill.contact && { contact: prefill.contact }),
            };
        }
        if (callbackUrl) options.callback_url = callbackUrl;
        if (onSuccess) {
            options.handler = async (response: { razorpay_payment_id: string; razorpay_order_id: string, razorpay_signature: string }) => {
                const verifyRes = await fetch("/api/payment/verify-payment", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature
                    })
                })

                const data = await verifyRes.json() as { success: boolean }

                if (data.success) {
                    onSuccess(response as { razorpay_payment_id: string; razorpay_order_id: string, razorpay_signature: string })
                } else {
                    alert("Payment verification failed")
                }
            };
        }
        if (onClose) options.modal = { ondismiss: onClose };

        const paymentObject = new RazorpayConstructor(options);
        if (onPaymentInitiated) {
            onPaymentInitiated();
        }
        paymentObject.open();
    };

    return (
        <>
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="afterInteractive"
                onLoad={() => {
                    setSdkReady(true);
                }}
                onError={() => {
                    setSdkReady(false);
                    alert("Razorpay failed to load!!");
                }}
            />

            <button
                disabled={!sdkReady}
                onClick={initiatePayment}
                className={`w-full px-4 py-2.5 rounded-lg text-white font-semibold transition-all duration-200 text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none ${sdkReady
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                    : "bg-gray-400"
                    }`}
            >
                {sdkReady ? "Pay with Razorpay" : "Loading Razorpay…"}
            </button>
        </>
    );
}
