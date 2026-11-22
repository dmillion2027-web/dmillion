import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, PlusCircle, LogOut, ShoppingBag,
  Trash2, Edit, Image, X, Check, AlertCircle, Upload,
  Truck, Clock, CheckCircle, Box, Users, RefreshCw,
  BarChart2, TrendingUp, DollarSign, ShoppingCart, ArrowUp, ArrowDown, Menu
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { adminSupabase } from '../lib/adminSupabase';
import { AdminAnalytics } from './AdminAnalytics';
import { ProductQRCode } from '../../components/ui/ProductQRCode';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'orders', label: 'Orders', icon: Truck },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'subscribers', label: 'Subscribers', icon: Users },
  { id: 'add', label: 'Add Product', icon: PlusCircle },
];

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered'];

const STATUS_COLORS = {
  pending: 'bg-gray-100 text-gray-700',
  processing: 'bg-yellow-100 text-yellow-700',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
};

const CATEGORIES = ['handbag', 'tote', 'shoulder', 'clutch', 'crossbody'];

const EMPTY_FORM = {
  name: '',
  description: '',
  category: 'handbag',
  price: '',
  stock_quantity: '',
  featured: false,
  color: '#ffffff',
};

export function AdminDashboard({ user, onLogout }) {
  // State Management
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteOrderConfirm, setDeleteOrderConfirm] = useState(null);
  const [deletingOrderId, setDeletingOrderId] = useState(null);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Subscribers state
  const [subscribers, setSubscribers] = useState([]);
  const [subscribersLoading, setSubscribersLoading] = useState(true);

  // Effects
  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchSubscribers();

    // Real-time subscription for orders - with debounce to avoid rapid re-fetches
    let ordersFetchTimeout;
    const ordersSub = adminSupabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        console.log('Order change detected:', payload);
        // Debounce the fetch to avoid overwriting optimistic updates
        clearTimeout(ordersFetchTimeout);
        ordersFetchTimeout = setTimeout(() => {
          console.log('Fetching fresh orders after debounce');
          fetchOrders();
        }, 500);
      })
      .subscribe();

    // Real-time subscription for products
    let productsFetchTimeout;
    const productsSub = adminSupabase
      .channel('admin-products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        clearTimeout(productsFetchTimeout);
        productsFetchTimeout = setTimeout(() => fetchProducts(), 500);
      })
      .subscribe();

    // Real-time subscription for subscribers
    let subscribersFetchTimeout;
    const subscribersSub = adminSupabase
      .channel('admin-subscribers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'newsletter_subscribers' }, () => {
        clearTimeout(subscribersFetchTimeout);
        subscribersFetchTimeout = setTimeout(() => fetchSubscribers(), 500);
      })
      .subscribe();

    return () => {
      clearTimeout(ordersFetchTimeout);
      clearTimeout(productsFetchTimeout);
      clearTimeout(subscribersFetchTimeout);
      adminSupabase.removeChannel(ordersSub);
      adminSupabase.removeChannel(productsSub);
      adminSupabase.removeChannel(subscribersSub);
    };
  }, []);

  // Handler Functions
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const { data, error } = await adminSupabase
        .from('orders')
        .select('*, order_items(*, products(*))')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      showToast('Failed to load orders', 'error');
    } finally {
      setOrdersLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const { error } = await adminSupabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      if (error) throw error;
      showToast(`Order updated to "${newStatus}"!`);
      // Optimistic update - update the full order with new status
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, updated_at: new Date().toISOString() } : o));
    } catch (err) {
      console.error('Update error:', err);
      showToast('Failed to update order status', 'error');
      // Revert on error by fetching fresh data
      fetchOrders();
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    setDeletingOrderId(orderId);
    try {
      const { error: itemsError } = await adminSupabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);
      if (itemsError) console.error('Items delete error:', itemsError);

      const { error } = await adminSupabase
        .from('orders')
        .delete()
        .eq('id', orderId);
      if (error) throw error;
      showToast('Order deleted successfully!');
      setDeleteOrderConfirm(null);
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (err) {
      console.error('Delete order error:', err);
      showToast(`Failed: ${err.message}`, 'error');
    } finally {
      setDeletingOrderId(null);
    }
  };

  const fetchSubscribers = async () => {
    setSubscribersLoading(true);
    try {
      const { data, error } = await adminSupabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });
      if (error) throw error;
      setSubscribers(data || []);
    } catch (err) {
      showToast('Failed to load subscribers', 'error');
    } finally {
      setSubscribersLoading(false);
    }
  };

  const handleDeleteSubscriber = async (id) => {
    try {
      const { error } = await adminSupabase
        .from('newsletter_subscribers')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setSubscribers(prev => prev.filter(s => s.id !== id));
      showToast('Subscriber removed!');
    } catch (err) {
      showToast('Failed to remove subscriber', 'error');
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await adminSupabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (file) => {
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await adminSupabase.storage
      .from('product-images')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });
    if (error) throw error;
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.stock_quantity) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    setSubmitting(true);
    try {
      let image_url = form.image_url || '';
      if (imageFile) {
        image_url = await uploadImage(imageFile);
      }

      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock_quantity: parseInt(form.stock_quantity),
        image_url,
      };

      if (editingId) {
        const { error } = await adminSupabase
          .from('products')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
        showToast('Product updated successfully!');
        setEditingId(null);
      } else {
        const { error } = await adminSupabase
          .from('products')
          .insert([payload]);
        if (error) throw error;
        showToast('Product added to collection!');
      }

      setForm(EMPTY_FORM);
      setImageFile(null);
      setImagePreview('');
      fetchProducts();
      setActiveTab('products');
    } catch (err) {
      showToast(err.message || 'Failed to save product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description || '',
      category: product.category,
      price: product.price,
      stock_quantity: product.stock_quantity,
      featured: product.featured,
      color: product.color || '#ffffff',
      image_url: product.image_url || '',
    });
    setImagePreview(product.image_url || '');
    setEditingId(product.id);
    setActiveTab('add');
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await adminSupabase.from('products').delete().eq('id', id);
      if (error) throw error;
      showToast('Product deleted!');
      setDeleteConfirm(null);
      fetchProducts();
    } catch (err) {
      showToast('Failed to delete product', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Mobile only, desktop uses sidebar */}
      <header className="md:hidden bg-[#1a1a1a] border-b border-gray-200 sticky top-0 z-20">
        <div className="flex items-center justify-between px-3 sm:px-4 py-3 sm:py-4">
          {/* Mobile Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#e8d5b7] rounded-lg flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-4 h-4 text-black" />
            </div>
            <div>
              <p className="text-white font-bold tracking-widest text-xs">DMILLION</p>
              <p className="text-gray-500 text-[10px] tracking-widest">ADMIN</p>
            </div>
          </div>

          {/* Mobile Controls */}
          {user && (
            <div className="flex items-center space-x-2">
              {/* Mobile Menu Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-white hover:bg-gray-200 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.button>

              {/* Logout Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            </div>
          )}
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar - Only visible on md and up */}
        <aside className="hidden md:flex flex-col w-64 bg-[#1a1a1a] border-r border-white/10 h-screen sticky top-0">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-[#e8d5b7] rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-black" />
              </div>
              <div>
                <p className="text-white font-bold tracking-widest text-sm">DMILLION</p>
                <p className="text-gray-500 text-xs tracking-widest">ADMIN</p>
              </div>
            </div>
            {user && (
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="" className="w-8 h-8 rounded-full border-2 border-[#e8d5b7]" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#e8d5b7] flex items-center justify-center text-black font-bold text-xs">
                    {user.email?.[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-white text-xs font-medium truncate">{user.user_metadata?.full_name || 'Admin'}</p>
                  <p className="text-gray-500 text-[10px] truncate">{user.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Nav */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {TABS.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setEditingId(null);
                }}
                whileHover={{ x: 4 }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  activeTab === tab.id
                    ? 'bg-[#e8d5b7] text-black'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </nav>

          {/* Desktop Logout */}
          <div className="p-4 border-t border-white/10">
            <motion.button
              whileHover={{ x: 4 }}
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </motion.button>
          </div>
        </aside>

        {/* Mobile Menu Dropdown - Only visible on mobile */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute top-14 left-0 md:hidden z-30 bg-[#1a1a1a] border-b border-gray-200 w-full shadow-lg"
            >
              <nav className="p-4 space-y-2">
                {TABS.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setEditingId(null);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                      activeTab === tab.id
                        ? 'bg-[#e8d5b7] text-black'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </motion.button>
                ))}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      onLogout();
                      setSidebarOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 w-full px-3 sm:px-4 md:px-8 py-4 sm:py-6 bg-white">
          {/* Toast */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: -20, x: 20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`fixed top-16 sm:top-20 right-2 sm:right-4 z-50 flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl shadow-2xl border mx-2 sm:mx-0 ${
                  toast.type === 'success'
                    ? 'bg-white border-[#e8d5b7]'
                    : 'bg-white border-red-300'
                }`}
              >
                {toast.type === 'success' ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
                )}
                <p className="text-xs sm:text-sm font-medium">{toast.message}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Delete Order Confirm Modal */}
          <AnimatePresence>
            {deleteOrderConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4"
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  className="bg-white rounded-lg sm:rounded-2xl p-6 sm:p-8 shadow-2xl max-w-sm w-full text-center"
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2">Delete Order?</h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-6">
                    This will permanently delete the order and all its items. This cannot be undone.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setDeleteOrderConfirm(null)}
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs sm:text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDeleteOrder(deleteOrderConfirm)}
                      disabled={deletingOrderId === deleteOrderConfirm}
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-red-500 hover:bg-red-600 text-gray-900 rounded-lg text-xs sm:text-sm font-medium disabled:opacity-50 flex items-center justify-center"
                    >
                      {deletingOrderId === deleteOrderConfirm ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        'Delete Order'
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Delete Product Confirm Modal */}
          <AnimatePresence>
            {deleteConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  className="bg-white rounded-lg sm:rounded-2xl p-6 sm:p-8 shadow-2xl max-w-sm w-full"
                >
                  <h3 className="text-lg sm:text-xl font-bold mb-2">Delete Product?</h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-6">
                    This will permanently remove this item from the collection.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(deleteConfirm)}
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-red-500 text-gray-900 rounded-lg hover:bg-red-600 transition-colors text-xs sm:text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 text-gray-900">Dashboard</h1>
                <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6">Manage your DMILLION product collection</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
                  {[
                    { label: 'Total Products', value: products.length, color: 'bg-blue-500', icon: Package },
                    { label: 'Total Orders', value: orders.length, color: 'bg-[#e8d5b7]', icon: Truck },
                    {
                      label: 'Pending Orders',
                      value: orders.filter(o => o.status === 'pending' || o.status === 'processing').length,
                      color: 'bg-red-400',
                      icon: Clock,
                    },
                    { label: 'Subscribers', value: subscribers.length, color: 'bg-green-500', icon: Users },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ y: -2, boxShadow: '0 12px 32px rgba(0,0,0,0.3)' }}
                      className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 border border-gray-200"
                    >
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 ${stat.color} rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 md:mb-4`}>
                        <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-900" />
                      </div>
                      <p className="text-gray-600 text-[10px] sm:text-xs md:text-sm mb-1">{stat.label}</p>
                      <p className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Recent Products */}
                <div className="bg-[#1a1a1a] rounded-lg sm:rounded-xl md:rounded-2xl border border-gray-200 p-3 sm:p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm sm:text-lg md:text-xl font-bold text-gray-900">Recent Products</h2>
                    <button
                      onClick={() => setActiveTab('add')}
                      className="text-xs sm:text-sm text-[#e8d5b7] hover:text-[#f0e5d8] flex items-center space-x-1 font-medium"
                    >
                      <PlusCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Add New</span>
                    </button>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    {products.slice(0, 5).map((p) => (
                      <div key={p.id} className="flex items-center justify-between py-2 sm:py-3 border-b border-gray-200 last:border-0 gap-2">
                        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {p.image_url ? (
                              <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Image className="w-4 h-4 text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{p.name}</p>
                            <p className="text-[10px] sm:text-xs text-gray-500 capitalize">{p.category}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs sm:text-sm font-bold text-gray-900">${parseFloat(p.price).toLocaleString()}</p>
                          <p className="text-[10px] sm:text-xs text-gray-500">Stock: {p.stock_quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ANALYTICS TAB */}
            {activeTab === 'analytics' && (
              <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <AdminAnalytics orders={orders} products={products} />
              </motion.div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 text-gray-900">Orders</h1>
                    <p className="text-gray-500 text-xs sm:text-sm">{orders.length} total orders</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchOrders}
                    className="flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 bg-gray-100 rounded-lg hover:bg-gray-200 text-xs sm:text-sm text-gray-300 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Refresh</span>
                  </motion.button>
                </div>

                {ordersLoading ? (
                  <div className="flex items-center justify-center h-40 sm:h-64">
                    <div className="w-10 h-10 border-4 border-[#e8d5b7] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-[#1a1a1a] rounded-lg sm:rounded-2xl p-8 sm:p-12 md:p-16 text-center border border-gray-200">
                    <Truck className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No Orders Yet</h3>
                    <p className="text-gray-500 text-xs sm:text-sm">Orders will appear here once customers start buying</p>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {orders.map((order, index) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        whileHover={{ y: -1, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
                        className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 border border-gray-200"
                      >
                        <div className="flex flex-col gap-3 sm:gap-4">
                          {/* Order Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start space-x-2 sm:space-x-3 min-w-0 flex-1">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center space-x-2 gap-2 mb-1 flex-wrap">
                                  <p className="font-mono text-xs sm:text-sm text-gray-900">#{order.tracking_number}</p>
                                  <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                                    {order.status}
                                  </span>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-600">
                                  {new Date(order.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600 truncate">{order.shipping_address}</p>
                                <p className="text-xs sm:text-sm font-semibold text-[#e8d5b7] mt-1">${parseFloat(order.total_amount).toLocaleString()}</p>
                              </div>
                            </div>

                            {/* Order Items Preview */}
                            <div className="flex -space-x-2 flex-shrink-0">
                              {order.order_items?.slice(0, 3).map((item, i) => (
                                <div key={i} className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gray-100 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                                  {item.products?.image_url ? (
                                    <img src={item.products.image_url} alt="" className="w-full h-full object-contain p-1" />
                                  ) : (
                                    <Package className="w-2 h-2 sm:w-3 sm:h-3 text-gray-500 m-auto" />
                                  )}
                                </div>
                              ))}
                              {order.order_items?.length > 3 && (
                                <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gray-200 rounded border border-gray-200 flex items-center justify-center text-[9px] sm:text-xs font-semibold text-gray-600">
                                  +{order.order_items.length - 3}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Status Updater */}
                          <div className="border-t border-gray-200 pt-3 sm:pt-4">
                            <p className="text-[10px] sm:text-xs text-gray-600 font-medium mb-2">Update Status:</p>
                            <div className="flex flex-wrap gap-1 sm:gap-2">
                              {ORDER_STATUSES.map(status => (
                                <motion.button
                                  key={status}
                                  whileHover={{ scale: 1.03 }}
                                  whileTap={{ scale: 0.97 }}
                                  onClick={() => updateOrderStatus(order.id, status)}
                                  disabled={order.status === status || updatingOrderId === order.id}
                                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded text-[10px] sm:text-xs font-medium capitalize transition-all disabled:opacity-50 ${
                                    order.status === status
                                      ? `${STATUS_COLORS[status]} ring-1 ring-offset-1 ring-current`
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  {updatingOrderId === order.id && order.status !== status ? (
                                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
                                  ) : (
                                    <>
                                      {status === 'pending' && <Box className="w-2.5 h-2.5 inline mr-0.5" />}
                                      {status === 'processing' && <Clock className="w-2.5 h-2.5 inline mr-0.5" />}
                                      {status === 'shipped' && <Truck className="w-2.5 h-2.5 inline mr-0.5" />}
                                      {status === 'delivered' && <CheckCircle className="w-2.5 h-2.5 inline mr-0.5" />}
                                      {status}
                                    </>
                                  )}
                                </motion.button>
                              ))}
                            </div>

                            {/* Delete Order Button */}
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setDeleteOrderConfirm(order.id)}
                              className="mt-2 w-full flex items-center justify-center space-x-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-[10px] sm:text-xs font-medium border border-red-500/20 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </motion.button>
                          </div>

                          {/* Order Items Detail */}
                          {order.order_items?.length > 0 && (
                            <div className="border-t border-gray-200 pt-2 sm:pt-3">
                              <div className="flex flex-wrap gap-1 sm:gap-2">
                                {order.order_items.map((item, i) => (
                                  <div key={i} className="flex items-center space-x-1 bg-gray-100 rounded px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs">
                                    <span className="font-medium text-gray-900">{item.products?.name || 'Product'}</span>
                                    <span className="text-gray-500">×{item.quantity}</span>
                                    <span className="text-[#e8d5b7] font-semibold">${(item.price * item.quantity).toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* SUBSCRIBERS TAB */}
            {activeTab === 'subscribers' && (
              <motion.div key="subscribers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 text-gray-900">Newsletter Subscribers</h1>
                    <p className="text-gray-600 text-xs sm:text-sm">{subscribers.length} total subscribers</p>
                  </div>
                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Live updates</span>
                  </div>
                </div>

                {subscribersLoading ? (
                  <div className="flex items-center justify-center h-40 sm:h-64">
                    <div className="w-10 h-10 border-4 border-[#e8d5b7] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : subscribers.length === 0 ? (
                  <div className="bg-[#1a1a1a] rounded-lg sm:rounded-2xl p-8 sm:p-12 md:p-16 text-center border border-gray-200">
                    <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No Subscribers Yet</h3>
                    <p className="text-gray-600 text-xs sm:text-sm">Newsletter subscribers will appear here</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-[#1a1a1a] rounded-xl border border-gray-200 overflow-hidden">
                      <div className="grid grid-cols-12 px-4 md:px-6 py-3 bg-gray-100 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="col-span-1">#</div>
                        <div className="col-span-7">Email Address</div>
                        <div className="col-span-4">Subscribed On</div>
                      </div>

                      <div className="divide-y divide-white/5">
                        {subscribers.map((sub, index) => (
                          <motion.div
                            key={sub.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                            className="grid grid-cols-12 px-4 md:px-6 py-3 md:py-4 items-center"
                          >
                            <div className="col-span-1 text-xs text-gray-500">{index + 1}</div>
                            <div className="col-span-7 flex items-center space-x-3">
                              <div className="w-7 h-7 md:w-8 md:h-8 bg-[#e8d5b7] rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-[10px] md:text-xs font-bold text-black">{sub.email[0].toUpperCase()}</span>
                              </div>
                              <span className="text-xs md:text-sm font-medium text-gray-900 truncate">{sub.email}</span>
                            </div>
                            <div className="col-span-3 text-xs md:text-sm text-gray-600 flex items-center justify-between">
                              <span className="truncate">
                                {new Date(sub.subscribed_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDeleteSubscriber(sub.id)}
                                className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors flex-shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="px-4 md:px-6 py-3 bg-gray-100 border-t border-gray-200 flex items-center justify-between">
                        <p className="text-xs text-gray-600">{subscribers.length} subscribers total</p>
                        <button
                          onClick={() => {
                            const csv =
                              'Email,Subscribed At\n' +
                              subscribers.map(s => `${s.email},${new Date(s.subscribed_at).toLocaleString()}`).join('\n');
                            const blob = new Blob([csv], { type: 'text/csv' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'dmillion-subscribers.csv';
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                          className="text-xs text-[#e8d5b7] hover:text-[#f0e5d8] font-medium"
                        >
                          Export CSV ↓
                        </button>
                      </div>
                    </div>

                    {/* Mobile & Tablet Card View */}
                    <div className="md:hidden space-y-2 sm:space-y-3">
                      {subscribers.map((sub, index) => (
                        <motion.div
                          key={sub.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="bg-[#1a1a1a] rounded-lg p-3 sm:p-4 border border-gray-200"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#e8d5b7] rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-[10px] sm:text-xs font-bold text-black">{sub.email[0].toUpperCase()}</span>
                                </div>
                                <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">{sub.email}</span>
                              </div>
                              <p className="text-[10px] sm:text-xs text-gray-500">
                                {new Date(sub.subscribed_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteSubscriber(sub.id)}
                              className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                      <button
                        onClick={() => {
                          const csv =
                            'Email,Subscribed At\n' +
                            subscribers.map(s => `${s.email},${new Date(s.subscribed_at).toLocaleString()}`).join('\n');
                          const blob = new Blob([csv], { type: 'text/csv' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'dmillion-subscribers.csv';
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="text-xs sm:text-sm text-[#e8d5b7] hover:text-[#f0e5d8] font-medium w-full text-center py-2 sm:py-3 mt-2"
                      >
                        Export CSV ↓
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
              <motion.div
                key="products"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 text-gray-900">Products</h1>
                    <p className="text-gray-600 text-xs sm:text-sm">{products.length} items in collection</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setForm(EMPTY_FORM);
                      setImageFile(null);
                      setImagePreview('');
                      setEditingId(null);
                      setActiveTab('add');
                    }}
                    className="flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#e8d5b7] text-black rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm hover:bg-[#f0e5d8] transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Add Product</span>
                  </motion.button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center h-40 sm:h-64">
                    <div className="w-10 h-10 border-4 border-[#e8d5b7] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : products.length === 0 ? (
                  <div className="bg-[#1a1a1a] rounded-lg sm:rounded-2xl p-6 sm:p-8 md:p-12 text-center border border-gray-200">
                    <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No Products Yet</h3>
                    <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6">Start adding luxury bags to your collection</p>
                    <button
                      onClick={() => setActiveTab('add')}
                      className="px-3 sm:px-4 py-2 sm:py-2.5 bg-[#e8d5b7] hover:bg-[#f0e5d8] text-black rounded-lg sm:rounded-xl font-medium transition-colors text-xs sm:text-sm"
                    >
                      Add First Product
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 sm:gap-3 md:gap-4">
                    {products.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -1, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
                        className="bg-[#1a1a1a] rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4"
                      >
                        {/* Image */}
                        <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Image className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-xs sm:text-sm md:text-base text-gray-900 truncate">{product.name}</h3>
                            {product.featured && (
                              <span className="px-2 py-0.5 bg-[#e8d5b7] text-black text-[10px] sm:text-xs rounded font-medium flex-shrink-0">
                                Featured
                              </span>
                            )}
                            {product.stock_quantity < 5 && (
                              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] sm:text-xs rounded font-medium flex-shrink-0">
                                Low Stock
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 capitalize">
                            {product.category} • Stock: {product.stock_quantity}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-500 truncate">{product.description}</p>
                        </div>

                        {/* Price & Actions */}
                        <div className="flex items-center justify-between gap-2 w-full sm:w-auto flex-wrap">
                          <p className="text-base sm:text-lg md:text-xl font-bold text-[#e8d5b7]">${parseFloat(product.price).toLocaleString()}</p>
                          <div className="flex items-center gap-1 sm:gap-2">
                            {/* QR Code Button */}
                            <div className="flex-shrink-0">
                              <ProductQRCode product={product} />
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleEdit(product)}
                              className="p-1.5 sm:p-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors flex-shrink-0"
                            >
                              <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setDeleteConfirm(product.id)}
                              className="p-1.5 sm:p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors flex-shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ADD / EDIT PRODUCT TAB */}
            {activeTab === 'add' && (
              <motion.div
                key="add"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex items-center justify-between mb-4 sm:mb-8">
                  <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">{editingId ? 'Edit Product' : 'Add Product'}</h1>
                    <p className="text-gray-500 text-xs sm:text-sm">
                      {editingId ? 'Update product details' : 'Add a new bag to the collection'}
                    </p>
                  </div>
                  {editingId && (
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setForm(EMPTY_FORM);
                        setImagePreview('');
                        setImageFile(null);
                      }}
                      className="flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Cancel Edit</span>
                    </button>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
                  {/* Image Upload */}
                  <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg sm:rounded-2xl p-3 sm:p-6 shadow-sm border border-gray-100">
                      <h3 className="font-semibold text-xs sm:text-sm mb-4">Product Image</h3>
                      <label className="cursor-pointer block">
                        <div
                          className={`w-full aspect-square rounded-lg sm:rounded-xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-colors ${
                            imagePreview ? 'border-transparent' : 'border-gray-200 hover:border-[#e8d5b7]'
                          }`}
                        >
                          {imagePreview ? (
                            <div className="relative w-full h-full">
                              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                <p className="text-gray-900 text-xs sm:text-sm font-medium">Change Image</p>
                              </div>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300 mb-2 sm:mb-3" />
                              <p className="text-xs sm:text-sm text-gray-500">Click to upload image</p>
                              <p className="text-[10px] sm:text-xs text-gray-600 mt-1">PNG, JPG, WEBP</p>
                            </>
                          )}
                        </div>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                      {imagePreview && (
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview('');
                          }}
                          className="mt-3 w-full py-2 text-xs sm:text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Remove Image
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="lg:col-span-2 bg-white rounded-lg sm:rounded-2xl p-3 sm:p-6 shadow-sm border border-gray-100 space-y-4 sm:space-y-5">
                    <h3 className="font-semibold text-xs sm:text-sm mb-2">Product Details</h3>

                    <div>
                      <label className="block text-xs sm:text-sm text-gray-600 mb-2 font-medium">Product Name *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        required
                        placeholder="e.g. Classic Leather Handbag"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-[#e8d5b7] transition-colors text-xs sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm text-gray-600 mb-2 font-medium">Description</label>
                      <textarea
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        rows={3}
                        placeholder="Short description of the product..."
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-[#e8d5b7] transition-colors resize-none text-xs sm:text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm text-gray-600 mb-2 font-medium">Category *</label>
                        <select
                          value={form.category}
                          onChange={e => setForm({ ...form, category: e.target.value })}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-[#e8d5b7] transition-colors capitalize text-xs sm:text-sm"
                        >
                          {CATEGORIES.map(c => (
                            <option key={c} value={c} className="capitalize">
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm text-gray-600 mb-2 font-medium">Color</label>
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <input
                            type="color"
                            value={form.color}
                            onChange={e => setForm({ ...form, color: e.target.value })}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-gray-200 cursor-pointer"
                            defaultValue="#ffffff"
                          />
                          <input
                            type="text"
                            value={form.color}
                            onChange={e => setForm({ ...form, color: e.target.value })}
                            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-[#e8d5b7] transition-colors text-xs sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm text-gray-600 mb-2 font-medium">Price (USD) *</label>
                        <input
                          type="number"
                          value={form.price}
                          onChange={e => setForm({ ...form, price: e.target.value })}
                          required
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-[#e8d5b7] transition-colors text-xs sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm text-gray-600 mb-2 font-medium">Stock Quantity *</label>
                        <input
                          type="number"
                          value={form.stock_quantity}
                          onChange={e => setForm({ ...form, stock_quantity: e.target.value })}
                          required
                          min="0"
                          placeholder="0"
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-[#e8d5b7] transition-colors text-xs sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={form.featured}
                        onChange={e => setForm({ ...form, featured: e.target.checked })}
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded accent-[#e8d5b7] cursor-pointer"
                      />
                      <label htmlFor="featured" className="text-xs sm:text-sm font-medium text-gray-700 cursor-pointer">
                        Mark as Featured Product (shows badge on website)
                      </label>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 sm:py-4 bg-[#1a1a1a] hover:bg-black text-white rounded-lg sm:rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 text-xs sm:text-sm"
                    >
                      {submitting ? (
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span>{editingId ? 'Update Product' : 'Publish to Collection'}</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
