import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { 
  User, Package, Heart, MapPin, CreditCard, 
  Settings, LogOut, ShoppingBag, Clock, Plus,
  Trash2, CheckCircle, Truck, Box, Home, Edit2, X, Check
} from 'lucide-react';
export function DashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const { wishlistItems, loading: wishlistLoading, removeFromWishlist } = useWishlist();
  const [activeTab, setActiveTab] = useState('overview');

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [statusChanged, setStatusChanged] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [cancelConfirm, setCancelConfirm] = useState(null);

  // Addresses state
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    full_name: '', phone: '', address_line1: '', address_line2: '',
    city: '', state: '', country: '', postal_code: '', is_default: false
  });
  const [addressSaving, setAddressSaving] = useState(false);

  // Settings state
  const [settingsForm, setSettingsForm] = useState({
    full_name: user?.user_metadata?.full_name || '',
    phone: user?.user_metadata?.phone || '',
  });
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  // Delete account state
  const [deleteAccountConfirm, setDeleteAccountConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchOrders();
    fetchAddresses();

    // Real-time orders - detect status changes
    const ordersSub = supabase
      .channel(`orders-${user.id}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` },
        (payload) => {
          console.log('Order UPDATE detected:', payload);
          setStatusChanged(payload.new.id);
          setTimeout(() => setStatusChanged(null), 4000);
          // Force immediate refresh
          setOrders(prev => prev.map(o => o.id === payload.new.id ? payload.new : o));
          // Also fetch fresh data to ensure consistency
          setTimeout(() => fetchOrders(), 500);
        }
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` },
        () => {
          console.log('New order INSERT detected');
          fetchOrders();
        }
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` },
        () => {
          console.log('Order DELETE detected');
          fetchOrders();
        }
      )
      .subscribe((status) => {
        console.log('Order subscription status:', status);
      });

    // Real-time addresses
    const addressesSub = supabase
      .channel(`addresses-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'addresses', filter: `user_id=eq.${user.id}` }, fetchAddresses)
      .subscribe();

    return () => {
      supabase.removeChannel(ordersSub);
      supabase.removeChannel(addressesSub);
    };
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      setOrdersLoading(true);
      const { data, error } = await supabase
        .from('orders').select('*, order_items(*)')
        .eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      setOrders([]);
    } finally { setOrdersLoading(false); }
  };

  const fetchAddresses = async () => {
    if (!user) return;
    try {
      setAddressesLoading(true);
      const { data, error } = await supabase
        .from('addresses').select('*')
        .eq('user_id', user.id).order('is_default', { ascending: false });
      if (error) throw error;
      setAddresses(data || []);
    } catch (err) {
      setAddresses([]);
    } finally { setAddressesLoading(false); }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setAddressSaving(true);
    try {
      if (addressForm.is_default) {
        // Remove default from others first
        await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
      }
      if (editingAddress) {
        const { error } = await supabase.from('addresses').update(addressForm).eq('id', editingAddress.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('addresses').insert([{ ...addressForm, user_id: user.id }]);
        if (error) throw error;
      }
      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressForm({ full_name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', country: '', postal_code: '', is_default: false });
      // Real-time subscription will update the addresses list
    } catch (err) {
      console.error('Save address error:', err);
    } finally { setAddressSaving(false); }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm({ ...address });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (id) => {
    try {
      await supabase.from('addresses').delete().eq('id', id);
      // Real-time will handle the update via subscription
    } catch (err) {
      console.error('Delete address error:', err);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
      await supabase.from('addresses').update({ is_default: true }).eq('id', id);
      // Real-time will handle the update via subscription
    } catch (err) {
      console.error('Set default address error:', err);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsMsg('');
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: settingsForm.full_name, phone: settingsForm.phone }
      });
      if (error) throw error;
      setSettingsMsg('✓ Profile updated successfully!');
      // Update local state to reflect changes immediately
      setTimeout(() => setSettingsMsg(''), 3000);
    } catch (err) {
      console.error('Settings error:', err);
      setSettingsMsg('✗ Failed to update profile.');
    } finally { setSettingsSaving(false); }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg('✗ Passwords do not match.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordMsg('✗ Password must be at least 6 characters.');
      return;
    }
    setPasswordSaving(true);
    setPasswordMsg('');
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordForm.newPassword });
      if (error) throw error;
      setPasswordMsg('✓ Password updated successfully!');
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordMsg(''), 3000);
    } catch (err) {
      console.error('Password error:', err);
      setPasswordMsg('✗ Failed to update password.');
    } finally { setPasswordSaving(false); }
  };

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setDeleteAccountError('Please type DELETE to confirm.');
      return;
    }
    setDeletingAccount(true);
    setDeleteAccountError('');
    try {
      // Delete user data from all tables
      await supabase.from('carts').delete().eq('user_id', user.id);
      await supabase.from('wishlists').delete().eq('user_id', user.id);
      await supabase.from('addresses').delete().eq('user_id', user.id);
      await supabase.from('orders').update({ user_id: null }).eq('user_id', user.id);
      // Delete auth user
      const { error } = await supabase.auth.updateUser({ data: { deleted: true } });
      if (error) throw error;
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Delete account error:', err);
      setDeleteAccountError('Failed to delete account. Please contact support.');
      setDeletingAccount(false);
    }
  };

  const handleCancelOrder = async (orderId) => {    setCancellingOrderId(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .eq('user_id', user.id);
      if (error) throw error;
      // Optimistic update
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
      setCancelConfirm(null);
    } catch (err) {
      console.error('Cancel order error:', err);
    } finally {
      setCancellingOrderId(null);
    }
  };
  if (!user) return null;

  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing');

  const stats = [
    { label: 'Orders', value: orders.length, icon: Package, color: 'bg-blue-500' },
    { label: 'Cart', value: cartItems.reduce((t, i) => t + i.quantity, 0), icon: ShoppingBag, color: 'bg-green-500' },
    { label: 'Pending', value: pendingOrders.length, icon: Clock, color: 'bg-yellow-500' },
    { label: 'Wishlist', value: wishlistItems.length, icon: Heart, color: 'bg-red-500' },
  ];

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard },
    { id: 'settings', label: 'Account Settings', icon: Settings },
  ];

  const getOrderStatusSteps = (status) => {
    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIdx = steps.indexOf(status);
    return steps.map((s, i) => ({ label: s, completed: i <= currentIdx }));
  };

  // Remove scroll prevention - allow normal scrolling
  useEffect(() => {
    // Don't prevent scrolling on dashboard
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-stone-50 to-stone-100">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-lg sm:text-2xl md:text-3xl font-serif mb-1 sm:mb-2">Welcome back, {user.user_metadata?.full_name || user.email}!</h1>
              <p className="text-xs sm:text-sm text-gray-600">Manage your account and orders</p>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSignOut}
              className="mt-3 sm:mt-4 md:mt-0 flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 px-3 sm:px-6 py-1.5 sm:py-2 bg-red-500 text-white rounded-full text-xs sm:text-sm w-fit">
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
              whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
              className="bg-white rounded-lg shadow-md p-3 sm:p-6 cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-[10px] sm:text-sm mb-0.5 sm:mb-1">{stat.label}</p>
                  <p className="text-xl sm:text-3xl font-serif">{stat.value}</p>
                </div>
                <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}
                  className={`${stat.color} w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0`}>
                  <stat.icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-4 sm:gap-6">

          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h3 className="text-sm sm:text-lg font-serif mb-3 sm:mb-4">Dashboard Menu</h3>
              <nav className="space-y-1 sm:space-y-2">
                {menuItems.map((item) => (
                  <motion.button key={item.id} onClick={() => setActiveTab(item.id)}
                    whileHover={{ x: 4 }} whileTap={{ scale: 0.97 }}
                    className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors text-xs sm:text-sm ${activeTab === item.id ? 'bg-[#e8d5b7] text-black' : 'text-gray-700 hover:bg-stone-50'}`}>
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </motion.button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <AnimatePresence mode="wait">

                {/* OVERVIEW */}
                {activeTab === 'overview' && (
                  <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <h2 className="text-lg sm:text-2xl font-serif mb-4 sm:mb-6">Account Overview</h2>
                    <div className="grid md:grid-cols-2 gap-3 sm:gap-6">
                      <motion.div whileHover={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)', y: -2 }} className="border border-gray-200 rounded-lg p-4 sm:p-6">
                        <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#e8d5b7] rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-6 h-6 sm:w-8 sm:h-8 text-black" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-xs sm:text-base">{user.user_metadata?.full_name || 'User'}</h3>
                            <p className="text-[10px] sm:text-sm text-gray-600 break-all">{user.email}</p>
                          </div>
                        </div>
                        <button onClick={() => setActiveTab('settings')} className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-xs sm:text-sm">
                          Edit Profile
                        </button>
                      </motion.div>

                      <motion.div whileHover={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)', y: -2 }} className="border border-gray-200 rounded-lg p-4 sm:p-6">
                        <h3 className="font-semibold text-xs sm:text-base mb-3 sm:mb-4">Quick Actions</h3>
                        <div className="space-y-2 sm:space-y-3">
                          {[{ to: '/collection', label: 'Continue Shopping', primary: true }, { to: '/track-order', label: 'Track Order', primary: false }, { to: '/cart', label: 'View Cart', primary: false }].map(a => (
                            <Link key={a.label} to={a.to} className={`block w-full px-3 sm:px-4 py-2 sm:py-3 rounded-md text-center text-xs sm:text-sm font-medium ${a.primary ? 'bg-[#e8d5b7] hover:bg-[#d4c1a3] text-black' : 'border border-gray-300 hover:bg-gray-50'}`}>
                              {a.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    </div>

                    <div className="mt-6 sm:mt-8">
                      <h3 className="text-base sm:text-xl font-serif mb-3 sm:mb-4">Recent Orders</h3>
                      {ordersLoading ? (
                        <div className="flex justify-center py-6 sm:py-8"><div className="w-8 h-8 border-4 border-[#e8d5b7] border-t-transparent rounded-full animate-spin" /></div>
                      ) : orders.length === 0 ? (
                        <div className="border border-gray-200 rounded-lg p-6 sm:p-8 text-center">
                          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                            <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                          </motion.div>
                          <p className="text-xs sm:text-base text-gray-600 mb-3 sm:mb-4">No orders yet</p>
                          <Link to="/collection" className="inline-block px-4 sm:px-6 py-1.5 sm:py-2 bg-[#e8d5b7] text-black rounded-full text-xs sm:text-sm font-medium">Start Shopping</Link>
                        </div>
                      ) : (
                        <div className="space-y-2 sm:space-y-3">
                          {orders.slice(0, 3).map(order => (
                            <div key={order.id} className="flex items-center justify-between p-3 sm:p-4 border border-gray-100 rounded-lg text-xs sm:text-sm">
                              <div>
                                <p className="font-medium">#{order.tracking_number}</p>
                                <p className="text-[10px] sm:text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                              </div>
                              <div className="text-right">
                                <span className={`text-[9px] sm:text-xs px-2 py-0.5 sm:py-1 rounded-full capitalize ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : order.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span>
                                <p className="text-xs sm:text-sm font-serif mt-0.5 sm:mt-1">${parseFloat(order.total_amount).toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ORDERS */}
                {activeTab === 'orders' && (
                  <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>

                    {/* Cancel Confirm Modal */}
                    <AnimatePresence>
                      {cancelConfirm && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
                          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full">
                            <div className="text-center mb-6">
                              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <X className="w-8 h-8 text-red-500" />
                              </div>
                              <h3 className="text-xl font-semibold mb-2">Cancel Order?</h3>
                              <p className="text-gray-600 text-sm">This cannot be undone. Your order will be cancelled immediately.</p>
                            </div>
                            <div className="flex space-x-3">
                              <button onClick={() => setCancelConfirm(null)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                                Keep Order
                              </button>
                              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={() => handleCancelOrder(cancelConfirm)}
                                disabled={cancellingOrderId === cancelConfirm}
                                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center">
                                {cancellingOrderId === cancelConfirm
                                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  : 'Yes, Cancel'}
                              </motion.button>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-serif">My Orders</h2>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Live updates active</span>
                      </div>
                    </div>
                    {ordersLoading ? (
                      <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-[#e8d5b7] border-t-transparent rounded-full animate-spin" /></div>
                    ) : orders.length === 0 ? (
                      <div className="border border-gray-200 rounded-lg p-8 text-center">
                        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity }}><Package className="w-16 h-16 text-gray-300 mx-auto mb-4" /></motion.div>
                        <p className="text-gray-600 mb-4">No orders yet</p>
                        <Link to="/collection" className="inline-block px-6 py-2 bg-[#e8d5b7] text-black rounded-full text-sm font-medium">Browse Collection</Link>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {orders.map(order => (
                          <motion.div key={order.id}
                            animate={statusChanged === order.id ? { scale: [1, 1.02, 1], boxShadow: ['0 0 0 0 rgba(232,213,183,0)', '0 0 0 8px rgba(232,213,183,0.4)', '0 0 0 0 rgba(232,213,183,0)'] } : {}}
                            transition={{ duration: 0.8 }}
                            whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                            className={`border rounded-lg p-6 relative overflow-hidden ${order.status === 'cancelled' ? 'border-red-200 bg-red-50/30' : 'border-gray-200'}`}>

                            {statusChanged === order.id && (
                              <motion.div initial={{ opacity: 0.6 }} animate={{ opacity: 0 }} transition={{ duration: 1.5 }}
                                className="absolute inset-0 bg-[#e8d5b7]/20 pointer-events-none" />
                            )}

                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <p className="font-semibold">Order #{order.tracking_number}</p>
                                <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                              </div>
                              <div className="flex flex-col items-end space-y-2">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${
                                  order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                  order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                  order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                                  order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                                  'bg-gray-100 text-gray-700'}`}>
                                  {statusChanged === order.id && <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse mr-1" />}
                                  {order.status}
                                </span>
                                <p className="text-lg font-serif">${parseFloat(order.total_amount).toLocaleString()}</p>
                                {(order.status === 'pending' || order.status === 'processing') && (
                                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    onClick={() => setCancelConfirm(order.id)}
                                    className="flex items-center space-x-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg text-xs font-medium border border-red-200">
                                    <X className="w-3 h-3" /><span>Cancel Order</span>
                                  </motion.button>
                                )}
                              </div>
                            </div>

                            {order.status !== 'cancelled' ? (
                              <div className="mt-4 mb-2">
                                <div className="flex items-center justify-between relative">
                                  <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200 z-0">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${(['pending','processing','shipped','delivered'].indexOf(order.status)) / 3 * 100}%` }}
                                      transition={{ duration: 1, ease: 'easeOut' }}
                                      className="h-full bg-[#e8d5b7]" />
                                  </div>
                                  {[
                                    { label: 'Placed', icon: Box, status: 'pending' },
                                    { label: 'Processing', icon: Clock, status: 'processing' },
                                    { label: 'Shipped', icon: Truck, status: 'shipped' },
                                    { label: 'Delivered', icon: CheckCircle, status: 'delivered' },
                                  ].map((step, i) => {
                                    const steps = ['pending','processing','shipped','delivered'];
                                    const isCompleted = steps.indexOf(order.status) >= i;
                                    const isCurrent = order.status === step.status;
                                    return (
                                      <div key={step.label} className="flex flex-col items-center z-10 flex-1">
                                        <motion.div animate={isCurrent ? { scale: [1, 1.15, 1] } : {}} transition={{ duration: 1.5, repeat: isCurrent ? Infinity : 0 }}
                                          className={`w-10 h-10 rounded-full flex items-center justify-center ${isCompleted ? 'bg-[#e8d5b7] text-black' : 'bg-gray-200 text-gray-400'}`}>
                                          <step.icon className="w-4 h-4" />
                                        </motion.div>
                                        <p className={`text-xs mt-1 font-medium ${isCompleted ? 'text-black' : 'text-gray-400'}`}>{step.label}</p>
                                        {isCurrent && (
                                          <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                                            className="text-[9px] bg-[#e8d5b7] text-black px-1.5 py-0.5 rounded-full mt-0.5 font-semibold">Now</motion.span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                                <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                                <p className="text-sm text-red-600">This order has been cancelled.</p>
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                              <p className="text-xs text-gray-400">{order.shipping_address}</p>
                              {order.status !== 'cancelled' && (
                                <Link to="/track-order" className="text-sm text-[#3d2415] hover:underline font-medium">Full Tracking →</Link>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* WISHLIST */}
                {activeTab === 'wishlist' && (
                  <motion.div key="wishlist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <h2 className="text-base sm:text-2xl font-serif mb-2 sm:mb-6">Wishlist ({wishlistItems.length})</h2>
                    {wishlistLoading ? (
                      <div className="flex justify-center py-4 sm:py-12"><div className="w-8 h-8 border-4 border-[#e8d5b7] border-t-transparent rounded-full animate-spin" /></div>
                    ) : wishlistItems.length === 0 ? (
                      <div className="border border-gray-200 rounded-lg p-3 sm:p-8 text-center">
                        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}><Heart className="w-8 h-8 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-2 sm:mb-4" /></motion.div>
                        <p className="text-xs sm:text-base text-gray-600 mb-2 sm:mb-4">Your wishlist is empty</p>
                        <Link to="/collection" className="inline-block px-3 sm:px-6 py-1 sm:py-2 bg-[#e8d5b7] text-black rounded-full text-xs sm:text-sm font-medium">Browse Collection</Link>
                      </div>
                    ) : (
                      <div className="space-y-2 sm:space-y-3 max-h-[50vh] sm:max-h-none overflow-y-auto">
                        {wishlistItems.map(item => (
                          <motion.div key={item.id} whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                            className="border border-gray-200 rounded-lg p-2 sm:p-4 flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm">
                            <div className="w-12 h-12 sm:w-20 sm:h-20 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                              {item.products?.image_url ? <img src={item.products.image_url} alt={item.products.name} className="w-full h-full object-contain p-1 sm:p-2" /> : <ShoppingBag className="w-4 h-4 sm:w-6 sm:h-6 text-gray-300 m-auto" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate text-xs sm:text-base">{item.products?.name}</p>
                              <p className="text-[9px] sm:text-xs text-gray-500 capitalize truncate">{item.products?.category}</p>
                              <p className="text-xs sm:text-sm font-serif text-[#3d2415]">${parseFloat(item.products?.price || 0).toLocaleString()}</p>
                            </div>
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              onClick={() => removeFromWishlist(item.product_id)}
                              className="p-1 sm:p-2 text-red-400 hover:bg-red-50 rounded-lg flex-shrink-0">
                              <Heart className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-red-400" />
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ADDRESSES */}
                {activeTab === 'addresses' && (
                  <motion.div key="addresses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h2 className="text-base sm:text-2xl font-serif">Saved Addresses</h2>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => { setShowAddressForm(!showAddressForm); setEditingAddress(null); setAddressForm({ full_name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', country: '', postal_code: '', is_default: false }); }}
                        className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#e8d5b7] hover:bg-[#d4c1a3] text-black rounded-lg text-xs sm:text-sm font-medium">
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" /><span className="hidden sm:inline">Add Address</span><span className="sm:hidden">Add</span>
                      </motion.button>
                    </div>

                    {/* Address Form */}
                    <AnimatePresence>
                      {showAddressForm && (
                        <motion.form onSubmit={handleSaveAddress}
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="border border-[#e8d5b7] rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 space-y-3 sm:space-y-4">
                          <h3 className="font-semibold text-sm sm:text-base">{editingAddress ? 'Edit Address' : 'New Address'}</h3>
                          <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                            {[
                              { name: 'full_name', label: 'Full Name', required: true },
                              { name: 'phone', label: 'Phone Number' },
                              { name: 'address_line1', label: 'Address Line 1', required: true },
                              { name: 'address_line2', label: 'Address Line 2 (Optional)' },
                              { name: 'city', label: 'City', required: true },
                              { name: 'state', label: 'State / Province' },
                              { name: 'country', label: 'Country', required: true },
                              { name: 'postal_code', label: 'Postal Code' },
                            ].map(field => (
                              <div key={field.name}>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                                <input
                                  type="text"
                                  required={field.required}
                                  value={addressForm[field.name]}
                                  onChange={e => setAddressForm({ ...addressForm, [field.name]: e.target.value })}
                                  className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-[#e8d5b7]"
                                />
                              </div>
                            ))}
                          </div>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" checked={addressForm.is_default} onChange={e => setAddressForm({ ...addressForm, is_default: e.target.checked })} className="w-3 h-3 sm:w-4 sm:h-4 accent-[#e8d5b7]" />
                            <span className="text-xs sm:text-sm font-medium">Set as default address</span>
                          </label>
                          <div className="flex space-x-2 sm:space-x-3">
                            <motion.button type="submit" disabled={addressSaving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                              className="flex items-center space-x-1 sm:space-x-2 px-4 sm:px-6 py-1.5 sm:py-2 bg-black text-white rounded-lg text-xs sm:text-sm disabled:opacity-50">
                              {addressSaving ? <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-3 h-3 sm:w-4 sm:h-4" />}
                              <span>{editingAddress ? 'Update' : 'Save'} Address</span>
                            </motion.button>
                            <button type="button" onClick={() => setShowAddressForm(false)} className="px-4 sm:px-6 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm hover:bg-gray-50">
                              Cancel
                            </button>
                          </div>
                        </motion.form>
                      )}
                    </AnimatePresence>

                    {/* Address List */}
                    {addressesLoading ? (
                      <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-[#e8d5b7] border-t-transparent rounded-full animate-spin" /></div>
                    ) : addresses.length === 0 ? (
                      <div className="border border-gray-200 rounded-lg p-6 sm:p-8 text-center">
                        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity }}><MapPin className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" /></motion.div>
                        <p className="text-xs sm:text-base text-gray-600">No saved addresses yet. Add one above!</p>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                        {addresses.map(address => (
                          <motion.div key={address.id} whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                            className={`border rounded-lg p-3 sm:p-5 relative text-xs sm:text-sm ${address.is_default ? 'border-[#e8d5b7] bg-[#e8d5b7]/5' : 'border-gray-200'}`}>
                            {address.is_default && (
                              <span className="absolute top-2 sm:top-3 right-2 sm:right-3 text-[9px] sm:text-xs bg-[#e8d5b7] text-black px-1.5 sm:px-2 py-0.5 rounded-full font-medium">Default</span>
                            )}
                            <div className="flex items-start space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                              <Home className="w-4 h-4 sm:w-5 sm:h-5 text-[#3d2415] mt-0.5 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="font-semibold text-xs sm:text-base">{address.full_name}</p>
                                {address.phone && <p className="text-[10px] sm:text-xs text-gray-500">{address.phone}</p>}
                                <p className="text-[10px] sm:text-xs text-gray-600 mt-1">{address.address_line1}</p>
                                {address.address_line2 && <p className="text-[10px] sm:text-xs text-gray-600">{address.address_line2}</p>}
                                <p className="text-[10px] sm:text-xs text-gray-600">{address.city}{address.state ? `, ${address.state}` : ''} {address.postal_code}</p>
                                <p className="text-[10px] sm:text-xs text-gray-600">{address.country}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 sm:space-x-2 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100 text-[10px] sm:text-xs">
                              <button onClick={() => handleEditAddress(address)} className="flex items-center space-x-0.5 text-blue-600 hover:underline">
                                <Edit2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" /><span>Edit</span>
                              </button>
                              <button onClick={() => handleDeleteAddress(address.id)} className="flex items-center space-x-0.5 text-red-500 hover:underline">
                                <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" /><span>Delete</span>
                              </button>
                              {!address.is_default && (
                                <button onClick={() => handleSetDefault(address.id)} className="flex items-center space-x-0.5 text-green-600 hover:underline ml-auto">
                                  <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" /><span>Set Default</span>
                                </button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* PAYMENT */}
                {activeTab === 'payment' && (
                  <motion.div key="payment" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <h2 className="text-base sm:text-2xl font-serif mb-4 sm:mb-6">Payment Methods</h2>
                    <div className="border border-gray-200 rounded-lg p-6 sm:p-8 text-center">
                      <motion.div animate={{ rotateY: [0, 180, 360] }} transition={{ duration: 3, repeat: Infinity }}>
                        <CreditCard className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                      </motion.div>
                      <p className="text-xs sm:text-base text-gray-600 mb-1 sm:mb-2">Payment methods coming soon</p>
                      <p className="text-[10px] sm:text-sm text-gray-400">We're working on integrating secure payment options.</p>
                    </div>
                  </motion.div>
                )}

                {/* SETTINGS */}
                {activeTab === 'settings' && (
                  <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <h2 className="text-2xl font-serif mb-6">Account Settings</h2>
                    <div className="space-y-6">

                      {/* Personal Info */}
                      <motion.form onSubmit={handleSaveSettings} whileHover={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)', y: -2 }} className="border border-gray-200 rounded-lg p-6">
                        <h3 className="font-semibold mb-4">Personal Information</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <input type="text" value={settingsForm.full_name}
                              onChange={e => setSettingsForm({ ...settingsForm, full_name: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#e8d5b7]" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                            <input type="tel" value={settingsForm.phone}
                              onChange={e => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                              placeholder="+1 (555) 000-0000"
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#e8d5b7]" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input type="email" value={user.email} disabled className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed" />
                            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                          </div>
                          {settingsMsg && (
                            <p className={`text-sm ${settingsMsg.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{settingsMsg}</p>
                          )}
                          <motion.button type="submit" disabled={settingsSaving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            className="flex items-center space-x-2 px-6 py-2 bg-[#e8d5b7] hover:bg-[#d4c1a3] text-black rounded-md text-sm font-medium disabled:opacity-50">
                            {settingsSaving ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                            <span>Save Changes</span>
                          </motion.button>
                        </div>
                      </motion.form>

                      {/* Change Password */}
                      <motion.form onSubmit={handleSavePassword} whileHover={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)', y: -2 }} className="border border-gray-200 rounded-lg p-6">
                        <h3 className="font-semibold mb-4">Change Password</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                            <input type="password" value={passwordForm.newPassword}
                              onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                              placeholder="••••••••"
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#e8d5b7]" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                            <input type="password" value={passwordForm.confirmPassword}
                              onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                              placeholder="••••••••"
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#e8d5b7]" />
                          </div>
                          {passwordMsg && (
                            <p className={`text-sm ${passwordMsg.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{passwordMsg}</p>
                          )}
                          <motion.button type="submit" disabled={passwordSaving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            className="flex items-center space-x-2 px-6 py-2 bg-[#e8d5b7] hover:bg-[#d4c1a3] text-black rounded-md text-sm font-medium disabled:opacity-50">
                            {passwordSaving ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                            <span>Update Password</span>
                          </motion.button>
                        </div>
                      </motion.form>

                      {/* Danger Zone */}
                      <div className="border border-red-200 rounded-lg p-6">
                        <h3 className="font-semibold text-red-600 mb-2">Danger Zone</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Once you delete your account, all your data including orders, wishlist and addresses will be permanently removed. This action cannot be undone.
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setDeleteAccountConfirm(true)}
                          className="flex items-center space-x-2 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete Account</span>
                        </motion.button>
                      </div>

                      {/* Delete Account Confirm Modal */}
                      <AnimatePresence>
                        {deleteAccountConfirm && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                              className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full">
                              <div className="text-center mb-6">
                                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <Trash2 className="w-10 h-10 text-red-500" />
                                </div>
                                <h3 className="text-2xl font-serif font-bold mb-2">Delete Account?</h3>
                                <p className="text-gray-600 text-sm">
                                  This will permanently delete your account and all associated data including orders, wishlist, addresses and cart items. <strong>This cannot be undone.</strong>
                                </p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Type <span className="font-mono font-bold text-red-500">DELETE</span> to confirm
                                </label>
                                <input
                                  type="text"
                                  value={deleteConfirmText}
                                  onChange={e => setDeleteConfirmText(e.target.value)}
                                  placeholder="Type DELETE"
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-400 mb-4 font-mono"
                                />
                                {deleteAccountError && (
                                  <p className="text-red-500 text-sm mb-3">{deleteAccountError}</p>
                                )}
                              </div>
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => { setDeleteAccountConfirm(false); setDeleteConfirmText(''); setDeleteAccountError(''); }}
                                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                                >
                                  Cancel
                                </button>
                                <motion.button
                                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                  onClick={handleDeleteAccount}
                                  disabled={deletingAccount}
                                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center transition-colors"
                                >
                                  {deletingAccount
                                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    : 'Delete My Account'
                                  }
                                </motion.button>
                              </div>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
