"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useStore } from "@/zustandStore/zustandStore";

const Cart = dynamic(() => import("./CartUI/Cart"), { ssr: false });

export default function HomePageClientShell({
  categoriesProps,
}: {
  categoriesProps: any;
}) {
  const { isCartOpen, setIsCartOpen, setCategories } = useStore();

  useEffect(() => {
    setCategories(categoriesProps);
  }, [categoriesProps, setCategories]);

  if (!isCartOpen) return null;

  return <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />;
}
