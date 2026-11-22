import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const WishlistContext = createContext({});

export const useWishlist = () => useContext(WishlistContext);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setWishlistItems([]);
      return;
    }
    fetchWishlist();

    // Real-time subscription
    const subscription = supabase
      .channel(`wishlist-${user.id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'wishlists', filter: `user_id=eq.${user.id}` },
        () => fetchWishlist()
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [user]);

  const fetchWishlist = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('wishlists')
        .select('*, products(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setWishlistItems(data || []);
    } catch (err) {
      console.error('Wishlist fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (product) => {
    if (!user) return;

    // Optimistic update - add immediately to UI
    const optimisticItem = {
      id: `temp-${product.id}`,
      user_id: user.id,
      product_id: product.id,
      products: product,
      created_at: new Date().toISOString(),
    };
    setWishlistItems(prev => [optimisticItem, ...prev]);

    try {
      const { data, error } = await supabase
        .from('wishlists')
        .insert([{ user_id: user.id, product_id: product.id }])
        .select('*, products(*)')
        .single();
      if (error) throw error;
      // Replace optimistic item with real data
      setWishlistItems(prev => prev.map(item => item.id === optimisticItem.id ? data : item));
    } catch (err) {
      // Rollback on error
      setWishlistItems(prev => prev.filter(item => item.id !== optimisticItem.id));
      console.error('Add to wishlist error:', err);
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!user) return;

    // Optimistic update - remove immediately from UI
    const previous = wishlistItems;
    setWishlistItems(prev => prev.filter(item => item.product_id !== productId));

    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      if (error) throw error;
    } catch (err) {
      // Rollback on error
      setWishlistItems(previous);
      console.error('Remove from wishlist error:', err);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.product_id === productId);
  };

  const toggleWishlist = async (product) => {
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      loading,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isInWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}
