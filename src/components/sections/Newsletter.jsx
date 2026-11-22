import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Subscribe to newsletter via Supabase
      const { data, error: supabaseError } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email: email.toLowerCase() }])
        .select();

      if (supabaseError) {
        // Handle duplicate email error
        if (supabaseError.code === '23505') {
          setError('This email is already subscribed to our newsletter.');
        } else {
          throw supabaseError;
        }
      } else {
        setSuccess(true);
        setEmail('');
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      }
    } catch (err) {
      console.error('Newsletter subscription error:', err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-stone-900 via-black to-stone-900 text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#e8d5b7] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#e8d5b7] rounded-full blur-3xl"></div>
      </div>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)`
        }}></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-6 px-4"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif mb-3">
              Stay in the Loop
            </h2>
            <p className="text-gray-300 text-sm sm:text-base">
              Get the latest styles and exclusive offers.
            </p>
          </motion.div>

          {/* Subscription Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="max-w-xl mx-auto"
          >
            {success ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-green-500/20 border border-green-500 rounded-lg p-6 flex items-center justify-center space-x-3"
              >
                <CheckCircle className="w-6 h-6 text-green-400" />
                <p className="text-green-400 font-medium">
                  Thank you for subscribing! Check your email for confirmation.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      placeholder="Enter your email"
                      className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#e8d5b7] transition-colors text-sm sm:text-base"
                      disabled={loading}
                    />
                    <Mail className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading || !email}
                    className="px-6 py-3 sm:py-4 bg-[#e8d5b7] hover:bg-[#d4c1a3] text-black rounded-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 min-w-[100px] sm:min-w-[120px] text-sm sm:text-base"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Subscribe</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm text-center"
                  >
                    {error}
                  </motion.p>
                )}

                <p className="text-gray-400 text-xs text-center">
                  By subscribing, you agree to our Privacy Policy.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>

      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#e8d5b7]/30"></div>
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#e8d5b7]/30"></div>
    </section>
  );
}
