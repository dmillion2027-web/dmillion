import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { useState } from 'react';
import fallbackImage from '../../assets/images/Black_Leather_DMP_Monogram_Handbag-removebg-preview.png';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function ProductCard({ product, onAddToCart, onViewDetails }) {
  const [isHovered, setIsHovered] = useState(false);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isFavorite = isInWishlist(product.id);

  const handleWishlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    await toggleWishlist(product);
  };

  // Use product image from Supabase, fall back to local image if none
  const displayImage = product.image_url || fallbackImage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300"
    >
      {/* Bag Image Display */}
      <div className="relative h-64 sm:h-72 md:h-80 bg-gradient-to-br from-stone-50 to-[#e8d5b7]/20 overflow-hidden flex items-center justify-center p-6 sm:p-8">
        <img 
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-contain transform group-hover:scale-105 transition-all duration-300 ease-out"
        />

        {/* Wishlist Heart - Always Visible */}
        <motion.button
          onClick={handleWishlist}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-full shadow-lg flex items-center justify-center transition-colors duration-300 z-10"
        >
          <Heart 
            className="w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300"
            fill={isFavorite ? "red" : "none"}
            stroke={isFavorite ? "red" : "#9ca3af"}
          />
        </motion.button>

        {/* View Details - shows on hover */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => onViewDetails(product)}
          className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#e8d5b7] transition-colors duration-300 z-10"
        >
          <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
        </motion.button>

        {/* Stock Badge */}
        {product.stock_quantity < 5 && product.stock_quantity > 0 && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
            Only {product.stock_quantity} left
          </div>
        )}

        {/* Featured Badge */}
        {product.featured && !( product.stock_quantity < 5) && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-[#e8d5b7] text-black text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-semibold">
            Featured
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 sm:p-6">
        <div className="mb-2 sm:mb-3">
          <span className="text-[10px] sm:text-xs tracking-widest text-gray-500 uppercase">
            {product.category}
          </span>
        </div>

        <h3 className="text-lg sm:text-xl font-serif mb-2 group-hover:text-[#3d2415] transition-colors">
          {product.name}
        </h3>

        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between gap-2">
          <div className="text-xl sm:text-2xl font-serif">
            ${product.price.toLocaleString()}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAddToCart(product)}
            disabled={product.stock_quantity === 0}
            className={`
              flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-sm transition-all duration-300 text-xs sm:text-sm
              ${product.stock_quantity === 0 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-black text-white hover:bg-[#e8d5b7] hover:text-black'
              }
            `}
          >
            <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">
              {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </span>
            <span className="sm:hidden">
              {product.stock_quantity === 0 ? 'Out' : 'Add'}
            </span>
          </motion.button>
        </div>
      </div>

      {/* Hover effect overlay */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#e8d5b7] via-[#d4c1a3] to-[#e8d5b7] origin-left"
      />
    </motion.div>
  );
}
