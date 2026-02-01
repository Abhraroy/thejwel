"use client";

import { useStore } from "@/zustandStore/zustandStore";
// import PaymentGatewayComponent from "@/components/Payment/PaymentGatewayComponent";
// import PaymentStatusShowComponent from "@/components/Payment/PaymentStatusShowComponent";


import dynamic from "next/dynamic";

const PaymentGatewayComponent = dynamic(() => import("./PaymentGatewayComponent"), { ssr: false });
const PaymentStatusShowComponent = dynamic(() => import("./PaymentStatusShowComponent"), { ssr: false });

export default function PaymentGatewayWrapper() {
  const { initiatingCheckout, showPaymentConcluded } = useStore();

  return (
    <>
      {initiatingCheckout && <PaymentGatewayComponent />}
      {showPaymentConcluded && <PaymentStatusShowComponent />}
    </>
  );
}

