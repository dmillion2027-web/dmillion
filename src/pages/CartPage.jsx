import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import fallbackImage from '../assets/images/Black_Leather_DMP_Monogram_Handbag-removebg-preview.png';

export function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoMsg, setPromoMsg] = useState('');

  const tax = getCartTotal() * 0.08;
  const total = getCartTotal() - discount + tax;

  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === 'dmillion10') {
      setDiscount(getCartTotal() * 0.1);
      setPromoMsg('✓ Promo code applied!');
    } else if (promoCode) {
      setPromoMsg('Invalid promo code.');
      setDiscount(0);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-gradient-to-b from-stone-50 to-white">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md mx-auto px-6">
          <div className="w-24 h-24 bg-[#e8d5b7]/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-[#3d2415]" />
          </div>
          <h2 className="text-3xl font-serif mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8">Looks like you haven't added any items yet.</p>
          <Link to="/collection">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="bg-[#e8d5b7] hover:bg-[#d4c1a3] text-black px-8 py-4 rounded-sm flex items-center space-x-2 mx-auto transition-colors">
              <span>Continue Shopping</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-stone-50 to-white">
      <div className="container mx-auto px-6 py-12">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-serif mb-2">Shopping Cart</h1>
          <p className="text-gray-600">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <motion.div
                key={`${item.id}-${item.selectedColor}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col sm:flex-row gap-6">

                  {/* Product Image */}
                  <div className="w-full sm:w-32 h-32 bg-gradient-to-br from-stone-100 to-[#e8d5b7]/20 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden p-2">
                    <img
                      src={item.image_url || fallbackImage}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-serif mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">Color: {item.selectedColor || 'Black'}</p>
                        <p className="text-sm text-gray-600 capitalize">{item.category}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
                      {/* Quantity */}
                      <div className="flex items-center border border-gray-300 rounded-sm w-fit">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 hover:bg-gray-100 transition-colors">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:bg-gray-100 transition-colors">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="text-2xl font-serif text-[#3d2415]">
                          ${(item.price * item.quantity).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">${item.price.toLocaleString()} each</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-6 rounded-lg shadow-lg sticky top-24">
              <h2 className="text-2xl font-serif mb-6">Order Summary</h2>

              {/* Promo Code */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <label className="block text-sm font-semibold mb-2">Promo Code</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={e => { setPromoCode(e.target.value); setPromoMsg(''); }}
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-[#e8d5b7] transition-colors"
                  />
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleApplyPromo}
                    className="px-4 py-2 bg-[#e8d5b7] hover:bg-[#d4c1a3] text-black rounded-sm transition-colors">
                    <Tag className="w-5 h-5" />
                  </motion.button>
                </div>
                {promoMsg && (
                  <p className={`text-sm mt-2 ${discount > 0 ? 'text-green-600' : 'text-red-500'}`}>{promoMsg}</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${getCartTotal().toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-semibold">Free</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-semibold">Total</span>
                    <span className="text-3xl font-serif text-[#3d2415]">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/checkout')}
                className="w-full bg-black hover:bg-[#3d2415] text-white py-4 rounded-sm font-semibold transition-colors flex items-center justify-center space-x-2 mb-4">
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              <Link to="/collection">
                <button className="w-full text-center text-gray-600 hover:text-black transition-colors text-sm">
                  Continue Shopping
                </button>
              </Link>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2 text-sm text-gray-600">
                {['Secure checkout', 'Free shipping & returns', '2-year warranty'].map(t => (
                  <div key={t} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#e8d5b7] rounded-full"></div>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
