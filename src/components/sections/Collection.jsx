import { motion } from 'framer-motion';
import { ProductCard } from '../ui/ProductCard';
import { ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../ui/Toast';

export function Collection() {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();

    // Real-time subscription
    const subscription = supabase
      .channel('products-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' }, 
        () => {
          fetchProducts();
        }
      )
      .subscribe();

    // Polling fallback every 30 seconds to catch any missed updates
    const interval = setInterval(() => {
      fetchProducts();
    }, 30000);

    return () => {
      supabase.removeChannel(subscription);
      clearInterval(interval);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Only use fallback if Supabase completely fails to connect
      setProducts([
        { id: 1, name: 'Classic Handbag', description: 'Elegance in your hands.', category: 'handbag', price: 2499.99, image_url: '', stock_quantity: 15, featured: true, color: '#1a1a1a' },
        { id: 2, name: 'Signature Tote', description: 'Carry luxury everywhere.', category: 'tote', price: 2899.99, image_url: '', stock_quantity: 12, featured: true, color: '#2c2c2c' },
        { id: 3, name: 'Chic Shoulder Bag', description: 'Style that stands out.', category: 'shoulder', price: 2699.99, image_url: '', stock_quantity: 8, featured: true, color: '#0a0a0a' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const handleViewDetails = (product) => {
    window.location.href = `/product/${product.id}`;
  };

  const handleViewCollection = () => {
    if (!user) {
      navigate('/login', { state: { from: '/collection' } });
    } else {
      navigate('/collection');
    }
  };

  // Show all if logged in, only 3 if not
  const visibleProducts = user ? products : products.slice(0, 3);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-stone-50">
      <div className="container mx-auto px-6">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 sm:mb-16 px-4"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-serif mb-3 sm:mb-4">Our Collection</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-xs sm:text-sm md:text-base">
            Discover our exclusive range of luxury bags.
          </p>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="w-24 h-1 bg-gradient-to-r from-transparent via-[#e8d5b7] to-transparent mx-auto mt-6"
          />
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#e8d5b7]"></div>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {visibleProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                >
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                    onViewDetails={handleViewDetails}
                  />
                </motion.div>
              ))}
            </div>

            {products.length === 0 && !loading && (
              <div className="text-center py-20 col-span-3">
                <p className="text-gray-500 text-lg">No products available yet. Check back soon!</p>
              </div>
            )}
          </>
        )}

        {/* View Collection Button - only show when not logged in */}
        {!user && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center mt-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleViewCollection}
              className="group inline-flex items-center space-x-2 bg-white text-black px-8 py-4 rounded-sm border-2 border-black hover:bg-black hover:text-white transition-all duration-300"
            >
              <span className="text-sm tracking-wide">View Collection</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
