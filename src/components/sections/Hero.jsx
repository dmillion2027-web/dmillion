import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroBackground from '../../assets/images/D919CFF6-4388-4F76-A2F7-8179BC8C129D.webp';

export function Hero() {
  
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#3d2415]">
      {/* Background Image with Overlay - Optimized with lazy loading */}
      <div className="absolute inset-0">
        <img 
          src={heroBackground} 
          alt="One in a Million Luxury Bags" 
          className="w-full h-full object-cover opacity-90"
          loading="eager"
          decoding="async"
          fetchpriority="high"
          width="1920"
          height="1080"
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      <div className="container mx-auto px-6 lg:px-12 py-32 relative z-10">
        <div className="max-w-2xl text-center lg:text-left mx-auto lg:mx-0">
          
          {/* Small Brand Line - Hidden on mobile */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8 hidden lg:flex flex-col items-start"
          >
            <div className="h-px w-48 bg-white/30 mb-4"></div>
            <p className="text-white/80 text-sm tracking-[0.3em] uppercase font-light">
              One in a Million
            </p>
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-6"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Dmillion one in a million
              <br />
              <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl"></span>
            </h1>
          </motion.div>

          {/* Subheading - Hidden on mobile */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-white/90 text-xs sm:text-sm md:text-base mb-6 sm:mb-8 md:mb-10 font-light leading-relaxed hidden lg:block"
          >
            Premium quality. Modern style. Lasting impression.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex justify-center lg:justify-start"
          >
            <Link to="/login" state={{ from: '/collection' }}>
              <button className="group bg-[#e8d5b7] text-black px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-full flex items-center space-x-1.5 sm:space-x-2 hover:bg-[#d4c1a3] transition-all duration-300 shadow-lg hover:shadow-xl text-xs sm:text-sm md:text-base">
                <span className="font-medium tracking-wide">Explore Collection</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Decorative elements for luxury feel */}
      <div className="absolute top-1/4 right-12 w-64 h-64 bg-[#e8d5b7]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 left-12 w-96 h-96 bg-[#e8d5b7]/5 rounded-full blur-3xl"></div>
    </section>
  );
}
