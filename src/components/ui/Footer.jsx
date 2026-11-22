import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import logo from '../../assets/images/logo.png';

// TikTok SVG icon (not in lucide-react)
function TikTokIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
    </svg>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Our Story', path: '/story' },
      { name: 'Careers', path: '/careers' },
      { name: 'Press', path: '/press' },
      { name: 'Blog', path: '/blog' },
    ],
    shop: [
      { name: 'All Collection', path: '/collection' },
      { name: 'New Arrivals', path: '/new-arrivals' },
      { name: 'Best Sellers', path: '/best-sellers' },
      { name: 'Gift Cards', path: '/gift-cards' },
      { name: 'Sale', path: '/sale' },
    ],
    support: [
      { name: 'Contact Us', path: '/contact' },
      { name: 'FAQs', path: '/faq' },
      { name: 'Shipping Info', path: '/shipping' },
      { name: 'Returns', path: '/returns' },
      { name: 'Track Order', path: '/track-order' },
    ],
    legal: [
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Cookie Policy', path: '/cookies' },
      { name: 'Accessibility', path: '/accessibility' },
    ],
  };

  const socialLinks = [
    {
      icon: Instagram,
      url: 'https://www.instagram.com/dmillion2026?fqnt=MWxqa2NlNDcyeHcybQ%3D%3D&utm_source=qr',
      label: 'Instagram',
    },
    {
      icon: TikTokIcon,
      url: 'https://tiktok.com/@dmillion2027',
      label: 'TikTok',
    },
    {
      icon: Facebook,
      url: 'https://www.facebook.com/share/1E1P7ftxtA/?mibextid=wwXIfr',
      label: 'Facebook',
    },
  ];

  const contactInfo = [
    { icon: Mail,  text: 'dmillion2027@gmail.com',        href: 'mailto:dmillion2027@gmail.com' },
    { icon: Phone, text: '+1 289 200 3045',               href: 'tel:+12892003045' },
    { icon: MapPin, text: '1580 Kingston Rd, Pickering, Ontario, L1V6M6, Canada' },
  ];

  return (
    <footer className="bg-gradient-to-b from-stone-900 to-black text-white">
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8 sm:gap-12 mb-8 sm:mb-12">

          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6 group">
              <img src={logo} alt="DMILLION Logo" className="h-16 sm:h-20 w-auto object-contain" />
              <div>
                <h3 className="text-lg sm:text-xl font-serif tracking-wider">DMILLION</h3>
                <p className="text-[11px] sm:text-[12px] tracking-widest text-gray-400 font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>Luxury Fashion</p>
              </div>
            </Link>

            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
              Luxury. Class. DMILLION.
              <br /><br />
              Crafting timeless elegance since 2010. Each piece tells a story of
              exceptional quality and sophisticated design.
            </p>

            {/* Social Links */}
            <div className="flex space-x-2 sm:space-x-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-white/10 hover:bg-[#e8d5b7] hover:text-black rounded-full flex items-center justify-center transition-colors duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-gray-400 hover:text-[#e8d5b7] text-xs sm:text-sm transition-colors duration-200">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Shop</h4>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-gray-400 hover:text-[#e8d5b7] text-xs sm:text-sm transition-colors duration-200">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-gray-400 hover:text-[#e8d5b7] text-xs sm:text-sm transition-colors duration-200">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Contact</h4>
            <ul className="space-y-3 sm:space-y-4">
              {contactInfo.map((info, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <info.icon className="w-3 h-3 sm:w-4 sm:h-4 text-[#e8d5b7] mt-0.5 flex-shrink-0" />
                  {info.href ? (
                    <a href={info.href} className="text-gray-400 hover:text-[#e8d5b7] text-xs sm:text-sm transition-colors duration-200">
                      {info.text}
                    </a>
                  ) : (
                    <span className="text-gray-400 text-xs sm:text-sm leading-relaxed">{info.text}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-6 sm:my-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-3 sm:space-y-4 md:space-y-0">
          <div className="text-xs sm:text-sm text-gray-400">
            © {currentYear} DMILLION. All rights reserved.
          </div>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {footerLinks.legal.map((link) => (
              <Link key={link.name} to={link.path} className="text-xs sm:text-sm text-gray-400 hover:text-[#e8d5b7] transition-colors duration-200">
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Accent */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#e8d5b7] to-transparent" />
    </footer>
  );
}
