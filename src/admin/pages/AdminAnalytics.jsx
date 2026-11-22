import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { adminSupabase } from '../lib/adminSupabase';
import { TrendingUp, DollarSign, Package, ShoppingCart, RefreshCw, ArrowUp, ArrowDown } from 'lucide-react';

const BEIGE = '#e8d5b7';
const DARK = '#3d2415';
const COLORS = ['#e8d5b7', '#3d2415', '#1a1a1a', '#d4c1a3', '#8b6f47'];

const STATUS_COLORS = {
  pending: '#f59e0b',
  processing: '#3b82f6',
  shipped: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

export function AdminAnalytics({ orders, products }) {
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState({
    dailyOrders: [],
    statusBreakdown: [],
    topProducts: [],
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    deliveredOrders: 0,
  });

  useEffect(() => {
    computeAnalytics();
  }, [orders, products, timeRange]);

  const computeAnalytics = () => {
    if (!orders.length) return;

    // Filter by time range
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const filtered = orders.filter(o => new Date(o.created_at) >= cutoff);

    // Daily orders & revenue chart
    const dailyMap = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyMap[key] = { date: key, orders: 0, revenue: 0 };
    }
    filtered.forEach(o => {
      const key = new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (dailyMap[key]) {
        dailyMap[key].orders += 1;
        dailyMap[key].revenue += parseFloat(o.total_amount || 0);
      }
    });

    // Status breakdown
    const statusMap = {};
    filtered.forEach(o => {
      statusMap[o.status] = (statusMap[o.status] || 0) + 1;
    });
    const statusBreakdown = Object.entries(statusMap).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: STATUS_COLORS[status] || '#888',
    }));

    // Top products by order frequency
    const productCount = {};
    filtered.forEach(o => {
      o.order_items?.forEach(item => {
        const name = item.products?.name || `Product #${item.product_id}`;
        if (!productCount[name]) productCount[name] = { name, orders: 0, revenue: 0 };
        productCount[name].orders += item.quantity || 1;
        productCount[name].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });
    const topProducts = Object.values(productCount)
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5);

    // Summary stats
    const totalRevenue = filtered.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
    const deliveredOrders = filtered.filter(o => o.status === 'delivered').length;

    setAnalyticsData({
      dailyOrders: Object.values(dailyMap),
      statusBreakdown,
      topProducts,
      totalRevenue,
      totalOrders: filtered.length,
      avgOrderValue: filtered.length ? totalRevenue / filtered.length : 0,
      deliveredOrders,
    });
  };

  const stats = [
    {
      label: 'Total Revenue',
      value: `$${analyticsData.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'bg-green-500',
      trend: '+12%',
      up: true,
    },
    {
      label: 'Total Orders',
      value: analyticsData.totalOrders,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      trend: '+8%',
      up: true,
    },
    {
      label: 'Avg Order Value',
      value: `$${analyticsData.avgOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'bg-[#e8d5b7]',
      trend: '+3%',
      up: true,
    },
    {
      label: 'Delivered',
      value: analyticsData.deliveredOrders,
      icon: Package,
      color: 'bg-emerald-500',
      trend: analyticsData.totalOrders ? `${Math.round(analyticsData.deliveredOrders / analyticsData.totalOrders * 100)}%` : '0%',
      up: true,
    },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1a1a] text-white px-4 py-3 rounded-xl shadow-2xl text-sm">
          <p className="font-semibold mb-1">{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }} className="text-xs">
              {p.name}: {p.name === 'Revenue' ? `$${parseFloat(p.value).toFixed(2)}` : p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">Analytics</h1>
          <p className="text-xs sm:text-sm text-gray-500">Real-time order performance & revenue insights</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex bg-gray-100 rounded-lg sm:rounded-xl p-1 space-x-1 text-xs sm:text-sm">
          {[{ label: '7 Days', value: '7d' }, { label: '30 Days', value: '30d' }, { label: '90 Days', value: '90d' }].map(range => (
            <button key={range.value} onClick={() => setTimeRange(range.value)}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${timeRange === range.value ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}>
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((stat, i) => (
          <motion.div key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -2 }}
            className="bg-white rounded-lg sm:rounded-2xl p-3 sm:p-5 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 ${stat.color} rounded-lg sm:rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className={`flex items-center space-x-0.5 text-[10px] sm:text-xs font-semibold ${stat.up ? 'text-green-500' : 'text-red-500'}`}>
                {stat.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                <span>{stat.trend}</span>
              </span>
            </div>
            <p className="text-lg sm:text-2xl font-bold mb-0.5 sm:mb-1 truncate">{stat.value}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Orders Over Time & Revenue Over Time - Stack on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-lg sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h3 className="text-xs sm:text-sm font-semibold mb-1">Orders Over Time</h3>
          <p className="text-[10px] sm:text-xs text-gray-400 mb-3 sm:mb-4">Number of orders per day</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={analyticsData.dailyOrders}>
              <defs>
                <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={BEIGE} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={BEIGE} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false}
                interval={Math.floor(analyticsData.dailyOrders.length / 4)} />
              <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="orders" name="Orders" stroke={DARK} strokeWidth={2}
                fill="url(#ordersGrad)" dot={{ fill: DARK, r: 2 }} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Revenue Over Time Chart */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-lg sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h3 className="text-xs sm:text-sm font-semibold mb-1">Revenue Over Time</h3>
          <p className="text-[10px] sm:text-xs text-gray-400 mb-3 sm:mb-4">Daily revenue in USD</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={analyticsData.dailyOrders}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false}
                interval={Math.floor(analyticsData.dailyOrders.length / 4)} />
              <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false}
                tickFormatter={v => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2}
                fill="url(#revenueGrad)" dot={{ fill: '#10b981', r: 2 }} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Status Breakdown & Top Products - Stack on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Order Status Breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-lg sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h3 className="text-xs sm:text-sm font-semibold mb-1">Order Status Breakdown</h3>
          <p className="text-[10px] sm:text-xs text-gray-400 mb-3 sm:mb-4">Distribution of order statuses</p>
          {analyticsData.statusBreakdown.length === 0 ? (
            <div className="flex items-center justify-center h-40 sm:h-48 text-gray-400 text-xs sm:text-sm">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={analyticsData.statusBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                  paddingAngle={2} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}>
                  {analyticsData.statusBreakdown.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => val} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Top Products Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-white rounded-lg sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h3 className="text-xs sm:text-sm font-semibold mb-1">Top Products</h3>
          <p className="text-[10px] sm:text-xs text-gray-400 mb-3 sm:mb-4">Most ordered products</p>
          {analyticsData.topProducts.length === 0 ? (
            <div className="flex items-center justify-center h-40 sm:h-48 text-gray-400 text-xs sm:text-sm">No product data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={analyticsData.topProducts} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 8 }} tickLine={false} axisLine={false} width={60} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="orders" name="Orders" fill={BEIGE} radius={[0, 4, 4, 0]}>
                  {analyticsData.topProducts.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? DARK : i === 1 ? '#8b6f47' : BEIGE} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Live indicator */}
      <div className="flex items-center justify-center space-x-2 mt-6 text-xs sm:text-sm text-gray-400">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span>Analytics update in real-time as orders come in</span>
      </div>
    </motion.div>
  );
}
