import Link from "next/link";

export default function OccasionSection() {
  return (
    <section className="w-full py-6 md:py-8 lg:py-10 px-3 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-5 md:mb-7">
          <h2 className="text-4xl md:text-6xl text-gray-900 mb-3
          font-josefin-sans 
          tracking-wider
          ">
          What's The Occasion?
          </h2>
          <p className="text-gray-600 text-lg">
          Every moment hits different. So should your jewelry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Everyday Wear Card */}
          <Link
            href="/occasion/everydaywear"
            className="group relative overflow-hidden rounded-2xl transition-all duration-300 transform hover:scale-[1.03] shadow-lg hover:shadow-2xl"
          >
            <div
              className="absolute inset-0 backdrop-blur-2xl bg-white/30 ring-1 ring-black/10"
              style={{
                background:
                  "radial-gradient(900px circle at 18% 20%, rgba(244, 63, 94, 0.22), transparent 58%), radial-gradient(800px circle at 82% 28%, rgba(251, 191, 36, 0.18), transparent 55%), linear-gradient(135deg, rgba(255,255,255,0.72), rgba(255,255,255,0.22))",
              }}
            />
            <div className="absolute inset-0 pointer-events-none border border-white/45" />
            <div className="relative z-10 p-5 md:p-6 lg:p-8 h-full flex flex-col items-center text-center">
              <span className="mb-4 inline-flex items-center px-3 py-1 rounded-full bg-white/80 text-rose-600 text-xs font-semibold tracking-wide">
                Daily Shine
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3
              font-adamina
              ">
                Everyday Wear
              </h3>
              <p className="text-gray-700 mb-6">
                Elegant pieces for your daily style
              </p>
            </div>
          </Link>

          {/* Party Wear Card */}
          <Link
            href="/occasion/partywear"
            className="group relative overflow-hidden rounded-2xl transition-all duration-300 transform hover:scale-[1.03] shadow-lg hover:shadow-2xl"
          >
            <div
              className="absolute inset-0 backdrop-blur-2xl bg-white/30 ring-1 ring-black/10"
              style={{
                background:
                  "radial-gradient(900px circle at 20% 24%, rgba(168, 85, 247, 0.22), transparent 58%), radial-gradient(800px circle at 85% 30%, rgba(59, 130, 246, 0.16), transparent 55%), linear-gradient(135deg, rgba(255,255,255,0.72), rgba(255,255,255,0.22))",
              }}
            />
            <div className="absolute inset-0 pointer-events-none border border-white/45" />
            <div className="relative z-10 p-5 md:p-6 lg:p-8 h-full flex flex-col items-center text-center">
              <span className="mb-4 inline-flex items-center px-3 py-1 rounded-full bg-white/80 text-purple-600 text-xs font-semibold tracking-wide">
                Night Out
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3
              font-satisfy
              ">
                Party Wear
              </h3>
              <p className="text-gray-700 mb-6">
                Stunning pieces to make you shine
              </p>
            </div>
          </Link>

          {/* Wedding Card */}
          <Link
            href="/occasion/wedding"
            className="group relative overflow-hidden rounded-2xl transition-all duration-300 transform hover:scale-[1.03] shadow-lg hover:shadow-2xl"
          >
            <div
              className="absolute inset-0 backdrop-blur-2xl bg-white/30 ring-1 ring-black/10"
              style={{
                background:
                  "radial-gradient(900px circle at 22% 22%, rgba(245, 158, 11, 0.24), transparent 58%), radial-gradient(820px circle at 84% 28%, rgba(244, 63, 94, 0.14), transparent 56%), linear-gradient(135deg, rgba(255,255,255,0.72), rgba(255,255,255,0.22))",
              }}
            />
            <div className="absolute inset-0 pointer-events-none border border-white/45" />
            <div className="relative z-10 p-5 md:p-6 lg:p-8 h-full flex flex-col items-center text-center">
              <span className="mb-4 inline-flex items-center px-3 py-1 rounded-full bg-white/80 text-amber-600 text-xs font-semibold tracking-wide">
                Wedding Finest
              </span>
              <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3
              font-sacramento
              ">
                Wedding
              </h3>
              <p className="text-gray-700 mb-6">
                Timeless elegance for your special day
              </p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

