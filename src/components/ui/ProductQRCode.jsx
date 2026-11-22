import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Shield, X, BarChart3 } from 'lucide-react';
import { QRScanAnalytics } from '../../admin/components/QRScanAnalytics';

export function ProductQRCode({ product, baseUrl = 'https://dmillionluxury.vercel.app', showAnalytics = false, compact = false }) {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('qr');
  
  // Generate unique product URL with QR tracking parameter
  const productUrl = `${baseUrl}/product/${product.id}?qr=true`;
  
  // Use QR Server API to generate QR code (smaller size for compact mode)
  const qrSize = compact ? '200x200' : '300x300';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}&data=${encodeURIComponent(productUrl)}`;
  
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

      {/* QR Code Modal - Compact */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl relative"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Compact Header */}
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-black">QR Code</h3>
              <p className="text-xs text-gray-500 mt-1">{product.name}</p>
            </div>

            {/* Tabs - Only if analytics available */}
            {showAnalytics && (
              <div className="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('qr')}
                  className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors ${
                    activeTab === 'qr' 
                      ? 'bg-white shadow-sm text-black' 
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  QR
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors ${
                    activeTab === 'analytics' 
                      ? 'bg-white shadow-sm text-black' 
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Stats
                </button>
              </div>
            )}

            {/* QR Code Content */}
            {activeTab === 'qr' && (
              <>
                {/* QR Code - Centered */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4 flex justify-center">
                  <img 
                    src={qrCodeUrl} 
                    alt={`QR Code`}
                    className="w-40 h-40 sm:w-48 sm:h-48"
                  />
                </div>

                {/* Product ID */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-500 uppercase mb-1">ID</p>
                  <p className="font-mono text-sm text-gray-800">{product.id}</p>
                </div>

                {/* Quick Info */}
                {product.scan_count !== undefined && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-blue-50 rounded-lg p-2">
                      <p className="text-xs text-gray-500">Scans</p>
                      <p className="font-bold text-blue-600">{product.scan_count || 0}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2">
                      <p className="text-xs text-gray-500">Stock</p>
                      <p className="font-bold text-green-600">{product.stock_quantity}</p>
                    </div>
                  </div>
                )}

                {/* Download Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </motion.button>
              </>
            )}

            {/* Analytics Content */}
            {activeTab === 'analytics' && showAnalytics && (
              <QRScanAnalytics productId={product.id} />
            )}
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
