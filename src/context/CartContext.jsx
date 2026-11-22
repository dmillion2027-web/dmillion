import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setCartItems([]);
      return;
    }

    fetchCart();

    // Real-time subscription
    const subscription = supabase
      .channel(`cart-${user.id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'carts', filter: `user_id=eq.${user.id}` },
        () => fetchCart()
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [user]);

  // Listen for cart-clear event (triggered on sign out)
  useEffect(() => {
    const handleCartClear = () => setCartItems([]);
    window.addEventListener('cart-clear', handleCartClear);
    return () => window.removeEventListener('cart-clear', handleCartClear);
  }, []);

  const fetchCart = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('carts')
        .select('*, products(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Map to flat cart items format
      const items = (data || []).map(item => ({
        ...item.products,
        quantity: item.quantity,
        cart_id: item.id,
      }));
      setCartItems(items);
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (!user) return;

    // Optimistic update
    const existing = cartItems.find(item => item.id === product.id);
    if (existing) {
      setCartItems(prev =>
        prev.map(item => item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
        )
      );
    } else {
      setCartItems(prev => [...prev, { ...product, quantity }]);
    }

    try {
      const { error } = await supabase
        .from('carts')
        .upsert([{
          user_id: user.id,
          product_id: product.id,
          quantity: existing ? existing.quantity + quantity : quantity,
          updated_at: new Date().toISOString(),
        }], { onConflict: 'user_id,product_id' });
      if (error) throw error;
    } catch (err) {
      console.error('Error adding to cart:', err);
      fetchCart(); // Rollback by refetching
    }
  };

  const removeFromCart = async (productId) => {
    if (!user) return;

    // Optimistic update
    const previous = cartItems;
    setCartItems(prev => prev.filter(item => item.id !== productId));

    try {
      const { error } = await supabase
        .from('carts')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      if (error) throw error;
    } catch (err) {
      console.error('Error removing from cart:', err);
      setCartItems(previous); // Rollback
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!user) return;

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    // Optimistic update
    setCartItems(prev =>
      prev.map(item => item.id === productId ? { ...item, quantity } : item)
    );

    try {
      const { error } = await supabase
        .from('carts')
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('product_id', productId);
      if (error) throw error;
    } catch (err) {
      console.error('Error updating quantity:', err);
      fetchCart(); // Rollback
    }
  };

  const clearCart = async () => {
    if (!user) return;
    setCartItems([]);
    try {
      const { error } = await supabase
        .from('carts')
        .delete()
        .eq('user_id', user.id);
      if (error) throw error;
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartItemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
}
