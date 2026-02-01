"use client";

import React from 'react';
import Link from 'next/link';

interface CollectionItem {
  heading: string;
  subHeading: string;
  href?: string;
  image?: string;
  description?: string;
}

function Collection() {
  // Sample collection data - you can expand this later
  const collections: CollectionItem[] = [
    {
      heading: "American Diamond",
      subHeading: "Luxury Redefined, Elegance Affordable",
      description: "Why choose between style and savings? Our American Diamond collection delivers dazzling brilliance for every occasion",
      href: "/collection/american-diamond",
      image: "/collectionImages/American%20Diamond.JPG",
    },
    {
      heading: "Temple Jewellary",
      subHeading: "Timeless Traditions, Modern Grace",
      description: "Celebrate the rich legacy of Indian artistry with our exquisite Temple Jewelry collection — where tradition meets contemporary elegance.",
      href: "/collection/temple",
      image: "/collectionImages/TempleJewellary.JPG",
    }
  ];

  return (
    <section className="w-full bg-white py-8 md:py-12 lg:py-16">
      <div className="w-[95%] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
          {collections.map((collection, index) => (
            <div
              key={index}
              className="relative overflow-hidden flex flex-col items-center justify-center p-8 md:p-12 lg:p-16 min-h-[400px] md:min-h-[500px] lg:min-h-[600px] border border-theme-olive/30 hover:border-theme-olive transition-all duration-300"
            >
              {/* Background */}
              <div
                className="absolute inset-0 bg-cover bg-center blur-sm scale-105"
                style={{
                  backgroundImage: collection.image
                    ? `url(${collection.image})`
                    : "linear-gradient(135deg, rgba(41, 63, 47, 0.15), rgba(55, 93, 70, 0.25))",
                }}
                aria-hidden
              />

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/40" aria-hidden />
              <div className="relative z-10 flex flex-col items-center gap-3 md:gap-4 lg:gap-10 text-center">
                {/* Heading */}
                <h2 className="text-4xl md:text-5xl lg:text-8xl font-sacramento text-[#CAF2FF] drop-shadow tracking-wider">
                  {collection.heading}
                </h2>
                
                {/* Sub Heading */}
                <p className="text-xl md:text-2xl lg:text-3xl text-white/90 max-w-lg
                font-sacramento tracking-wider">
                  {collection.subHeading}
                </p>

                

                {/* Explore Collection Button */}
                <Link
                  href={collection.href || "#"}
                  className="px-6 md:px-8 py-3 md:py-3.5  text-[#360000] font-semibold rounded-lg transition-colors duration-200 text-sm md:text-base shadow-sm hover:shadow-md bg-gradient-to-r from-pink-500 to-rose-500
                  
                  font-open-sans tracking-wider
                  "
                >
                  Explore Collection
                </Link>

                {/* Optional Description */}
                {collection.description && (
                  <p className="text-xs md:text-sm lg:text-base text-white/80 max-w-md">
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