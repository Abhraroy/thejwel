"use client";
import { useStore } from "@/zustandStore/zustandStore";
import { useEffect } from "react";

export default function PaymentStatusShowComponent() {
    const {paymentConcluded, showPaymentConcluded, setShowPaymentConcluded} = useStore();

    // Auto-hide after 5 seconds for success, 8 seconds for error
    useEffect(() => {
        if (showPaymentConcluded) {
            const timer = setTimeout(() => {
                setShowPaymentConcluded(false);
            }, paymentConcluded ? 5000 : 8000);
            return () => clearTimeout(timer);
        }
    }, [showPaymentConcluded, paymentConcluded, setShowPaymentConcluded]);

    if (!showPaymentConcluded) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
            <div className={`relative w-full max-w-md transform transition-all duration-300 ${
                paymentConcluded ? 'animate-scaleIn' : 'animate-scaleIn'
            }`}>
                {/* Close Button */}
                <button
                    onClick={() => setShowPaymentConcluded(false)}
                    className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm shadow-xl flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-200 group border border-gray-100"
                    aria-label="Close"
                >
                    <svg
                        className="w-4.5 h-4.5 text-gray-500 group-hover:text-gray-900 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>

                {/* Success Card */}
                {paymentConcluded ? (
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-green-50/50 backdrop-blur-sm">
                        {/* Animated Background Gradient */}
                        <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-500"></div>
                        
                        <div className="p-7 sm:p-8 text-center">
                            {/* Success Icon */}
                            <div className="mb-5 flex justify-center">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-100/60 rounded-full animate-ping opacity-40"></div>
                                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200/50">
                                        <svg
                                            className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={3}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Success Message */}
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2.5 leading-tight">
                                Order Placed Successfully!
                            </h2>
                            <p className="text-sm sm:text-base text-gray-500 mb-6 leading-relaxed px-1">
                                Thank you for shopping with us. Your order has been confirmed and you'll receive a confirmation email shortly.
                            </p>

                            {/* Action Button */}
                            <button
                                onClick={() => setShowPaymentConcluded(false)}
                                className="inline-flex items-center justify-center px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-semibold rounded-xl hover:from-emerald-600 hover:to-green-700 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lg shadow-emerald-200/50"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Error Card */
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-red-50/50 backdrop-blur-sm">
                        {/* Animated Background Gradient */}
                        <div className="h-1.5 bg-gradient-to-r from-rose-400 via-red-500 to-rose-500"></div>
                        
                        <div className="p-7 sm:p-8 text-center">
                            {/* Error Icon */}
                            <div className="mb-5 flex justify-center">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-rose-100/60 rounded-full animate-pulse opacity-40"></div>
                                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-rose-500 via-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200/50">
                                        <svg
                                            className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={3}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Error Message */}
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2.5 leading-tight">
                                Payment Failed
                            </h2>
                            <p className="text-sm sm:text-base text-gray-500 mb-3 leading-relaxed px-1">
                                Oops! Something went wrong and your order could not be placed.
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 mb-5 font-medium">
                                Please reach out to our support team for assistance.
                            </p>

                            {/* Contact Info */}
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-3.5 mb-5 border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1 font-medium">Contact Support</p>
                                <a
                                    href="tel:+1234567890"
                                    className="text-base sm:text-lg font-semibold text-amber-600 hover:text-amber-700 transition-colors inline-block"
                                >
                                    +1 (234) 567-890
                                </a>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={() => setShowPaymentConcluded(false)}
                                className="inline-flex items-center justify-center px-6 py-2.5 sm:py-3 bg-gradient-to-r from-rose-500 to-red-600 text-white text-sm font-semibold rounded-xl hover:from-rose-600 hover:to-red-700 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lg shadow-rose-200/50"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}