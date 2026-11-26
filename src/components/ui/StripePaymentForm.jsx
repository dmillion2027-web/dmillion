import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { Lock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export function StripePaymentForm({ total, orderId, shippingEmail, shippingName, onPaymentSuccess, onPaymentError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // API base URL - use Vercel API endpoint
  const API_BASE = import.meta.env.VITE_API_URL || 'https://dmillion-web.vercel.app';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!stripe || !elements) {
      setError('Payment system not loaded. Please refresh and try again.');
      return;
    }

    setLoading(true);

    try {
      // 1. Create payment intent on backend
      const intentResponse = await fetch(`${API_BASE}/api/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          orderId: orderId,
          customerEmail: shippingEmail,
          customerName: shippingName,
        }),
      });

      const intentData = await intentResponse.json();

      if (!intentResponse.ok) {
        throw new Error(intentData.error || 'Failed to create payment');
      }

      // 2. Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      
      const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(
        intentData.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: shippingName,
              email: shippingEmail,
            },
          },
        }
      );

      if (stripeError) {
        console.error('❌ Stripe error:', {
          type: stripeError.type,
          code: stripeError.code,
          message: stripeError.message,
          decline_code: stripeError.decline_code,
        });
        setError(stripeError.message);
        onPaymentError(stripeError.message);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        console.log('✅ Payment successful!', paymentIntent);
        onPaymentSuccess(paymentIntent);
      } else {
        setError(`Payment status: ${paymentIntent.status}`);
        onPaymentError(`Payment status: ${paymentIntent.status}`);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message);
      onPaymentError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Card Input */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#1a1a1a',
                fontFamily: '"Playfair Display", serif',
                '::placeholder': {
                  color: '#999',
                },
              },
              invalid: {
                color: '#dc2626',
              },
            },
          }}
          className="p-2"
        />
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </motion.div>
      )}

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={loading || !stripe}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-6 py-4 bg-black hover:bg-[#3d2415] disabled:bg-gray-400 text-white rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
      >
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

      {/* Security Message */}
      <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
        <Lock className="w-3 h-3" />
        <span>Secured by Stripe • PCI Compliant</span>
      </div>
    </form>
  );
}
