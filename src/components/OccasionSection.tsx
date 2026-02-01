"use client";

import Link from "next/link";

export default function OccasionSection() {
  return (
    <section className="w-full py-12 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-4xl md:text-6xl text-gray-900 mb-3
          font-josefin-sans 
          tracking-wider font-bold
          ">
          What's The Occasion?
          </h2>
          <p className="text-gray-600 text-lg">
          Every moment hits different. So should your jewelry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Everyday Wear Card */}
          <Link
            href="/occasion/everydaywear"
            className="group relative overflow-hidden rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url(/collectionImages/American%20Diamond.JPG)",
                filter: "blur(4px)",
                transform: "scale(1.1)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(135deg, rgba(0,0,0,0.35), rgba(0,0,0,0.2))",
              }}
            />
            <div className="relative z-10 p-8 md:p-10 h-full flex flex-col items-center text-center">
              <span className="mb-4 inline-flex items-center px-3 py-1 rounded-full bg-white/80 text-rose-600 text-xs font-semibold tracking-wide">
                Daily Shine
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3
              font-adamina
              ">
                Everyday Wear
              </h3>
              <p className="text-white/90 mb-6">
                Elegant pieces for your daily style
              </p>
              <span className="inline-flex items-center text-white transition-colors group-hover:text-[#360000]/50
              font-open-sans font-bold tracking-wider text-[1.5rem]
              underline
              ">
                Explore →
              </span>
            </div>
          </Link>

          {/* Party Wear Card */}
          <Link
            href="/occasion/partywear"
            className="group relative overflow-hidden rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url(/collectionImages/TempleJewellary.JPG)",
                filter: "blur(4px)",
                transform: "scale(1.1)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(135deg, rgba(0,0,0,0.35), rgba(0,0,0,0.2))",
              }}
            />
            <div className="relative z-10 p-8 md:p-10 h-full flex flex-col items-center text-center">
              <span className="mb-4 inline-flex items-center px-3 py-1 rounded-full bg-white/80 text-purple-600 text-xs font-semibold tracking-wide">
                Night Out
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3
              font-satisfy
              ">
                Party Wear
              </h3>
              <p className="text-white/90 mb-6">
                Stunning pieces to make you shine
              </p>
              <span className="inline-flex items-center text-[#360000] transition-colors group-hover:text-[#360000]/50
              font-open-sans font-bold tracking-wider text-[1.5rem]
              ">
                Explore →
              </span>
            </div>
          </Link>

          {/* Wedding Card */}
          <Link
            href="/occasion/wedding"
            className="group relative overflow-hidden rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url(/collectionImages/American%20Diamond.JPG)",
                filter: "blur(4px)",
                transform: "scale(1.1)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(135deg, rgba(0,0,0,0.35), rgba(0,0,0,0.2))",
              }}
            />
            <div className="relative z-10 p-8 md:p-10 h-full flex flex-col items-center text-center">
              <span className="mb-4 inline-flex items-center px-3 py-1 rounded-full bg-white/80 text-amber-600 text-xs font-semibold tracking-wide">
                Wedding Finest
              </span>
              <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3
              font-sacramento
              ">
                Wedding
              </h3>
              <p className="text-white/90 mb-6">
                Timeless elegance for your special day
              </p>
              <span className="inline-flex items-center text-[#360000] transition-colors group-hover:text-[#360000]/50
              font-open-sans font-bold tracking-wider text-[1.5rem]
              ">
                Explore →
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

