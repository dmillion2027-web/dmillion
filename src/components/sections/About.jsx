export function About() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center">
          
          {/* Section Label */}
          <div>
            <span className="text-xs tracking-[0.3em] uppercase text-gray-500">
              ABOUT DMILLION
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-gray-900 mb-6 sm:mb-8 mt-4">
            More Than a Bag.
          </h2>

          {/* Main Description */}
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base md:text-lg mb-6 sm:mb-8">
            DMILLION Luxury Bags is a symbol of class, confidence and sophistication. Designed for those who appreciate quality and timeless style.
          </p>

          {/* Additional Content */}
          <div className="space-y-6 sm:space-y-8">
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              Each DMILLION piece is meticulously crafted by master artisans using only the finest Italian and French leather. We believe that luxury is not just an aesthetic—it's a commitment to excellence in every stitch, every curve, and every detail.
            </p>

            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              From concept to creation, our design philosophy remains unchanged: create bags that transcend trends and become cherished heirlooms. DMILLION is trusted by discerning customers worldwide who refuse to compromise on quality, craftsmanship, or timeless elegance.
            </p>

            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              We're committed to sustainable luxury—proving that environmental responsibility and refined taste are not mutually exclusive. DMILLION is where heritage meets innovation, where tradition embraces the future.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
