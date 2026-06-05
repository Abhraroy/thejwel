const DEFAULT_MESSAGES = [
  "✨ Premium Jewellery for Every Occasion",
"💎 Anti-Tarnish | Temple | American Diamond",
"🏷️ Affordable & Festive Luxury",
"🚚 Pan India Shipping | COD Available",
"🎁 Extra 10% OFF on Prepaid Orders!"
] as const;

function MarqueeTrack({ messages }: { messages: readonly string[] }) {
  return (
    <div className="marquee-track flex shrink-0 items-center">
      {messages.map((message, index) => (
        <span
          key={`${message}-${index}`}
          className="inline-flex shrink-0 items-center px-6 sm:px-10 text-sm sm:text-sm font-medium tracking-wide whitespace-nowrap font-josefin-sans"
        >
          {message}
          <span className="mx-4 sm:mx-6 text-white" aria-hidden="true">
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
      className="relative z-20 w-full overflow-hidden bg-black text-white border-b border-white/10 py-2 sm:py-2.5"
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
