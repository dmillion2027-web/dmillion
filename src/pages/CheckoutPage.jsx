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
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { StripePaymentForm } from '../components/ui/StripePaymentForm';
import fallbackImage from '../assets/images/Black_Leather_DMP_Monogram_Handbag-removebg-preview.png';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
const STEPS = ['Shipping', 'Payment', 'Confirmation'];

// Country list - ALL COUNTRIES
const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
  'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon',
  'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
  'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Czechia', 'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
  'East Timor', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji',
  'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Gibraltar', 'Greece', 'Grenada',
  'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hong Kong', 'Hungary', 'Iceland', 'India',
  'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho',
  'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macao', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives',
  'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia',
  'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua',
  'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama',
  'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Puerto Rico', 'Qatar', 'Republic of the Congo', 'Romania',
  'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal',
  'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea',
  'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan',
  'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda',
  'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
  'Yemen', 'Zambia', 'Zimbabwe'
].sort();

export function CheckoutPage() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const tax = getCartTotal() * 0.05;
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

  const [paymentError, setPaymentError] = useState('');

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setCurrentStep(1);
    window.scrollTo(0, 0);
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    setLoading(true);
    try {
      // Generate tracking number
      const tracking = `DM${Date.now().toString().slice(-9)}`;

      // Create order using service key
      const { data: order, error } = await adminSupabase
        .from('orders')
        .insert([{
          user_id: user?.id,
          tracking_number: tracking,
          status: 'processing',
          total_amount: total,
          shipping_address: `${shipping.address_line1}, ${shipping.city}, ${shipping.country}`,
          payment_intent_id: paymentIntent.id,
        }])
        .select()
        .single();

      if (error) throw error;

      // Insert order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      await adminSupabase.from('order_items').insert(orderItems);

      // Reduce stock
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
        const emailResponse = await fetch('/api/send-order-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: shipping.email,
            customer_name: shipping.full_name,
            tracking_number: tracking,
            order_total: `$${total.toFixed(2)}`,
            shipping_address: `${shipping.address_line1}, ${shipping.city}, ${shipping.country}`,
            order_items: cartItems.map(item => `${item.name} x${item.quantity}`).join(', '),
            contact_email: 'support@dmillion.com',
          })
        });

        if (emailResponse.ok) {
          console.log('✅ Order confirmation email sent!');
        } else {
          console.error('Email failed:', await emailResponse.json());
        }
      } catch (emailErr) {
        console.error('Email error:', emailErr);
      }

      setOrderData({ ...order, tracking_number: tracking });
      clearCart();
      setCurrentStep(2);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Order creation error:', err);
      setPaymentError('Failed to create order. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentError = (errorMessage) => {
    setPaymentError(errorMessage);
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

              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-[#e8d5b7] rounded-full flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-black" />
                    </div>
                    <h2 className="text-xl font-serif">Payment Details</h2>
                  </div>

                  <Elements stripe={stripePromise}>
                    <StripePaymentForm
                      total={total}
                      orderId={user?.id}
                      shippingEmail={shipping.email}
                      shippingName={shipping.full_name}
                      onPaymentSuccess={handlePaymentSuccess}
                      onPaymentError={handlePaymentError}
                    />
                  </Elements>

                  <div className="flex items-center justify-center space-x-2 mt-4 text-xs text-gray-500">
                    <Lock className="w-3 h-3" />
                    <span>Your payment is secure & encrypted</span>
                  </div>
                </div>
              </div>

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
