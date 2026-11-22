import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const toast = useToast();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  // Get the redirect path from location state or default to dashboard
  const from = location.state?.from || '/dashboard';

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    const { error } = await signInWithGoogle();
    
    if (error) {
      setError('Failed to sign in with Google. Please try again.');
      setLoading(false);
    }
    // Google will redirect, so no need to setLoading(false) here
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Sign in
        const { data, error } = await signIn(formData.email, formData.password);
        
        if (error) {
          setError(error.message || 'Failed to sign in. Please check your credentials.');
        } else {
          // Redirect to dashboard after successful login
          navigate('/dashboard', { replace: true });
        }
      } else {
        // Sign up
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }

        const { data, error } = await signUp(formData.email, formData.password, formData.fullName);
        
        if (error) {
          setError(error.message || 'Failed to create account. Please try again.');
        } else {
          setError('');
          toast.success('Account created! Please check your email to verify.');
          setIsLogin(true);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden pt-16 sm:pt-10">
      <div className="max-w-full mx-auto h-full">
        <div className="grid lg:grid-cols-2 h-full gap-0">
            
            {/* Video Section - Left Side */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="hidden lg:flex flex-col items-center justify-center px-16 py-12 bg-gradient-to-b from-stone-900 to-black h-full"
            >
              <div className="relative rounded-lg overflow-hidden shadow-2xl w-full max-w-xl mt-12">
                <div className="relative aspect-square">
                  <iframe
                    src="https://player.cloudinary.com/embed/?cloud_name=dhoqtwst9&public_id=7375e147-4d57-4ded-b786-a94aec7e21ce_mvlmyc&player[muted]=true&player[autoplay]=true&player[loop]=true&player[controls]=false"
                    className="absolute inset-0 w-full h-full"
                    style={{ border: 'none' }}
                    allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                    allowFullScreen
                    title="DMILLION Luxury Bag"
                  ></iframe>
                </div>
              </div>
              <div className="mt-8 text-center">
                <h2 className="text-2xl font-serif text-white mb-2">
                  Experience Luxury
                </h2>
                <p className="text-gray-300">
                  One in a Million - Premium Craftsmanship
                </p>
              </div>
            </motion.div>

            {/* Login Form Section - Right Side */}
            <div className="flex items-center justify-center px-4 sm:px-8 lg:px-16 py-6 sm:py-12 h-full">
              <div className="w-full max-w-md">
          
          {/* Login/Signup Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 sm:p-6 w-full"
          >
            {/* Toggle Tabs */}
            <div className="flex mb-6 sm:mb-8 bg-stone-100 rounded-lg p-1">
              <button
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                }}
                className={`flex-1 py-1.5 sm:py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-all duration-300 ${
                  isLogin
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                }}
                className={`flex-1 py-1.5 sm:py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-all duration-300 ${
                  !isLogin
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form Title */}
            <h2 className="text-lg sm:text-xl font-serif mb-1 text-center">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-600 text-center mb-3 sm:mb-4 text-xs sm:text-sm">
              {isLogin
                ? 'Sign in to access your account'
                : 'Join us for an exclusive shopping experience'}
            </p>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-2 sm:mb-3 p-2 bg-red-50 border border-red-200 rounded-md text-red-600 text-xs sm:text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
              
              {/* Full Name - Only for Sign Up */}
              {!isLogin && (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required={!isLogin}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-1.5 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:border-[#e8d5b7] transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-1.5 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:border-[#e8d5b7] transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-1.5 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:border-[#e8d5b7] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
                {!isLogin && (
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    Must be at least 6 characters
                  </p>
                )}
              </div>

              {/* Forgot Password - Only for Login */}
              {isLogin && (
                <div className="text-right pt-1">
                  <Link
                    to="/forgot-password"
                    className="text-xs sm:text-sm text-[#3d2415] hover:text-[#e8d5b7] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-[#e8d5b7] hover:bg-[#d4c1a3] text-black py-2 sm:py-2.5 rounded-md font-medium text-xs sm:text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="my-3 sm:my-4 flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-2 sm:px-4 text-xs sm:text-sm text-gray-500">or continue with</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Social Login Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2 sm:py-2.5 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Terms */}
            {!isLogin && (
              <p className="text-[10px] sm:text-xs text-gray-500 text-center mt-3 sm:mt-4">
                By signing up, you agree to our{' '}
                <Link to="/terms" className="text-[#3d2415] hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-[#3d2415] hover:underline">
                  Privacy Policy
                </Link>
              </p>
            )}
          </motion.div>

          {/* Guest Shopping Option */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-2 sm:mt-4"
          >
            <p className="text-xs sm:text-sm text-gray-600">
              Want to browse first?{' '}
              <Link
                to="/collection"
                className="text-[#3d2415] hover:text-[#e8d5b7] font-medium transition-colors"
              >
                Continue as Guest
              </Link>
            </p>
          </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
