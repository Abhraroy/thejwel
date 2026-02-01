'use client';

import Image from 'next/image';
import Link from 'next/link';

interface BentoCategory {
  id: string;
  name: string;
  imageUrl: string;
  slug: string;
  span?: 'col-span-1' | 'col-span-2'; // Optional span for grid layout flexibility
}

interface BentoGridProps {
  title?: string;
  categories?: BentoCategory[];
  className?: string;
}

const defaultBentoCategories: BentoCategory[] = [
  {
    id: '1',
    name: 'American Diamond',
    imageUrl: 'https://www.divinehindu.in/cdn/shop/files/Divine_Hindu_Gold_Plated_Ram_Pendant_Chain_Necklace.jpg?v=1720425631',
    slug: 'american-diamond',
    span: 'col-span-1',
  },
  {
    id: '2',
    name: 'Anti-Tarnish',
    imageUrl: 'https://www.swashaa.com/cdn/shop/files/NikoMen_sChainPendant-parth-16-5-25-arpit_2.jpg?v=1747645531&width=1800',
    slug: 'anti-tarnish',
    span: 'col-span-1',
  },
];

export default function BentoGrid({
  title = 'View Our Collections',
  categories = defaultBentoCategories,
  className = '',
}: BentoGridProps) {
  return (
    <section className={`w-full bg-theme-cream py-8 md:py-12 lg:py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-theme-olive mb-8 md:mb-12 text-center">
          {title}
        </h2>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/collection/${category.slug}`}
              className={`group relative overflow-hidden rounded-2xl md:rounded-3xl bg-theme-sage/10 aspect-[4/3] md:aspect-[3/2] lg:aspect-[4/3] transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] ${category.span || ''}`}
            >
              {/* Image Container */}
              <div className="relative w-full h-full">
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 50vw"
                  priority={category.id === '1' || category.id === '2'}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                
                {/* Category Name */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-10">
                  <h3 className="text-white text-xl md:text-2xl lg:text-3xl font-bold mb-2 group-hover:translate-y-[-4px] transition-transform duration-300">
                    {category.name}
                  </h3>
                  <div className="flex items-center text-white/90 group-hover:text-white transition-colors duration-300">
                    <span className="text-sm md:text-base font-medium">Explore Collection</span>
                    <svg
                      className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

