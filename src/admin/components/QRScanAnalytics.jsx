import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, MapPin, Smartphone, Eye, TrendingUp, Clock } from 'lucide-react';
import { adminSupabase } from '../lib/adminSupabase';

export function QRScanAnalytics({ productId }) {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalScans, setTotalScans] = useState(0);

  useEffect(() => {
    fetchScans();

    // Real-time subscription for new scans
    const subscription = adminSupabase
      .channel(`qr-scans-${productId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'qr_scans', filter: `product_id=eq.${productId}` },
        (payload) => {
          console.log('New QR scan detected:', payload);
          setScans(prev => [payload.new, ...prev]);
          setTotalScans(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      adminSupabase.removeChannel(subscription);
    };
  }, [productId]);

  const fetchScans = async () => {
    try {
      setLoading(true);
      const { data, error, count } = await adminSupabase
        .from('qr_scans')
        .select('*', { count: 'exact' })
        .eq('product_id', productId)
        .order('scanned_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setScans(data || []);
      setTotalScans(count || 0);
    } catch (err) {
      console.error('Error fetching scans:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {/* Stats Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-[#e8d5b7]/20 rounded-full flex items-center justify-center">
            <QrCode className="w-6 h-6 text-[#e8d5b7]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">QR Code Analytics</h3>
            <p className="text-sm text-gray-400">Real-time scan tracking</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-[#e8d5b7]">{totalScans}</div>
          <div className="text-xs text-gray-400">Total Scans</div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Eye className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">Today</span>
          </div>
          <div className="text-xl font-bold text-white">
            {scans.filter(s => new Date(s.scanned_at).toDateString() === new Date().toDateString()).length}
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">This Week</span>
          </div>
          <div className="text-xl font-bold text-white">
            {scans.filter(s => {
              const scanDate = new Date(s.scanned_at);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return scanDate >= weekAgo;
            }).length}
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Smartphone className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400">Mobile</span>
          </div>
          <div className="text-xl font-bold text-white">
            {scans.filter(s => s.device_type === 'Mobile').length}
          </div>
        </div>
      </div>

      {/* Recent Scans */}
      <div>
        <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          Recent Scans
          <span className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        </h4>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-[#e8d5b7] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : scans.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <QrCode className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No scans yet</p>
            <p className="text-xs mt-1">Scans will appear here in real-time</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {scans.map((scan, index) => (
              <motion.div
                key={scan.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <MapPin className="w-3 h-3 text-red-400" />
                      <span className="text-sm font-medium text-white">
                        {scan.city || 'Unknown'}, {scan.country || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-gray-400">
                      <span className="flex items-center">
                        <Smartphone className="w-3 h-3 mr-1" />
                        {scan.device_type}
                      </span>
                      <span>{scan.browser}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{formatDate(scan.scanned_at)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Live Indicator */}
      <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Live tracking active</span>
      </div>
    </div>
  );
}
