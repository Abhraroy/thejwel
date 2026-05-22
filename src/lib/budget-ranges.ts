export type BudgetRangeConfig = {
  id: string;
  label: string;
  rangeText: string;
  minPrice: number | null;
  maxPrice: number | null;
  href?: string;
};

/** Matches ProductCard CTA: from-pink-500 to-rose-500, hover theme-olive */
export const BUDGET_CARD_BUTTON_CLASSES =
  "bg-gradient-to-r from-pink-500 to-rose-500 group-hover:bg-theme-olive";

export const BUDGET_RANGES: BudgetRangeConfig[] = [
  {
    id: "under-999",
    label: "Under ₹999",
    rangeText: "Up to ₹999",
    minPrice: null,
    maxPrice: 999,
    href: "/budget/under-999",
  },
  {
    id: "999-2999",
    label: "₹999 – ₹2,999",
    rangeText: "₹999 to ₹2,999",
    minPrice: 999,
    maxPrice: 2999,
    href: "/budget/999-2999",
  },
  {
    id: "2999-4999",
    label: "₹2,999 – ₹4,999",
    rangeText: "₹2,999 to ₹4,999",
    minPrice: 2999,
    maxPrice: 4999,
    href: "/budget/2999-4999",
  },
  {
    id: "above-4999",
    label: "Above ₹4,999",
    rangeText: "₹4,999 and above",
    minPrice: 4999,
    maxPrice: null,
    href: "/budget/above-4999",
  },
];

export function budgetListingHref(id: string): string {
  return `/budget/${encodeURIComponent(id)}`;
}

export function getBudgetRangeById(id: string): BudgetRangeConfig | undefined {
  return BUDGET_RANGES.find((range) => range.id === id);
}
