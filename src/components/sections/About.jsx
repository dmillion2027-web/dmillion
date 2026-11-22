import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function About() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isModalOpen]);

  return (
    <>
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left - Logo Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-black via-[#2a1810] to-black rounded-lg overflow-hidden shadow-2xl flex items-center justify-center">
                {/* Logo Design */}
                <div className="text-center">
                  <div className="w-48 h-48 mx-auto mb-6 bg-[#e8d5b7] rounded-full flex items-center justify-center">
                    <span className="text-8xl font-serif text-black">M</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right - Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              {/* Section Label */}
              <div>
                <span className="text-xs tracking-[0.3em] uppercase text-gray-500">
                  ABOUT DMILLION
                </span>
              </div>

              {/* Headline */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-gray-900 mb-4 sm:mb-6">
                More Than a Bag.
              </h2>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed text-xs sm:text-sm md:text-base mb-4 sm:mb-6">
                DMILLION Luxury Bags is a symbol of class, confidence and sophistication. 
                Designed for those who appreciate quality and timeless style.
              </p>

              {/* CTA Button */}
              <div className="pt-2 sm:pt-4">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="group inline-flex items-center space-x-1.5 sm:space-x-2 bg-black text-white px-5 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-full hover:bg-[#2a1810] transition-all duration-300 text-xs sm:text-sm md:text-base"
                >
                  <span className="font-medium">Learn More</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            >
              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-serif text-gray-900">
                    About DMILLION
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                      Our Story
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      DMILLION Luxury Bags represents the pinnacle of luxury craftsmanship. Founded with a vision to create timeless pieces that transcend trends, each bag in our collection is meticulously designed and crafted to perfection.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                      Our Mission
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      We believe that luxury is not just about materials and craftsmanship—it's about expressing individuality and confidence. Every DMILLION piece tells a story of elegance, sophistication, and timeless beauty.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                      Our Values
                    </h3>
                    <ul className="space-y-3 text-sm sm:text-base text-gray-600">
                      <li className="flex items-start space-x-3">
                        <span className="text-[#e8d5b7] font-bold">•</span>
                        <span><strong>Quality:</strong> Only the finest materials and expert craftsmanship</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="text-[#e8d5b7] font-bold">•</span>
                        <span><strong>Innovation:</strong> Blending classic design with modern aesthetics</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="text-[#e8d5b7] font-bold">•</span>
                        <span><strong>Sustainability:</strong> Committed to responsible luxury</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="text-[#e8d5b7] font-bold">•</span>
                        <span><strong>Excellence:</strong> Every detail matters in our designs</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-4 sm:pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="w-full bg-black text-white py-2.5 sm:py-3 rounded-full hover:bg-[#2a1810] transition-colors text-sm sm:text-base font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
