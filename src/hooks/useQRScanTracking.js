import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook to track QR code scans in real-time
 * Logs scan data when product page is accessed via QR code
 */
export function useQRScanTracking(productId, isFromQR = false) {
  useEffect(() => {
    // Only track if accessed via QR code (check URL parameter)
    const urlParams = new URLSearchParams(window.location.search);
    const fromQR = urlParams.get('qr') === 'true' || isFromQR;
    
    if (!productId || !fromQR) return;

    const logScan = async () => {
      try {
        // Get user's approximate location and device info
        const userAgent = navigator.userAgent;
        const deviceType = /Mobile|Android|iPhone/i.test(userAgent) ? 'Mobile' : 'Desktop';
        const browser = getBrowser(userAgent);

        // Get IP and location from ipapi.co (free tier)
        let locationData = {};
        try {
          const response = await fetch('https://ipapi.co/json/');
          if (response.ok) {
            locationData = await response.json();
          }
        } catch (err) {
          console.log('Could not fetch location:', err);
        }

        // Log scan to database
        const { error } = await supabase
          .from('qr_scans')
          .insert([{
            product_id: productId,
            ip_address: locationData.ip || null,
            user_agent: userAgent,
            country: locationData.country_name || null,
            city: locationData.city || null,
            device_type: deviceType,
            browser: browser,
          }]);

        if (error) {
          console.error('Error logging QR scan:', error);
        } else {
          console.log('✅ QR scan logged successfully');
        }
      } catch (err) {
        console.error('Error tracking QR scan:', err);
      }
    };

    logScan();
  }, [productId, isFromQR]);
}

// Helper function to detect browser
function getBrowser(userAgent) {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'Unknown';
}
