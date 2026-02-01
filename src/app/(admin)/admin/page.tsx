"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkAdminAuth } from "./login/actions";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const authResult = await checkAdminAuth();
        if (authResult.authenticated) {
          router.push("/admin/dashboard");
        } else {
          router.push("/admin/login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/admin/login");
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
