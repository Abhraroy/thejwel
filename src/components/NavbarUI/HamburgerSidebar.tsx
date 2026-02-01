"use client";

import Link from "next/link";
import React from "react";

interface SidebarMenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  requiresAuth?: boolean;
}

interface HamburgerSidebarProps {
  isSidebarOpen: boolean;
  onClose: () => void;
  categories?: any[];
  filteredMenuItems: SidebarMenuItem[];
  onAccountClick: () => void;
}

const CloseIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
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
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export default function HamburgerSidebar({
  isSidebarOpen,
  onClose,
  categories,
  filteredMenuItems,
  onAccountClick,
}: HamburgerSidebarProps) {
  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 bg-opacity-50 z-50 md:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-80 bg-[#DECAF2] text-[#360000] shadow-xl z-50 transition-transform duration-300 ease-in-out md:hidden ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/30">
            <h2 className="text-2xl font-extrabold text-[#360000] font-josefin-sans tracking-wider">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 text-white hover:text-[#FFCDC9] transition-colors"
              aria-label="Close menu"
            >
              <CloseIcon className="w-7 h-7 text-[#360000] hover:text-[#360000]/80 hover:scale-125 rounded-full transition-all duration-200 ease-in-out  cursor-pointer" />
            </button>
          </div>

          {/* Sidebar Menu Items */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-4">
              {/* Categories Section */}
              {categories && categories.length > 0 ? (
                <>
                  <li className="px-4 py-2 mt-4 mb-2">
                    <h3 className="text-xl font-semibold text-[#360000] font-open-sans tracking-wider">
                      Categories
                    </h3>
                  </li>
                  {categories.map((category: any) => (
                    <li key={category.category_id}>
                      <Link
                        href={`/category/${category.slug}`}
                        className="flex items-center gap-3 px-4 py-3 bg-[#CAF2FF] text-[#360000] hover:bg-[#CAF2FF]/70 rounded-lg transition-colors"
                        onClick={onClose}
                      >
                        <span className="font-medium font-open-sans tracking-wider">
                          {category.category_name}
                        </span>
                      </Link>
                    </li>
                  ))}
                  <li className="px-4 py-2 mt-4 mb-2 border-t border-white/30"></li>
                </>
              ) : isSidebarOpen ? (
                <>
                  <li className="px-4 py-2 mt-4 mb-2">
                    <div className="h-4 w-24 bg-white/40 rounded animate-pulse" />
                  </li>
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <li key={idx} className="px-4">
                      <div className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-lg animate-pulse">
                        <span className="h-4 w-32 bg-white/30 rounded" />
                      </div>
                    </li>
                  ))}
                  <li className="px-4 py-2 mt-4 mb-2 border-t border-white/30"></li>
                </>
              ) : null}

              {/* Other Menu Items */}
              {filteredMenuItems.map((item, index) => {
                if (item.label === "My Account") {
                  return (
                    <li key={index}>
                      <button
                        onClick={onAccountClick}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-[#CAF2FF] text-[#360000] hover:bg-[#CAF2FF]/70 rounded-lg transition-colors text-left"
                      >
                        {item.icon}
                        <span className="font-medium font-open-sans tracking-wider">{item.label}</span>
                      </button>
                    </li>
                  );
                }
                return (
                  <li key={index}>
                    <a
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 bg-[#CAF2FF] text-[#360000] hover:bg-[#CAF2FF]/70 rounded-lg transition-colors"
                      onClick={onClose}
                    >
                      {item.icon}
                      <span className="font-medium font-open-sans tracking-wider">{item.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}

