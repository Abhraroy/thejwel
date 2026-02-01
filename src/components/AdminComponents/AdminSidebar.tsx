"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { adminLogout } from "@/app/(admin)/admin/login/actions";

// Icon Components
const DashboardIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2-2z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2H8V5z"
    />
  </svg>
);

const ProductIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
    />
  </svg>
);

const ReviewIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5z"
    />
  </svg>
);

const OrdersIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h11.25c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
    />
  </svg>
);

const CategoryIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="m6 6 6 6" />
  </svg>
);

const LogoutIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
    />
  </svg>
);

const ThemeToggleIcon = ({
  className = "w-5 h-5",
  isDark,
}: {
  className?: string;
  isDark: boolean;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={className}
  >
    {isDark ? (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
      />
    ) : (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
      />
    )}
  </svg>
);

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

interface AdminSidebarProps {
  isDarkTheme: boolean;
  onThemeToggle: () => void;
}

export default function AdminSidebar({ isDarkTheme, onThemeToggle }: AdminSidebarProps) {
  const pathname = usePathname();

  const navigationItems: NavigationItem[] = [
    { id: "dashboard", label: "Dashboard", icon: DashboardIcon, href: "/admin/dashboard" },
    { id: "categories", label: "Categories", icon: CategoryIcon, href: "/admin/categories" },
    { id: "products", label: "Products", icon: ProductIcon, href: "/admin/products" },
    { id: "reviews", label: "Reviews", icon: ReviewIcon, href: "/admin/reviews" },
    { id: "orders", label: "Orders", icon: OrdersIcon, href: "/admin/orders" },
  ];

  const handleLogout = async () => {
    try {
      const result = await adminLogout();
      if (result.success) {
        window.location.href = "/admin/login";
      } else {
        console.error("Logout error:", result.error);
        window.location.href = "/admin/login";
      }
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/admin/login";
    }
  };

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") {
      return pathname === "/admin" || pathname === "/admin/dashboard";
    }
    return pathname === href || pathname?.startsWith(href + "/");
  };

  return (
    <div
      className={`w-64 ${
        isDarkTheme ? "bg-black border-gray-700" : "bg-white border-gray-200"
      } border-r flex flex-col`}
    >
      {/* Logo/Header */}
      <div
        className={`p-6 border-b ${
          isDarkTheme ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <h1 className="text-2xl font-bold text-[#E94E8B]">JWEL Admin</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.href);
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? `${
                          isDarkTheme
                            ? "bg-gray-700 text-white"
                            : "bg-[#E94E8B] text-white"
                        }`
                      : `${
                          isDarkTheme
                            ? "text-white hover:bg-gray-800"
                            : "text-gray-700 hover:bg-gray-100"
                        }`
                  }`}
                >
                  <IconComponent className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div
        className={`p-4 border-t ${
          isDarkTheme ? "border-gray-700" : "border-gray-200"
        } space-y-2`}
      >
        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
            isDarkTheme
              ? "text-white hover:bg-gray-800"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <ThemeToggleIcon className="w-5 h-5 mr-3" isDark={isDarkTheme} />
          <span className="font-medium">
            {isDarkTheme ? "Light Mode" : "Dark Mode"}
          </span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
            isDarkTheme
              ? "text-white hover:bg-gray-800"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <LogoutIcon className="w-5 h-5 mr-3" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
