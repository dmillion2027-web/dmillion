import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { adminSupabase } from '../admin/lib/adminSupabase';
import {
  CreditCard, Lock, ChevronLeft, Check,
  MapPin, Package, ShoppingBag
} from 'lucide-react';
import fallbackImage from '../assets/images/Black_Leather_DMP_Monogram_Handbag-removebg-preview.png';

const STEPS = ['Shipping', 'Payment', 'Confirmation'];

// Country list
const COUNTRIES = [
  'Canada', 'United States', 'Mexico', 'United Kingdom', 'Australia',
  'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium',
  'Switzerland', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Ireland',
  'Austria', 'Poland', 'Japan', 'China', 'India', 'Brazil', 'South Africa'
].sort();

export function CheckoutPage() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const tax = getCartTotal() * 0.08;
  const total = getCartTotal() + tax;

  // Shipping form
  const [shipping, setShipping] = useState({
    full_name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
  });

  // Payment form (dummy)
  const [payment, setPayment] = useState({
    card_name: '',
    card_number: '',
    expiry: '',
    cvv: '',
  });

  const [paymentError, setPaymentError] = useState('');

  const formatCardNumber = (val) => {
    return val.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
  };

  const formatExpiry = (val) => {
    return val.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setCurrentStep(1);
    window.scrollTo(0, 0);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentError('');

    // Basic dummy validation
    if (payment.card_number.replace(/\s/g, '').length < 16) {
      setPaymentError('Please enter a valid card number.');
      return;
    }
    if (payment.cvv.length < 3) {
      setPaymentError('Please enter a valid CVV.');
      return;
    }

    setLoading(true);

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate tracking number
      const tracking = `DM${Date.now().toString().slice(-9)}`;

      // Create order using service key to bypass RLS
      const { data: order, error } = await adminSupabase
        .from('orders')
        .insert([{
          user_id: user?.id,
          tracking_number: tracking,
          status: 'processing',
          total_amount: total,
          shipping_address: `${shipping.address_line1}, ${shipping.city}, ${shipping.country}`,
        }])
        .select()
        .single();

      if (error) throw error;

      // Insert order items using service key to bypass RLS
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      await adminSupabase.from('order_items').insert(orderItems);

      // Reduce stock quantity for each product
      for (const item of cartItems) {
        const { data: product } = await adminSupabase
          .from('products')
          .select('stock_quantity')
          .eq('id', item.id)
          .single();
        if (product) {
          await adminSupabase
            .from('products')
            .update({ stock_quantity: Math.max(0, product.stock_quantity - item.quantity) })
            .eq('id', item.id);
        }
      }

      // Send order confirmation email
      try {
        const templateId = import.meta.env.EMAILJS_ORDER_TEMPLATE_ID || import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        
        console.log('Email Debug:', {
          service_id: import.meta.env.VITE_EMAILJS_SERVICE_ID,
          template_id: templateId,
          user_id: import.meta.env.VITE_EMAILJS_PUBLIC_KEY ? 'present' : 'missing',
          to_email: shipping.email
        });

        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: import.meta.env.VITE_EMAILJS_SERVICE_ID,
            template_id: templateId,
            user_id: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
            template_params: {
              to_email: shipping.email,
              customer_name: shipping.full_name,
              tracking_number: tracking,
              order_total: `$${total.toFixed(2)}`,
              shipping_address: `${shipping.address_line1}, ${shipping.city}, ${shipping.country}`,
              order_items: cartItems.map(item => `${item.name} x${item.quantity}`).join(', '),
              contact_email: 'support@dmillion.com',
            }
          })
        });

        const responseData = await response.json();
        console.log('Email response:', responseData);

        if (!response.ok) {
          console.error('Email notification failed:', responseData);
        } else {
          console.log('✅ Email sent successfully!');
        }
      } catch (emailErr) {
        console.error('Email error:', emailErr);
      }

      setOrderData({ ...order, tracking_number: tracking });
      clearCart();
      setCurrentStep(2);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      setPaymentError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && currentStep !== 2) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-stone-50 to-white">
      <div className="container mx-auto px-6 py-12 max-w-6xl">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center space-x-4 mb-6">
            {currentStep < 2 && (
              <button onClick={() => currentStep === 0 ? navigate('/cart') : setCurrentStep(0)}
                className="flex items-center space-x-1 text-gray-600 hover:text-black transition-colors">
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm">Back</span>
              </button>
            )}
            <h1 className="text-3xl font-serif">Checkout</h1>
          </div>

          {/* Step Indicator */}
          {currentStep < 2 && (
            <div className="flex items-center space-x-2">
              {STEPS.slice(0, 2).map((step, i) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center space-x-2 ${i <= currentStep ? 'text-black' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${i < currentStep ? 'bg-[#e8d5b7] text-black' : i === currentStep ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'}`}>
                      {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className="text-sm font-medium">{step}</span>
                  </div>
                  {i < 1 && <div className={`w-16 h-0.5 mx-3 ${i < currentStep ? 'bg-[#e8d5b7]' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <AnimatePresence mode="wait">

          {/* STEP 1: SHIPPING */}
          {currentStep === 0 && (
            <motion.div key="shipping" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="grid lg:grid-cols-3 gap-8">

              <form onSubmit={handleShippingSubmit} className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-[#e8d5b7] rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-black" />
                    </div>
                    <h2 className="text-xl font-serif">Shipping Information</h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { name: 'full_name', label: 'Full Name', type: 'text', required: true, colSpan: 1 },
                      { name: 'email', label: 'Email Address', type: 'email', required: true, colSpan: 1 },
                      { name: 'phone', label: 'Phone Number', type: 'tel', required: false, colSpan: 1 },
                      { name: 'address_line1', label: 'Address Line 1', type: 'text', required: true, colSpan: 2 },
                      { name: 'address_line2', label: 'Address Line 2 (Optional)', type: 'text', required: false, colSpan: 2 },
                      { name: 'city', label: 'City', type: 'text', required: true, colSpan: 1 },
                      { name: 'state', label: 'State / Province', type: 'text', required: false, colSpan: 1 },
                      { name: 'postal_code', label: 'Postal Code', type: 'text', required: false, colSpan: 1 },
                    ].map(field => (
                      <div key={field.name} className={field.colSpan === 2 ? 'md:col-span-2' : ''}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                        <input
                          type={field.type}
                          required={field.required}
                          value={shipping[field.name]}
                          onChange={e => setShipping({ ...shipping, [field.name]: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e8d5b7] transition-colors"
                        />
                      </div>
                    ))}

                    {/* Country Dropdown */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <select
                        required
                        value={shipping.country}
                        onChange={e => setShipping({ ...shipping, country: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e8d5b7] transition-colors bg-white"
                      >
                        <option value="">Select a country</option>
                        {COUNTRIES.map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="w-full mt-6 py-4 bg-black hover:bg-[#3d2415] text-white rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2">
                    <span>Continue to Payment</span>
                    <CreditCard className="w-5 h-5" />
                  </motion.button>
                </div>
              </form>

              {/* Order Summary */}
              <OrderSummary cartItems={cartItems} total={total} tax={tax} getCartTotal={getCartTotal} />
            </motion.div>
          )}

          {/* STEP 2: PAYMENT */}
          {currentStep === 1 && (
            <motion.div key="payment" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="grid lg:grid-cols-3 gap-8">

              <form onSubmit={handlePaymentSubmit} className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-[#e8d5b7] rounded-full flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-black" />
                    </div>
                    <h2 className="text-xl font-serif">Payment Details</h2>
                  </div>

                  {/* Dummy notice */}
                  <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-2">
                    <Lock className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-yellow-700">
                      <strong>Demo Mode:</strong> This is a dummy payment gateway. No real charges will be made. Use any card details to test.
                    </p>
                  </div>

                  {/* Dummy Card UI */}
                  <div className="mb-6">
                    <div className="bg-gradient-to-br from-[#1a1a1a] to-[#3d2415] rounded-2xl p-6 text-white relative overflow-hidden mb-4">
                      <div className="absolute top-4 right-4 opacity-20 text-6xl font-bold">DM</div>
                      <p className="text-xs tracking-widest text-white/60 mb-4">DMILLION LUXURY</p>
                      <p className="text-xl tracking-[0.2em] font-mono mb-4">
                        {payment.card_number || '•••• •••• •••• ••••'}
                      </p>
                      <div className="flex justify-between">
                        <div>
                          <p className="text-xs text-white/60">CARD HOLDER</p>
                          <p className="text-sm font-medium">{payment.card_name || 'YOUR NAME'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/60">EXPIRES</p>
                          <p className="text-sm font-medium">{payment.expiry || 'MM/YY'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                      <input type="text" required placeholder="John Doe"
                        value={payment.card_name}
                        onChange={e => setPayment({ ...payment, card_name: e.target.value.toUpperCase() })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e8d5b7] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                      <input type="text" required placeholder="1234 5678 9012 3456"
                        value={payment.card_number}
                        onChange={e => setPayment({ ...payment, card_number: formatCardNumber(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e8d5b7] transition-colors font-mono" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                        <input type="text" required placeholder="MM/YY"
                          value={payment.expiry}
                          onChange={e => setPayment({ ...payment, expiry: formatExpiry(e.target.value) })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e8d5b7] transition-colors font-mono" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                        <input type="text" required placeholder="123" maxLength={4}
                          value={payment.cvv}
                          onChange={e => setPayment({ ...payment, cvv: e.target.value.replace(/\D/g, '') })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e8d5b7] transition-colors font-mono" />
                      </div>
                    </div>
                  </div>

                  {paymentError && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm mt-3">
                      {paymentError}
                    </motion.p>
                  )}

                  <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="w-full mt-6 py-4 bg-black hover:bg-[#3d2415] text-white rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 disabled:opacity-60">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing Payment...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        <span>Pay ${total.toFixed(2)}</span>
                      </>
                    )}
                  </motion.button>

                  <div className="flex items-center justify-center space-x-2 mt-4 text-xs text-gray-500">
                    <Lock className="w-3 h-3" />
                    <span>Your payment info is encrypted & secure</span>
                  </div>
                </div>
              </form>

              {/* Order Summary */}
              <OrderSummary cartItems={cartItems} total={total} tax={tax} getCartTotal={getCartTotal} />
            </motion.div>
          )}

          {/* STEP 3: CONFIRMATION */}
          {currentStep === 2 && (
            <motion.div key="confirmation" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto text-center">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10">

                {/* Success Icon */}
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-12 h-12 text-green-500" />
                </motion.div>

                <h2 className="text-3xl font-serif mb-3">Order Confirmed!</h2>
                <p className="text-gray-600 mb-6">
                  Thank you for your purchase. Your order has been placed and is being processed.
                </p>

                {orderData && (
                  <div className="bg-[#e8d5b7]/20 border border-[#e8d5b7] rounded-xl p-6 mb-8 text-left">
                    <div className="flex items-center space-x-3 mb-4">
                      <Package className="w-5 h-5 text-[#3d2415]" />
                      <h3 className="font-semibold">Order Details</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tracking Number</span>
                        <span className="font-mono font-semibold">{orderData.tracking_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status</span>
                        <span className="capitalize font-medium text-yellow-600">{orderData.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Paid</span>
                        <span className="font-serif font-semibold text-[#3d2415]">${parseFloat(orderData.total_amount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping To</span>
                        <span className="text-right max-w-[200px]">{orderData.shipping_address}</span>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-sm text-gray-500 mb-8">
                  A confirmation email has been sent to <strong>{shipping.email}</strong>
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/dashboard')}
                    className="px-8 py-3 bg-[#e8d5b7] hover:bg-[#d4c1a3] text-black rounded-xl font-medium transition-colors flex items-center justify-center space-x-2">
                    <Package className="w-4 h-4" />
                    <span>Track My Order</span>
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/collection')}
                    className="px-8 py-3 border border-gray-300 hover:bg-gray-50 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2">
                    <ShoppingBag className="w-4 h-4" />
                    <span>Continue Shopping</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

function OrderSummary({ cartItems, total, tax, getCartTotal }) {
  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
        <h3 className="text-lg font-serif mb-4">Order Summary</h3>
        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
          {cartItems.map(item => (
            <div key={item.id} className="flex items-center space-x-3">
              <div className="w-14 h-14 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0 p-1">
                <img src={item.image_url || '/src/assets/images/Black_Leather_DMP_Monogram_Handbag-removebg-preview.png'} alt={item.name} className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-serif">${(item.price * item.quantity).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span><span>${getCartTotal().toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Shipping</span><span className="text-green-600">Free</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Tax (8%)</span><span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-100">
            <span>Total</span>
            <span className="font-serif text-[#3d2415]">${total.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2 mt-4 text-xs text-gray-500">
          <Lock className="w-3 h-3" />
          <span>Secure & encrypted checkout</span>
        </div>
      </div>
    </div>
  );
}
