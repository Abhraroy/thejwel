"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useStore } from "@/zustandStore/zustandStore";

// Icon Components
const CheckCircleIcon = ({ className = "w-16 h-16" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const XCircleIcon = ({ className = "w-16 h-16" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const SpinnerIcon = ({ className = "w-16 h-16" }) => (
  <svg
    className={`animate-spin ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export default function RedirectPage() {
  const [status, setStatus] = useState<"pending" | "completed" | "failed">("pending");
  const [countdown, setCountdown] = useState(5);
  const {
    setInitiatingCheckout,
    setPaymentConcluded,
    setShowPaymentConcluded,
  } = useStore();
  const router = useRouter();

  useEffect(() => {
    const merchantOrderId = localStorage.getItem("merchantOrderId");
    if (!merchantOrderId) {
      // No order ID found, treat as failed
      setStatus("failed");
      setPaymentConcluded(false);
      setShowPaymentConcluded(true);
      setInitiatingCheckout(false);
      return;
    }
    const checkOrderStatus = async () => {
      try {
        const res = await axios.get(
          `/api/payment/confirm?merchantOrderId=${merchantOrderId}`
        );
        console.log("res", res);
        
        // Safely access the response data
        const state = res.data?.orderStatusResponse?.state;
        
        if (state === "COMPLETED") {
          setStatus("completed");
          setPaymentConcluded(true);
          setShowPaymentConcluded(true);
          setInitiatingCheckout(false);
        } else if (state === "FAILED") {
          setStatus("failed");
          setPaymentConcluded(false);
          setShowPaymentConcluded(true);
          setInitiatingCheckout(false);
        } else if (state === "PENDING") {
          setTimeout(() => {
            checkOrderStatus();
          }, 1000);
        } else {
          // Unknown state, treat as failed
          console.error("Unknown payment state:", state);
          setStatus("failed");
          setPaymentConcluded(false);
          setShowPaymentConcluded(true);
          setInitiatingCheckout(false);
        }
      } catch (error: any) {
        // Handle all errors gracefully (404, network errors, etc.)
        console.error("Error checking order status:", error?.response?.status || error?.message || error);
        setStatus("failed");
        setPaymentConcluded(false);
        setShowPaymentConcluded(true);
        setInitiatingCheckout(false);
      }
    };
    checkOrderStatus();
  }, [setInitiatingCheckout, setPaymentConcluded, setShowPaymentConcluded]);

  // Countdown and redirect for completed/failed states
  useEffect(() => {
    if (status === "completed" || status === "failed") {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        router.push("/");
      }
    }
  }, [status, countdown, router]);

  const getStatusConfig = () => {
    switch (status) {
      case "completed":
        return {
          icon: <CheckCircleIcon className="w-20 h-20 text-[#0A0239]" />,
          title: "Payment Successful!",
          subtitle: "Your order has been confirmed",
          description:
            "Thank you for your purchase! Your order is being processed and you will receive a confirmation email shortly.",
          badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
          badgeText: "Completed",
          bgGradient: "from-emerald-50 to-teal-50",
          accentColor: "emerald",
        };
      case "failed":
        return {
          icon: <XCircleIcon className="w-20 h-20 text-[#0A0239]" />,
          title: "Payment Failed",
          subtitle: "Something went wrong",
          description:
            "We couldn't process your payment. Please try again or use a different payment method. Your cart items are still saved.",
          badgeClass: "bg-red-100 text-red-700 border-red-200",
          badgeText: "Failed",
          bgGradient: "from-red-50 to-rose-50",
          accentColor: "red",
        };
      default:
        return {
          icon: <SpinnerIcon className="w-20 h-20 text-[#0A0239]" />,
          title: "Processing Payment",
          subtitle: "Please wait...",
          description:
            "We're verifying your payment with our payment partner. This usually takes a few seconds. Please don't close this page.",
          badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
          badgeText: "Verifying",
          bgGradient: "from-amber-50 to-yellow-50",
          accentColor: "amber",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${config.bgGradient} flex items-center justify-center px-4 py-8`}
    >
      <div className="w-full max-w-lg">
        {/* Main Card */}
        <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
          {/* Status Icon Section */}
          <div className="pt-10 pb-6 flex flex-col items-center">
            <div
              className={`p-4 rounded-full ${
                status === "completed"
                  ? "bg-emerald-50"
                  : status === "failed"
                  ? "bg-red-50"
                  : "bg-amber-50"
              }`}
            >
              {config.icon}
            </div>
          </div>

          {/* Content Section */}
          <div className="px-6 sm:px-8 pb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {config.title}
              </h1>
            </div>

            <p className="text-gray-500 font-medium mb-4">{config.subtitle}</p>

            <span
              className={`inline-flex px-4 py-1.5 text-sm font-semibold rounded-full border ${config.badgeClass}`}
            >
              {config.badgeText}
            </span>

            <p className="mt-6 text-gray-600 text-sm sm:text-base leading-relaxed">
              {config.description}
            </p>

            {/* Countdown for completed/failed */}
            {(status === "completed" || status === "failed") && (
              <p className="mt-4 text-sm text-gray-500">
                Redirecting to home in{" "}
                <span className="font-bold text-gray-700">{countdown}</span>{" "}
                seconds...
              </p>
            )}

            {/* Progress dots for pending */}
            {status === "pending" && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="px-6 sm:px-8 pb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              {status === "completed" && (
                <>
                  <Link
                    href="/account"
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white px-5 py-3 text-sm font-semibold hover:bg-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-200"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                      />
                    </svg>
                    View Orders
                  </Link>
                  <Link
                    href="/"
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 text-gray-700 px-5 py-3 text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                  >
                    Continue Shopping
                  </Link>
                </>
              )}

              {status === "failed" && (
                <>
                  <button
                    onClick={() => {
                      setStatus("pending");
                      // Retry payment logic could go here
                      router.push("/");
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 text-white px-5 py-3 text-sm font-semibold hover:bg-red-700 transition-all duration-200 shadow-lg shadow-red-200"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                      />
                    </svg>
                    Try Again
                  </button>
                  <Link
                    href="/"
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 text-gray-700 px-5 py-3 text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                  >
                    Go Home
                  </Link>
                </>
              )}

              {status === "pending" && (
                <div className="w-full text-center">
                  <p className="text-sm text-gray-500 mb-3">
                    Please wait while we verify your payment...
                  </p>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full animate-pulse w-2/3" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Having issues?{" "}
          <a
            href="mailto:support@example.com"
            className="text-gray-700 font-medium hover:underline"
          >
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
