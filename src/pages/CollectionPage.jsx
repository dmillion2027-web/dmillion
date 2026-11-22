import { motion } from 'framer-motion';
import { Collection } from '../components/sections/Collection';

export function CollectionPage() {
  return (
    <div className="min-h-screen pt-20">
      {/* Page Header */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative py-12 sm:py-16 md:py-20 bg-gradient-to-br from-stone-900 to-black text-white overflow-hidden"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)`
          }}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-[#e8d5b7] text-black text-[10px] sm:text-xs tracking-widest rounded-full mb-3 sm:mb-4">
              EXPLORE OUR COLLECTION
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif mb-3 sm:mb-4 md:mb-6">
              Discover Luxury
            </h1>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-300 leading-relaxed px-2 sm:px-0">
              Each piece in our collection is a masterpiece of craftsmanship, 
              designed to elevate your style and make a lasting impression.
            </p>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-20 h-20 sm:w-32 sm:h-32 border-t-2 border-l-2 border-[#e8d5b7]/30"></div>
        <div className="absolute bottom-0 right-0 w-20 h-20 sm:w-32 sm:h-32 border-b-2 border-r-2 border-[#e8d5b7]/30"></div>
      </motion.section>

      {/* Collection Section */}
      <Collection />
    </div>
  );
}
