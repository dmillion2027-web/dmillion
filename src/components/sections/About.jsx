export function About() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl">
          
          {/* Section Label */}
          <div>
            <span className="text-xs tracking-[0.3em] uppercase text-gray-500">
              ABOUT DMILLION
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-gray-900 mb-4 sm:mb-6 mt-3">
            More Than a Bag.
          </h2>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed text-xs sm:text-sm md:text-base">
            DMILLION Luxury Bags is a symbol of class, confidence and sophistication. 
            Designed for those who appreciate quality and timeless style.
          </p>
        </div>
      </div>
    </section>
  );
}
