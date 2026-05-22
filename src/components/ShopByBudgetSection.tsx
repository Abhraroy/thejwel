import Link from "next/link";
import HomeSectionHeading from "@/components/HomePageComponents/HomeSectionHeading";
import {
  BUDGET_CARD_BUTTON_CLASSES,
  BUDGET_RANGES,
  budgetListingHref,
  type BudgetRangeConfig,
} from "@/lib/budget-ranges";

const CARD_STAGGER_DELAYS = ["300ms", "400ms", "500ms", "600ms"] as const;

function BudgetRangeCard({
  range,
  index,
}: {
  range: BudgetRangeConfig;
  index: number;
}) {
  return (
    <Link
      href={range.href ?? budgetListingHref(range.id)}
      scroll
      className="group relative block w-full aspect-[4/3] overflow-hidden rounded-xl md:rounded-2xl border-2 border-rose-400/40 shadow-sm opacity-0 animate-fadeInUp transition-[transform,box-shadow,border-color] duration-500 ease-out hover:-translate-y-1 hover:border-theme-olive hover:shadow-lg"
      style={{ animationDelay: CARD_STAGGER_DELAYS[index] }}
    >
      <div
        className={`absolute inset-0 transition-colors duration-500 ease-out ${BUDGET_CARD_BUTTON_CLASSES}`}
      />
      <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/25 rounded-xl md:rounded-2xl transition-opacity duration-500 group-hover:ring-white/40" />
      <div className="relative z-10 p-4 sm:p-4 md:p-5 h-full flex flex-col items-center justify-center text-center px-2 transition-transform duration-500 ease-out group-hover:-translate-y-0.5">
        <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white leading-tight font-josefin-sans mb-1.5 sm:mb-2 drop-shadow-md max-w-full">
          {range.label}
        </h3>
        <p className="text-xs sm:text-sm md:text-sm text-white/90 leading-snug drop-shadow-sm max-w-full">
          {range.rangeText}
        </p>
      </div>
    </Link>
  );
}

export default function ShopByBudgetSection() {
  return (
    <section className="w-full bg-theme-cream py-4 md:py-6 lg:py-8">
      <HomeSectionHeading
        title="Sparkle Without the Splurge"
        subtitle="Gorgeous picks at every price — tap your range and shine."
        animated
        className="px-3 sm:px-4 lg:px-6 mb-4 md:mb-6"
      />
      <div className="relative w-full max-w-full overflow-hidden px-3 sm:px-4 lg:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {BUDGET_RANGES.map((range, index) => (
            <BudgetRangeCard key={range.id} range={range} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
