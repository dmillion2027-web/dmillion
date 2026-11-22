import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Shield, X, BarChart3 } from 'lucide-react';
import { QRScanAnalytics } from '../../admin/components/QRScanAnalytics';

export function ProductQRCode({ product, baseUrl = 'https://dmillionluxury.vercel.app', showAnalytics = false }) {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('qr'); // 'qr' or 'analytics'
  
  // Generate unique product URL with QR tracking parameter
  const productUrl = `${baseUrl}/product/${product.id}?qr=true`;
  
  // Use QR Server API to generate QR code
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(productUrl)}`;
  
  const handleDownload = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `DMILLION-QR-${product.name.replace(/\s+/g, '-')}-${product.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <>
      {/* QR Code Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowModal(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-[#e8d5b7] hover:bg-[#d4c1a3] text-black rounded-lg transition-colors text-sm font-medium"
      >
        <Shield className="w-4 h-4" />
        <span>Authenticity QR</span>
      </motion.button>

      {/* QR Code Modal */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header with Tabs */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#e8d5b7] rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-serif font-bold mb-2">Product Authentication</h3>
              
              {/* Tabs */}
              {showAnalytics && (
                <div className="flex space-x-2 mt-4 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('qr')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'qr' 
                        ? 'bg-white shadow-sm text-black' 
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    <Shield className="w-4 h-4 inline mr-2" />
                    QR Code
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'analytics' 
                        ? 'bg-white shadow-sm text-black' 
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 inline mr-2" />
                    Analytics
                  </button>
                </div>
              )}
            </div>

            {/* QR Code Tab */}
            {activeTab === 'qr' && (
              <>
                {/* QR Code */}
                <div className="bg-white border-4 border-[#e8d5b7] rounded-xl p-4 mb-6">
                  <img 
                    src={qrCodeUrl} 
                    alt={`QR Code for ${product.name}`}
                    className="w-full h-auto"
                  />
                </div>

                {/* Product Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Product</p>
                  <p className="font-semibold text-lg mb-2">{product.name}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Unique ID</p>
                  <p className="font-mono text-sm text-gray-700">{product.id}</p>
                  {product.scan_count !== undefined && (
                    <>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 mt-3">Total Scans</p>
                      <p className="font-bold text-lg text-[#e8d5b7]">{product.scan_count || 0}</p>
                    </>
                  )}
                </div>

                {/* Instructions */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <p className="text-xs font-semibold text-amber-800 mb-2">🔒 Anti-Counterfeit Feature</p>
                  <ul className="text-xs text-amber-700 space-y-1">
                    <li>• Each DMILLION product has a unique QR code</li>
                    <li>• Scan to verify authenticity on our official website</li>
                    <li>• Fake products will not have valid QR codes</li>
                  </ul>
                </div>

                {/* Download Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  <Download className="w-5 h-5" />
                  <span>Download QR Code</span>
                </motion.button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Product URL: <span className="font-mono">{productUrl}</span>
                </p>
              </>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && showAnalytics && (
              <QRScanAnalytics productId={product.id} />
            )}
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
