"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/zustandStore/zustandStore";

interface PhonePeProps {
  redirectUrl: string;
  onPaymentInitiated?: () => void;
}

export default function PhonePe({ redirectUrl, onPaymentInitiated }: PhonePeProps) {
  const [sdkReady, setSdkReady] = useState(false);
  const router = useRouter();
  const {
    initiatingCheckout,
    setInitiatingCheckout,
    setPaymentConcluded,
    setShowPaymentConcluded
  } = useStore();

  /** Callback handler from PhonePe - stored globally to persist after component unmounts */
  const createCallback = () => {
    return (response: string) => {
      console.log("PhonePe Callback Response:", response);

      // Get store state directly to ensure it works even after component unmounts
      const store = useStore.getState();

      if (response === "USER_CANCEL") {
        console.log("User cancelled payment");
        // Payment was cancelled/failed
        store.setPaymentConcluded(false);
        store.setShowPaymentConcluded(true);
        store.setInitiatingCheckout(false);
        return;
      }
      if (response === "CONCLUDED") {
        console.log("Payment concluded successfully");
        // Payment was successful
        // store.setPaymentConcluded(true);
        // store.setShowPaymentConcluded(true);
        // store.setInitiatingCheckout(false);
        router.push("/redirect");
        return;
      }
    };
  };

  /** Wait for PhonePeCheckout SDK initialization */
  const waitForSDKReady = () => {
    let tries = 0;

    const check = () => {
      const SDK = (window as any).PhonePeCheckout;

      if (SDK) {
        console.log("🔥 PhonePe SDK initialized!");
        setSdkReady(true);
        return;
      }

      tries++;
      if (tries > 40) {
        console.error("❌ PhonePe SDK failed to initialize");
        return;
      }

      setTimeout(check, 80);
    };

    check();
  };

  /** Check if SDK is already loaded when component mounts */
  useEffect(() => {
    // Check if SDK is already available (from previous load)
    const SDK = (window as any).PhonePeCheckout;
    if (SDK) {
      console.log("🔥 PhonePe SDK already available!");
      setSdkReady(true);
    }
  }, []);

  /** When redirectUrl or script loads */
  useEffect(() => {
    console.log("Token URL received:", redirectUrl);
  }, [redirectUrl]);

  /** It will be called when user clicks pay */
  const initiatePayment = () => {
    if (!sdkReady) {
      alert("PhonePe is still loading… please wait");
      return;
    }

    const PhonePeCheckout = (window as any).PhonePeCheckout;

    console.log("Sending tokenUrl to PhonePe:", redirectUrl);

    // Create callback that persists even after component unmounts
    const paymentCallback = createCallback();
    
    // Store callback in window to ensure it persists
    (window as any).__phonePeCallback = paymentCallback;

    PhonePeCheckout.transact({
      tokenUrl: redirectUrl,
      type: "IFRAME",
      callback: paymentCallback,
    });

    // Reset all state and close modal as soon as PhonePe checkout opens
    if (onPaymentInitiated) {
      onPaymentInitiated();
    }
  };

  return (
    <>
      {/** Load PhonePe Checkout Script */}
      <Script
        src="https://mercury.phonepe.com/web/bundle/checkout.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("📦 PhonePe script loaded");
          // Check if SDK is already available, otherwise wait for it
          const SDK = (window as any).PhonePeCheckout;
          if (SDK) {
            console.log("🔥 PhonePe SDK available after script load!");
            setSdkReady(true);
          } else {
            waitForSDKReady();
          }
        }}
      />

      <button
        disabled={!sdkReady}
        onClick={initiatePayment}
        className={`w-full px-4 py-2.5 rounded-lg text-white font-semibold transition-all duration-200 text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none ${
          sdkReady ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800" : "bg-gray-400"
        }`}
      >
        {sdkReady ? "Pay with PhonePe" : "Loading PhonePe…"}
      </button>
    </>
  );
}
