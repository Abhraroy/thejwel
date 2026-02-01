'use client';

import Image from 'next/image';
import Link from 'next/link';


export default function CategorySection({ 
  categories,
  // className = '' 
}: { categories: any }) {
  return (
    <section className={`w-full py-8 md:py-12  `} >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 md:mb-8 text-center font-josefin-sans tracking-wider">
          Shop by Category
        </h2>
        
        {/* Horizontal Scrollable Container */}
        <div className="overflow-x-auto scrollbar-hide px-2">
          <div className="flex gap-4 md:gap-6 pb-4 min-w-max md:min-w-0 md:justify-center md:flex-wrap pt-[1rem]  ">
            {categories.map((category: any) => (
              <Link
                key={category.category_id}
                href={`/category/${category.slug}`}
                className="flex flex-col items-center group flex-shrink-0 w-20 md:w-24 lg:w-28"
              >
                {/* Circular Image Container */}
                <div className="relative w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden bg-white ring-2 group-hover:ring-theme-olive transition-all duration-300 mb-2 md:mb-3 shadow-sm group-hover:shadow-md">
                  <Image
                    src={category.category_image_url}
                    alt={category.category_name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 768px) 80px, (max-width: 1024px) 96px, 112px"
                  />
                </div>
                
                {/* Category Name */}
                <span className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-[#360000] group-hover:text-[#360000]/80 text-center transition-colors duration-200 leading-tight">
                  {category.category_name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

