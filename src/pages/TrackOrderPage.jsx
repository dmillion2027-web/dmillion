import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Search, Package, Truck, CheckCircle, MapPin, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import fallbackImage from '../assets/images/Black_Leather_DMP_Monogram_Handbag-removebg-preview.png';

export function TrackOrderPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const statusSteps = [
    { id: 'pending', label: 'Order Placed', icon: Package, description: 'Your order has been received' },
    { id: 'processing', label: 'Processing', icon: Clock, description: 'Preparing your order' },
    { id: 'shipped', label: 'Shipped', icon: Truck, description: 'Your order is on its way' },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle, description: 'Order delivered successfully' },
  ];

  useEffect(() => {
    if (!orderData?.id) return;

    const channel = supabase
      .channel('order-updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderData.id}` },
        (payload) => setOrderData(payload.new)
      ).subscribe();

    return () => supabase.removeChannel(channel);
  }, [orderData?.id]);

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) { setError('Please enter a tracking number'); return; }
    setLoading(true); setError(''); setOrderData(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from('orders')
        .select('*, order_items(*, products(*))')
        .eq('tracking_number', trackingNumber.trim())
        .single();

      if (supabaseError) throw supabaseError;
      if (data) { setOrderData(data); }
      else { setError('Order not found. Please check your tracking number.'); }
    } catch (err) {
      setError('Order not found. Please check your tracking number.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStepIndex = () => {
    if (!orderData) return -1;
    return statusSteps.findIndex(step => step.id === orderData.status);
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-stone-50 to-white">
      <div className="container mx-auto px-6 py-12">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-serif mb-4">Track Your Order</h1>
          <p className="text-gray-600">Enter your tracking number to see real-time updates</p>
        </motion.div>

        {/* Search Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleTrackOrder} className="relative">
            <div className="relative">
              <input
                type="text"
                value={trackingNumber}
                onChange={e => { setTrackingNumber(e.target.value); setError(''); }}
                placeholder="Enter tracking number (e.g., DM123456789)"
                className="w-full px-6 py-4 pr-32 border-2 border-gray-300 rounded-sm focus:outline-none focus:border-[#e8d5b7] transition-colors text-lg"
              />
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" disabled={loading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black hover:bg-[#3d2415] text-white px-6 py-2 rounded-sm transition-colors disabled:opacity-50 flex items-center space-x-2">
                {loading
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><Search className="w-5 h-5" /><span>Track</span></>
                }
              </motion.button>
            </div>
            {error && (
              <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm mt-2">{error}</motion.p>
            )}
          </form>
          <p className="text-sm text-gray-500 mt-4 text-center">
            You can find your tracking number in your order confirmation email
          </p>
        </motion.div>

        {/* Order Details */}
        {orderData && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">

            {/* Order Info */}
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Tracking Number</h3>
                  <p className="text-lg font-mono">{orderData.tracking_number}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Order Date</h3>
                  <p className="text-lg">{new Date(orderData.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Status</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${
                    orderData.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    orderData.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                    'bg-[#e8d5b7]/40 text-[#3d2415]'
                  }`}>{orderData.status}</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Total Amount</h3>
                  <p className="text-2xl font-serif text-[#3d2415]">${parseFloat(orderData.total_amount).toLocaleString()}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-[#3d2415] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-1">Shipping Address</h3>
                    <p className="text-gray-700">{orderData.shipping_address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-serif mb-8">Order Status</h2>
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gray-200">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: currentStepIndex >= 0 ? `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` : 0 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="w-full bg-[#e8d5b7]"
                  />
                </div>

                <div className="relative space-y-8">
                  {statusSteps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    return (
                      <motion.div key={step.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-4">
                        <motion.div
                          animate={{ scale: isCurrent ? [1, 1.1, 1] : 1 }}
                          transition={{ repeat: isCurrent ? Infinity : 0, duration: 2 }}
                          className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted ? 'bg-[#e8d5b7] text-black' : 'bg-gray-200 text-gray-400'}`}>
                          <step.icon className="w-8 h-8" />
                        </motion.div>
                        <div className="flex-1 pt-2">
                          <h3 className={`text-xl font-semibold mb-1 ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</h3>
                          <p className={`text-sm ${isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>{step.description}</p>
                          {isCurrent && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                              className="mt-2 inline-block px-3 py-1 bg-[#e8d5b7]/30 text-[#3d2415] text-xs rounded-full font-semibold">
                              Current Status
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 flex items-center justify-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Real-time tracking active</span>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-serif mb-6">Order Items</h2>
              <div className="space-y-4">
                {orderData.order_items?.map((item, index) => (
                  <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-4 p-4 bg-gradient-to-br from-stone-50 to-[#e8d5b7]/20 rounded-lg">
                    <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center flex-shrink-0 p-2">
                      <img src={item.products?.image_url || fallbackImage} alt={item.products?.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.products?.name || 'Product'}</h3>
                      <p className="text-sm text-gray-600 capitalize">{item.products?.category} • Qty: {item.quantity}</p>
                    </div>
                    <div className="text-xl font-serif text-[#3d2415]">
                      ${(item.price * item.quantity).toLocaleString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-gradient-to-br from-stone-900 to-black text-white p-8 rounded-lg text-center">
              <h3 className="text-2xl font-serif mb-4">Need Help?</h3>
              <p className="text-gray-300 mb-6">Our customer service team is here to assist you 24/7</p>
              <div className="flex flex-wrap justify-center gap-4">
                <button className="px-6 py-3 bg-[#e8d5b7] hover:bg-[#d4c1a3] text-black rounded-sm transition-colors font-medium">
                  Contact Support
                </button>
                <button className="px-6 py-3 border border-white hover:bg-white hover:text-black rounded-sm transition-colors">
                  View FAQs
                </button>
              </div>
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
}
