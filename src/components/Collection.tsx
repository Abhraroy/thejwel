import Link from 'next/link';

interface CollectionItem {
  heading: string;
  href?: string;
  gradient: string;
  description?: string;
}

function Collection() {
  // Sample collection data - you can expand this later
  const collections: CollectionItem[] = [
    {
      heading: "American Diamond",
      description: "Why choose between style and savings? Our American Diamond collection delivers dazzling brilliance for every occasion",
      href: "/collection/American Diamond",
      gradient: "linear-gradient(145deg, #a8c5e0 0%, #c5d8eb 25%, #e8e4f4 50%, #d4d0e8 75%, #b8c8dc 100%)",
    },
    {
      heading: "Temple Jewellary",
      description: "Celebrate the rich legacy of Indian artistry with our exquisite Temple Jewelry collection — where tradition meets contemporary elegance.",
      href: "/collection/Temple Jewellary",
      gradient: "linear-gradient(145deg, #f5e6d3 0%, #e8d4b8 30%, #d4b896 60%, #c4a574 85%, #a68b5b 100%)",
    }
  ];

  return (
    <section className="w-full bg-white py-4 md:py-6 lg:py-8">
      <div className="w-[95%] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
          {collections.map((collection, index) => (
            <div
              key={index}
              className="relative overflow-hidden flex flex-col items-center justify-center p-5 md:p-8 lg:p-10 min-h-[400px] md:min-h-[500px] lg:min-h-[600px] border border-theme-olive/30 hover:border-theme-olive transition-all duration-300"
            >
              {/* Elegant gradient background */}
              <div
                className="absolute inset-0"
                style={{ background: collection.gradient }}
                aria-hidden
              />
              <div className="relative z-10 flex flex-col items-center gap-3 md:gap-4 lg:gap-10 text-center">
                {/* Heading */}
                <h2 className={`text-4xl md:text-5xl lg:text-8xl font-sacramento drop-shadow tracking-wider ${index === 0 ? 'text-[#4a5d6e]' : 'text-[#5c4033]'}`}>
                  {collection.heading}
                </h2>

                {/* Explore Collection Button */}
                <Link
                  href={collection.href || "#"}
                  className="px-6 md:px-8 py-3 md:py-3.5 text-white font-semibold rounded-lg transition-all duration-300 text-sm md:text-base shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] hover:shadow-[0_1px_3px_0_rgba(0,0,0,0.08)] bg-gradient-to-r from-pink-500 to-rose-500 hover:bg-theme-olive transform hover:scale-[1.02] active:scale-[0.98] font-open-sans tracking-wider"
                >
                  Explore Collection
                </Link>

                {/* Optional Description */}
                {collection.description && (
                  <p className={`text-xs md:text-sm lg:text-base max-w-md ${index === 0 ? 'text-[#4a5d6e]/80' : 'text-[#5c4033]/80'}`}>
                    {collection.description}
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

export default Collection