import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/images/logo.png';

export function Header({ cartItemCount = 0 }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  
  // Check if we're on the homepage
  const isHomePage = location.pathname === '/';

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Collection', path: '/collection' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${isHomePage
            ? (isScrolled 
                ? 'bg-[#2a1810]/95 backdrop-blur-md shadow-lg' 
                : 'bg-transparent')
            : 'bg-[#2a1810]/95 backdrop-blur-md shadow-lg'
          }
        `}
      >
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
              <img src={logo} alt="DMILLION Logo" className="h-14 sm:h-16 md:h-20 w-auto object-contain" />
              <div>
                <h3 className="text-sm sm:text-base font-serif tracking-wider text-white">
                  DMILLION
                </h3>
                <p className="text-[10px] sm:text-[11px] tracking-[0.2em] text-gray-300 font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Luxury Fashion
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-12">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-xs md:text-sm text-white hover:text-[#e8d5b7] transition-colors font-light tracking-widest uppercase"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              
              {/* User Dashboard - Show if logged in */}
              {user && (
                <Link to="/dashboard" className="hidden md:block">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-1.5 sm:p-2 text-white hover:text-[#e8d5b7] transition-colors"
                    aria-label="Dashboard"
                  >
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>
                </Link>
              )}

              {/* Shop Now Button - Desktop - Show if not logged in */}
              {!user && (
                <Link to="/login" state={{ from: '/collection' }} className="hidden md:block">
                  <button className="bg-[#e8d5b7] hover:bg-[#d4c1a3] text-black px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 flex items-center space-x-1 sm:space-x-2">
                    <span>Shop Now</span>
                    <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </Link>
              )}

              {/* Shopping Cart - Only show when items in cart */}
              {cartItemCount > 0 && (
                <Link to="/cart">
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative p-1.5 sm:p-2 text-white hover:text-[#e8d5b7] transition-colors"
                    aria-label="Shopping cart"
                  >
                    <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-[#e8d5b7] text-black text-[9px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-semibold"
                    >
                      {cartItemCount > 9 ? '9+' : cartItemCount}
                    </motion.span>
                  </motion.button>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-1.5 sm:p-2 text-white hover:text-[#e8d5b7] transition-colors"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-80 bg-[#2a1810] z-50 shadow-2xl md:hidden"
            >
              <div className="flex flex-col h-full">
                
                {/* Menu Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
                  <h3 className="text-base sm:text-lg font-serif text-white">Menu</h3>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto p-4 sm:p-6 pb-2 sm:pb-4">
                  <ul className="space-y-1 sm:space-y-2">
                    {navLinks.map((link, index) => (
                      <motion.li
                        key={link.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          to={link.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white hover:bg-[#e8d5b7]/20 hover:text-[#e8d5b7] rounded-lg transition-colors"
                        >
                          {link.name}
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </nav>

                {/* Menu Footer */}
                <div className="p-3 sm:p-6 border-t border-white/10 bg-gradient-to-b from-transparent to-black/30">
                  {user ? (
                    <div className="space-y-3">
                      <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                        <button className="w-full bg-[#e8d5b7] hover:bg-[#d4c1a3] text-black py-2.5 sm:py-3 rounded-full font-medium text-xs sm:text-sm transition-colors mb-3">
                          My Dashboard
                        </button>
                      </Link>
                      <Link to="/collection" onClick={() => setIsMobileMenuOpen(false)}>
                        <button className="w-full border border-white text-white hover:bg-white/10 py-2.5 sm:py-3 rounded-full font-medium text-xs sm:text-sm transition-colors">
                          Shop Now
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <Link to="/login" state={{ from: '/collection' }} onClick={() => setIsMobileMenuOpen(false)}>
                      <button className="w-full bg-[#e8d5b7] hover:bg-[#d4c1a3] text-black py-2.5 sm:py-3 rounded-full font-medium text-xs sm:text-sm transition-colors">
                        Shop Now
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
