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
      className="group relative block w-full aspect-5/3 overflow-hidden rounded-lg md:rounded-xl border-2 border-rose-400/40 shadow-sm opacity-0 animate-fadeInUp transition-[transform,box-shadow,border-color] duration-500 ease-out hover:-translate-y-1 hover:border-theme-olive hover:shadow-lg"
      style={{ animationDelay: CARD_STAGGER_DELAYS[index] }}
    >
      <div
        className={`absolute inset-0 transition-colors duration-500 ease-out ${BUDGET_CARD_BUTTON_CLASSES}`}
      />
      <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/25 rounded-lg md:rounded-xl transition-opacity duration-500 group-hover:ring-white/40" />
      <div className="relative z-10 px-2 py-3 sm:py-3.5 h-full flex flex-col items-center justify-center text-center gap-1 sm:gap-1.5 transition-transform duration-500 ease-out group-hover:-translate-y-0.5">
        <p className="flex items-center justify-center gap-1.5 sm:gap-2 text-base sm:text-lg md:text-xl font-semibold text-white/95 uppercase tracking-wide font-josefin-sans drop-shadow-sm">
          <span>{range.tagline[0]}</span>
          <span>{range.tagline[1]}</span>
        </p>
        <p className="text-4xl sm:text-3xl md:text-4xl lg:text-[3.5rem] font-bold text-white leading-none font-open-sans drop-shadow-md max-w-full">
          {range.priceDisplay}
        </p>
      </div>
    </Link>
  );
}

export default function ShopByBudgetSection() {
  return (
    <section className="w-full bg-theme-cream py-3 md:py-4 lg:py-5">
      <HomeSectionHeading
        title="Sparkle Without the Splurge"
        subtitle="Gorgeous picks at every price — tap your range and shine."
        animated
        className="px-3 sm:px-4 lg:px-6 mb-3 md:mb-4"
      />
      <div className="relative w-full max-w-full overflow-hidden px-3 sm:px-4 lg:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {BUDGET_RANGES.map((range, index) => (
            <BudgetRangeCard key={range.id} range={range} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
