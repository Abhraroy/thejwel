import type { LucideIcon } from "lucide-react";
import type { IconType } from "react-icons";
import {
  LayoutDashboard,
  Warehouse,
  PackageSearch,
  BadgeDollarSign,
  CirclePercent,
  Star,
  ImageUp,
  ChartNoAxesCombined,
  Settings,
} from "lucide-react";

import { FaUsers } from "react-icons/fa";
import { RiCoupon3Line } from "react-icons/ri";
import { FiTruck } from "react-icons/fi";
import { MdOutlineCategory } from "react-icons/md";


export type NavLink = {
  id: string;
  label: string;
  href?: string;
  disabled?: boolean;
  icon?: LucideIcon | IconType;
};

export type NavGroup = {
  id: string;
  label: string;
  href?: string;
  disabled?: boolean;
  icon?: LucideIcon | IconType;
  children: NavLink[];
};

export type NavItem = NavLink | NavGroup;

export function isNavGroup(item: NavItem): item is NavGroup {
  return "children" in item;
}

export const adminNavItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "inventory",
    label: "Inventory",
    children: [
      {
        id: "products",
        label: "Products",
        href: "/admin/products",
        icon: PackageSearch,
      },
      { id: "categories", label: "Categories", href: "/admin/categories", icon: MdOutlineCategory },
    ],
    icon: Warehouse,
  },
  {
    id: "orders",
    label: "Orders",
    href: "/admin/orders",
    icon: FiTruck,
  },
  {
    id: "customers",
    label: "Customers",
    disabled: false,
    href: "/admin/customers",
    icon: FaUsers,
  },
  {
    id: "marketing",
    label: "Marketing",
    icon: BadgeDollarSign,
    children: [
      { id: "coupons", label: "Coupons", disabled: true, icon: RiCoupon3Line },
    ],
  },
  {
    id: "reviews",
    label: "Reviews",
    href: "/admin/reviews",
    icon: Star,
  },
  {
    id: "website-assets",
    label: "Website Assets",
    disabled: false,
    href: "/admin/website-assets",
    icon: ImageUp,
  },
  {
    id: "analytics",
    label: "Analytics",
    disabled: false,
    href: "/admin/analytics",
    icon: ChartNoAxesCombined,
  },
  {
    id: "settings",
    label: "Settings",
    disabled: false,
    children: [],
    href: "/admin/settings",
    icon: Settings,
  },
];
