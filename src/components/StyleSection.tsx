import Link from 'next/link';

interface StyleItem {
  heading: string;
  href?: string;
  gradient: string;
  description?: string;
  textColor?: string;
}

function StyleSection() {
  const styles: StyleItem[] = [
    {
      heading: "American Diamond",
      description: "Why choose between style and savings? Our American Diamond collection delivers dazzling brilliance for every occasion",
      href: "/style/american-diamond",
      gradient: "linear-gradient(145deg, #a8c5e0 0%, #c5d8eb 25%, #e8e4f4 50%, #d4d0e8 75%, #b8c8dc 100%)",
      textColor: "#4a5d6e",
    },
    {
      heading: "Temple Jewellery",
      description: "Celebrate the rich legacy of Indian artistry with our exquisite Temple Jewelry collection — where tradition meets contemporary elegance.",
      href: "/style/temple-jewellery",
      gradient: "linear-gradient(145deg, #f5e6d3 0%, #e8d4b8 30%, #d4b896 60%, #c4a574 85%, #a68b5b 100%)",
      textColor: "#5c4033",
    },
    {
      heading: "Anti tarnish",
      description: "Long-lasting shine without the worry. Our Anti tarnish collection keeps your favourite pieces looking fresh, day after day.",
      href: "/style/anti-tarnish",
      gradient: "linear-gradient(145deg, #eef1f4 0%, #d4dce4 30%, #b8c5d0 60%, #9aadb8 85%, #7a919e 100%)",
      textColor: "#2d3a45",
    },
  ];

  return (
    <section className="w-full bg-white py-4 md:py-6 lg:py-8">
      <div className="w-[95%] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
          {styles.map((style, index) => (
            <div
              key={index}
              className="relative overflow-hidden flex flex-col items-center justify-center p-5 md:p-8 lg:p-10 min-h-[400px] md:min-h-[500px] lg:min-h-[600px] border border-theme-olive/30 hover:border-theme-olive transition-all duration-300"
            >
              <div
                className="absolute inset-0"
                style={{ background: style.gradient }}
                aria-hidden
              />
              <div className="relative z-10 flex flex-col items-center gap-3 md:gap-4 lg:gap-10 text-center">
                <h2
                  className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-sacramento drop-shadow tracking-wider"
                  style={{ color: style.textColor ?? "#4a5d6e" }}
                >
                  {style.heading}
                </h2>

                <Link
                  href={style.href || "#"}
                  className="px-6 md:px-8 py-3 md:py-3.5 text-white font-semibold rounded-lg transition-all duration-300 text-sm md:text-base shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] hover:shadow-[0_1px_3px_0_rgba(0,0,0,0.08)] bg-gradient-to-r from-pink-500 to-rose-500 hover:bg-theme-olive transform hover:scale-[1.02] active:scale-[0.98] font-open-sans tracking-wider"
                >
                  Explore Style
                </Link>

                {style.description && (
                  <p
                    className="text-xs md:text-sm lg:text-base max-w-md opacity-80"
                    style={{ color: style.textColor ?? "#4a5d6e" }}
                  >
                    {style.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StyleSection
