import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw,
  Plus, Minus, Star, ChevronLeft
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import fallbackImage from '../assets/images/Black_Leather_DMP_Monogram_Handbag-removebg-preview.png';

// Draggable + zoomable image viewer
function ImageViewer({ src, alt }) {
  const [scale, setScale] = useState(1);
  const constraintsRef = useRef(null);

  const handleWheel = (e) => {
    e.preventDefault();
    setScale((prev) => Math.min(Math.max(prev - e.deltaY * 0.001, 0.8), 3));
  };

  return (
    <div
      ref={constraintsRef}
      className="w-full h-full flex items-center justify-center overflow-hidden"
      onWheel={handleWheel}
    >
      <motion.img
        src={src}
        alt={alt}
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        animate={{ scale }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-4/5 h-4/5 object-contain select-none"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
}

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const features = [
    { icon: Truck, text: 'Free Express Shipping' },
    { icon: Shield, text: '2-Year Warranty' },
    { icon: RotateCcw, text: '30-Day Returns' },
  ];

  useEffect(() => {
    fetchProduct();

    // Real-time subscription
    const subscription = supabase
      .channel(`product-${id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'products', filter: `id=eq.${id}` },
        () => { fetchProduct(); }
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    }
  };

  const handleQuantityChange = (delta) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= (product?.stock_quantity || 1)) {
      setQuantity(newQty);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#e8d5b7] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-serif mb-4">Product Not Found</h2>
          <Link to="/collection" className="text-[#3d2415] hover:text-[#e8d5b7]">
            Browse Collection
          </Link>
        </div>
      </div>
    );
  }

  const displayImage = product.image_url || fallbackImage;

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-stone-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 mb-4"
        >
          <Link to="/" className="hover:text-[#3d2415]">Home</Link>
          <span>/</span>
          <Link to="/collection" className="hover:text-[#3d2415]">Collection</Link>
          <span>/</span>
          <span className="text-gray-900 truncate">{product.name}</span>
        </motion.div>

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 hover:text-black mb-6 sm:mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Back</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left - Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="sticky top-24">
              <div className="relative bg-gradient-to-br from-stone-100 to-[#e8d5b7]/20 rounded-2xl overflow-hidden shadow-xl flex items-center justify-center cursor-grab active:cursor-grabbing" style={{ height: '300px', minHeight: '300px' }}>
                <ImageViewer src={displayImage} alt={product.name} />

                {/* Featured Badge */}
                {product.featured && (
                  <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-[#e8d5b7] text-black text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-semibold">
                    Featured
                  </div>
                )}

                {/* Low stock badge */}
                {product.stock_quantity < 5 && product.stock_quantity > 0 && (
                  <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-red-500 text-white text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-semibold">
                    Only {product.stock_quantity} left!
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right - Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* Category */}
            <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 bg-[#e8d5b7]/30 text-[#3d2415] text-[10px] sm:text-xs tracking-widest uppercase rounded-full">
              {product.category}
            </span>

            {/* Title & Rating */}
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif mb-2 sm:mb-3">{product.name}</h1>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-[#e8d5b7] text-[#e8d5b7]" />
                  ))}
                </div>
                <span className="text-xs sm:text-sm text-gray-500">(127 reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#3d2415]">
              ${parseFloat(product.price).toLocaleString()}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">{product.description}</p>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              {product.stock_quantity > 0 ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs sm:text-sm text-green-700 font-medium">
                    In Stock ({product.stock_quantity} available)
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-xs sm:text-sm text-red-700 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4 sm:pt-6"></div>

            {/* Quantity Selector */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold mb-2 sm:mb-3">Quantity</label>
              <div className="flex items-center border border-gray-300 rounded-sm w-fit">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="p-2 sm:p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                <span className="px-4 sm:px-6 py-2 sm:py-3 font-semibold text-sm">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock_quantity}
                  className="p-2 sm:p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 sm:py-4 rounded-sm font-semibold transition-all text-xs sm:text-sm ${
                  addedToCart
                    ? 'bg-green-500 text-white'
                    : product.stock_quantity === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-[#e8d5b7] hover:text-black'
                }`}
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{addedToCart ? 'Added to Cart!' : 'Add to Cart'}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsFavorite(!isFavorite)}
                className="p-3 sm:p-4 border-2 border-gray-300 rounded-sm hover:border-[#e8d5b7] transition-colors"
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 sm:p-4 border-2 border-gray-300 rounded-sm hover:border-[#e8d5b7] transition-colors"
              >
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </motion.button>
            </div>

            {/* Accordion */}
            <div className="border-t border-gray-200 pt-4 sm:pt-6 space-y-3 sm:space-y-4">
              {[
                { title: 'Product Details', content: ['Premium Italian leather', 'Gold-tone hardware', 'Interior zip pocket and card slots', 'Adjustable chain strap', 'Dust bag included', 'Dimensions: 10" x 7" x 3"'] },
                { title: 'Care Instructions', content: ['Clean with a soft, dry cloth', 'Avoid exposure to direct sunlight', 'Store in provided dust bag', 'Keep away from water and chemicals'] },
                { title: 'Shipping & Returns', content: ['Free express shipping worldwide', '30-day return policy', 'Items must be unused with tags attached', 'Delivery within 3-5 business days'] },
              ].map((item) => (
                <details key={item.title} className="group">
                  <summary className="flex justify-between items-center cursor-pointer font-semibold py-2 text-xs sm:text-sm">
                    {item.title}
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 group-open:rotate-45 transition-transform" />
                  </summary>
                  <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600 space-y-1 pl-2">
                    {item.content.map((line, i) => <p key={i}>• {line}</p>)}
                  </div>
                </details>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
