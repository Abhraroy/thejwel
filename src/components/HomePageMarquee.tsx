const DEFAULT_MESSAGES = [
  "Free shipping on orders above ₹999",
  "Authentic handcrafted jewellery — TheJWEL Kolkata",
  "BIS hallmarked gold & silver",
  "New arrivals every week",
  "Sparkle without the splurge",
  "Easy returns within 7 days",
] as const;

function MarqueeTrack({ messages }: { messages: readonly string[] }) {
  return (
    <div className="marquee-track flex shrink-0 items-center">
      {messages.map((message, index) => (
        <span
          key={`${message}-${index}`}
          className="inline-flex shrink-0 items-center px-6 sm:px-10 text-xs sm:text-sm font-medium tracking-wide whitespace-nowrap font-josefin-sans"
        >
          {message}
          <span className="mx-4 sm:mx-6 text-white/50" aria-hidden="true">
            ✦
          </span>
        </span>
      ))}
    </div>
  );
}

export default function HomePageMarquee({
  messages = DEFAULT_MESSAGES,
}: {
  messages?: readonly string[];
}) {
  const items = messages.length > 0 ? messages : DEFAULT_MESSAGES;

  return (
    <div
      className="relative z-20 w-full overflow-hidden bg-gradient-to-r from-[#360000] via-rose-900 to-[#360000] text-white border-b border-white/10"
      role="region"
      aria-label="Store announcements"
    >
      <div className="marquee-scroll flex w-max">
        <MarqueeTrack messages={items} />
        <div aria-hidden="true">
          <MarqueeTrack messages={items} />
        </div>
      </div>
    </div>
  );
}
