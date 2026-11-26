import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from './ui/Toast';

export function SessionManager() {
  const { user, sessionExpiry } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [warningShown, setWarningShown] = useState(false);

  useEffect(() => {
    // Listen for session expired event
    const handleSessionExpired = () => {
      setWarningShown(false);
      toast.error('Your session has expired. Please sign in again.');
      navigate('/login', { replace: true });
    };

    window.addEventListener('session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, [navigate, toast]);

  useEffect(() => {
    if (!user || !sessionExpiry) return;

    // Show warning 5 minutes before expiry
    const warningTime = sessionExpiry - 5 * 60 * 1000;
    const now = new Date().getTime();

    if (now >= warningTime && !warningShown) {
      setWarningShown(true);
      toast.warning('Your session will expire in 5 minutes. Please refresh or sign in again.');
    }

    // Check expiry status periodically
    const interval = setInterval(() => {
      const currentTime = new Date().getTime();
      
      // Show warning if approaching expiry
      if (currentTime >= warningTime && !warningShown) {
        setWarningShown(true);
        toast.warning('Your session will expire in 5 minutes. Please refresh or sign in again.');
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user, sessionExpiry, warningShown, toast]);

  return null;
}
