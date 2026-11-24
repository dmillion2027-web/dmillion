import { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { Lock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export function StripePaymentForm({ total, orderId, shippingEmail, shippingName, onPaymentSuccess, onPaymentError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  // Create payment intent on mount
  useEffect(() => {
    const createIntent = async () => {
      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: total,
            orderId: orderId,
            customerEmail: shippingEmail,
            customerName: shippingName,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to create payment intent');
        }
        setClientSecret(data.clientSecret);
      } catch (err) {
        setError(err.message);
        console.error('Intent creation error:', err);
      }
    };

    if (total > 0) {
      createIntent();
    }
  }, [total, orderId, shippingEmail, shippingName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!stripe || !elements || !clientSecret) {
      setError('Payment system not ready. Please refresh and try again.');
      return;
    }

    setLoading(true);

    try {
      // Confirm payment with Stripe
      const { paymentIntent, error: stripeError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        redirect: 'if_required',
        confirmParams: {
          return_url: `${window.location.origin}/checkout?step=confirmation`,
          payment_method_data: {
            billing_details: {
              name: shippingName,
              email: shippingEmail,
            },
          },
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        onPaymentError(stripeError.message);
        setLoading(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        console.log('✅ Payment successful!', paymentIntent);
        onPaymentSuccess(paymentIntent);
      } else if (paymentIntent.status === 'requires_action') {
        // Handle 3D Secure or other authentication
        console.log('⚠️ Payment requires additional action');
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
      {/* Payment Element - Supports cards, bank transfers, digital wallets, etc. */}
      {clientSecret && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <PaymentElement
            options={{
              layout: 'tabs',
              defaultValues: {
                billingDetails: {
                  name: shippingName,
                  email: shippingEmail,
                },
              },
            }}
          />
        </div>
      )}

      {/* Loading state while creating intent */}
      {!clientSecret && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="inline-flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
            <span className="text-gray-600">Preparing payment options...</span>
          </div>
        </div>
      )}

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
        disabled={loading || !stripe || !clientSecret}
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

      {/* Security & Payment Methods Message */}
      <div className="space-y-2 text-xs text-gray-500 text-center">
        <div className="flex items-center justify-center space-x-2">
          <Lock className="w-3 h-3" />
          <span>Secured by Stripe • PCI Compliant</span>
        </div>
        <p className="text-gray-400">We accept cards, bank transfers, and other local payment methods</p>
      </div>
    </form>
  );
}
