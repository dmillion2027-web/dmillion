import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';

// ─── EmailJS Config ───────────────────────────────────────────────
// Try both v1.0 and v1.1 API endpoints
const EMAILJS_SERVICE_ID  = 'service_0dphftg';
const EMAILJS_TEMPLATE_ID = 'template_7885mh2';
const EMAILJS_PUBLIC_KEY  = '2CPqgqjZJeBh8LJ9L';
// ─────────────────────────────────────────────────────────────────

export function ContactPage() {
  const formRef = useRef();
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', subject: '', message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const contactInfo = [
    { icon: Mail,  title: 'Email Us',      details: 'dmillion2027@gmail.com',                       link: 'mailto:dmillion2027@gmail.com' },
    { icon: Phone, title: 'Call Us',        details: '+1 289 200 3045',                             link: 'tel:+12892003045' },
    { icon: MapPin, title: 'Visit Us',      details: '1580 Kingston Rd, Pickering, Ontario, L1V6M6, Canada' },
    { icon: Clock, title: 'Business Hours', details: 'Mon-Fri: 9AM-6PM EST' },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSuccess(false), 6000);
    } catch (err) {
      console.error('EmailJS error:', err);
      console.log('Service ID:', EMAILJS_SERVICE_ID);
      console.log('Template ID:', EMAILJS_TEMPLATE_ID);
      console.log('Public Key:', EMAILJS_PUBLIC_KEY);
      setError('Failed to send. Email us directly at dmillion2027@gmail.com');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20">

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative py-16 sm:py-20 bg-gradient-to-br from-stone-900 to-black text-white overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)`
          }} />
        </div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif mb-4 sm:mb-6">Get in Touch</h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 px-4">We'd love to hear from you. Our team is here to help.</p>
          </motion.div>
        </div>
      </motion.section>

      {/* Contact Info Cards */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16 sm:mb-20">
            {contactInfo.map((info, index) => (
              <motion.div key={info.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}
                className="bg-gradient-to-br from-stone-50 to-[#e8d5b7]/20 p-4 sm:p-6 rounded-lg text-center transition-all duration-300"
              >
                <motion.div whileHover={{ rotate: 10, scale: 1.1 }} transition={{ duration: 0.2 }}
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <info.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-[#e8d5b7]" />
                </motion.div>
                <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">{info.title}</h3>
                {info.link
                  ? <a href={info.link} className="text-xs sm:text-sm text-gray-600 hover:text-[#3d2415] transition-colors break-words">{info.details}</a>
                  : <p className="text-xs sm:text-sm text-gray-600">{info.details}</p>
                }
              </motion.div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-stone-50 to-[#e8d5b7]/20 p-6 sm:p-8 lg:p-12 rounded-2xl shadow-xl"
            >
              <h2 className="text-2xl sm:text-3xl font-serif mb-2 text-center">Send Us a Message</h2>
              <p className="text-gray-500 text-center mb-6 sm:mb-8 text-xs sm:text-sm">We'll reply within 24 hours</p>

              {success ? (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="bg-green-50 border border-green-400 rounded-xl p-10 text-center">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-xl sm:text-2xl font-serif text-green-800 mb-2">Message Sent!</h3>
                  <p className="text-sm sm:text-base text-green-700">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                </motion.div>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">

                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-50 border border-red-300 rounded-lg text-red-600 text-sm">
                      {error}
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-2">Full Name *</label>
                      <input type="text" name="from_name" value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required placeholder="John Doe"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#e8d5b7] transition-colors text-sm sm:text-base" />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-2">Email Address *</label>
                      <input type="email" name="from_email" value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required placeholder="john@example.com"
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#e8d5b7] transition-colors" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-2">Phone Number</label>
                      <input type="tel" name="phone" value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#e8d5b7] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-2">Subject *</label>
                      <input type="text" name="subject" value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required placeholder="How can we help?"
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#e8d5b7] transition-colors" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-2">Message *</label>
                    <textarea name="message" value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required rows={6} placeholder="Tell us more about your inquiry..."
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#e8d5b7] transition-colors resize-none text-sm sm:text-base" />
                  </div>

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="submit" disabled={loading}
                    className="w-full bg-[#e8d5b7] hover:bg-[#d4c1a3] text-black py-3 sm:py-4 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 text-sm sm:text-base">
                    {loading
                      ? <><div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /><span>Sending...</span></>
                      : <><span>Send Message</span><Send className="w-5 h-5" /></>
                    }
                  </motion.button>

                  <p className="text-xs text-gray-400 text-center">
                    By submitting, you agree to our Privacy Policy.
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
