import { motion } from 'framer-motion';
import { Award, Shield, Truck, Clock, CreditCard, Headphones } from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: Award,
      title: 'Premium Quality',
      description: 'Crafted to last.',
      detail: 'Each bag is made from the finest materials with meticulous attention to detail, ensuring lasting quality.'
    },
    {
      icon: Shield,
      title: 'Trusted Brand',
      description: 'Luxury you can trust.',
      detail: 'With over 15 years of excellence, DMILLION has become synonymous with quality and sophistication.'
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Shop with ease.',
      detail: 'Free express shipping on all orders. Your luxury arrives safely and swiftly at your doorstep.'
    },
    {
      icon: Clock,
      title: 'Timeless Design',
      description: 'Never goes out of style.',
      detail: 'Our designs transcend trends, offering pieces that remain elegant and relevant for years to come.'
    },
    {
      icon: CreditCard,
      title: 'Secure Payment',
      description: 'Safe & encrypted.',
      detail: 'Your transactions are protected with industry-leading security protocols and encryption.'
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'We\'re here for you.',
      detail: 'Our dedicated customer service team is available around the clock to assist you.'
    }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 sm:mb-12 md:mb-16"
        >
          <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-[#e8d5b7]/30 text-[#3d2415] text-[10px] sm:text-xs tracking-widest rounded-full mb-3 sm:mb-4">
            WHY CHOOSE US
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif mb-2 sm:mb-3 md:mb-4 px-4">The DMILLION Difference</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-xs sm:text-sm md:text-base px-4">
            Experience unparalleled luxury, quality, and service with every purchase.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="group"
            >
              <div className="relative bg-gradient-to-br from-stone-50 to-[#e8d5b7]/20 p-4 sm:p-6 md:p-8 rounded-lg hover:shadow-xl transition-all duration-500 h-full border border-transparent hover:border-[#e8d5b7]">
                
                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-black rounded-full flex items-center justify-center mb-3 sm:mb-4 md:mb-6 group-hover:bg-[#e8d5b7] transition-colors duration-300"
                >
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white group-hover:text-black" />
                </motion.div>

                {/* Content */}
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-serif mb-1 sm:mb-2 group-hover:text-[#3d2415] transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3 font-medium">
                  {feature.description}
                </p>
                
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {feature.detail}
                </p>

                {/* Hover effect line */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#e8d5b7] to-[#d4c1a3] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-12 sm:mt-16 md:mt-20 bg-gradient-to-r from-black via-stone-900 to-black p-6 sm:p-8 md:p-12 rounded-lg text-white text-center relative overflow-hidden"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)`
            }}></div>
          </div>

          <div className="relative z-10">
            <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 text-center">
              <div className="flex-1 min-w-[120px] sm:min-w-[150px] md:min-w-[200px]">
                <div className="text-2xl sm:text-3xl md:text-4xl font-serif mb-1 sm:mb-2 text-[#e8d5b7]">100%</div>
                <div className="text-[10px] sm:text-xs md:text-sm tracking-wide">Authentic Products</div>
              </div>
              
              <div className="hidden md:block w-px h-12 md:h-16 bg-gray-600"></div>
              
              <div className="flex-1 min-w-[120px] sm:min-w-[150px] md:min-w-[200px]">
                <div className="text-2xl sm:text-3xl md:text-4xl font-serif mb-1 sm:mb-2 text-[#e8d5b7]">30 Days</div>
                <div className="text-[10px] sm:text-xs md:text-sm tracking-wide">Return Policy</div>
              </div>
              
              <div className="hidden md:block w-px h-12 md:h-16 bg-gray-600"></div>
              
              <div className="flex-1 min-w-[120px] sm:min-w-[150px] md:min-w-[200px]">
                <div className="text-2xl sm:text-3xl md:text-4xl font-serif mb-1 sm:mb-2 text-[#e8d5b7]">24/7</div>
                <div className="text-[10px] sm:text-xs md:text-sm tracking-wide">Customer Support</div>
              </div>
            </div>
          </div>

          {/* Decorative corners */}
          <div className="absolute top-0 left-0 w-12 h-12 sm:w-16 sm:h-16 border-t-2 border-l-2 border-[#e8d5b7]"></div>
          <div className="absolute bottom-0 right-0 w-12 h-12 sm:w-16 sm:h-16 border-b-2 border-r-2 border-[#e8d5b7]"></div>
        </motion.div>
      </div>
    </section>
  );
}
