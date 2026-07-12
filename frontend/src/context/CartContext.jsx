import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import {
  fetchDbCart,
  addDbCartItem,
  updateDbCartItemQty,
  removeDbCartItem,
  clearDbCartItems,
  removeSelectedDbCartItems
} from '@/services/supabase/supabaseShopApi';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get user from AuthContext instead of polling localStorage
  const { user } = useAuth();

  // Sync or fetch cart when user status updates
  useEffect(() => {
    async function loadCart() {
      setLoading(true);
      if (user) {
        try {
          // Check for guest cart to merge
          const guestCartJson = localStorage.getItem('guest_cart');
          if (guestCartJson) {
            const guestItems = JSON.parse(guestCartJson);
            if (guestItems && guestItems.length > 0) {
              toast.info('Đang đồng bộ giỏ hàng của bạn...');
              for (const item of guestItems) {
                await addDbCartItem(user.customer_id, item.variant_id, item.quantity);
              }
              localStorage.removeItem('guest_cart');
              toast.success('Đồng bộ giỏ hàng thành công!');
            }
          }
          // Fetch from Supabase
          const dbItems = await fetchDbCart(user.customer_id);
          setCartItems(dbItems);
        } catch (e) {
          console.error('Error syncing/fetching cart:', e);
        }
      } else {
        // Guest mode
        const guestCartJson = localStorage.getItem('guest_cart');
        if (guestCartJson) {
          try {
            setCartItems(JSON.parse(guestCartJson));
          } catch (e) {
            console.error('Error parsing guest cart:', e);
            setCartItems([]);
          }
        } else {
          setCartItems([]);
        }
      }
      setLoading(false);
    }

    loadCart();
  }, [user]);

  // Add to cart
  const addToCart = async (product, variantId = null, quantity = 1) => {
    const targetVariantId = variantId || product.full_variants?.[0]?.variant_id;
    if (!targetVariantId) {
      toast.error('Sản phẩm không có phân loại hợp lệ');
      return;
    }

    const selectedVariant = product.full_variants?.find(v => v.variant_id === targetVariantId) || product.full_variants?.[0];
    const itemPrice = selectedVariant ? Number(selectedVariant.price) : Number(product.price);
    const itemLabel = selectedVariant ? selectedVariant.capacity_label : '';
    const itemStock = selectedVariant ? Number(selectedVariant.stock_quantity) : Number(product.stock);

    if (user) {
      try {
        await addDbCartItem(user.customer_id, targetVariantId, quantity);
        const dbItems = await fetchDbCart(user.customer_id);
        setCartItems(dbItems);
        toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
      } catch (e) {
        console.error('Error adding to database cart:', e);
        toast.error('Lỗi khi thêm vào giỏ hàng');
      }
    } else {
      // Guest cart logic
      const existingIdx = cartItems.findIndex(item => item.variant_id === targetVariantId);
      let newItems = [...cartItems];

      if (existingIdx > -1) {
        newItems[existingIdx].quantity += quantity;
      } else {
        newItems.push({
          cart_item_id: `G-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          variant_id: targetVariantId,
          quantity: quantity,
          name: product.name,
          price: itemPrice,
          image: product.image,
          capacity_label: itemLabel,
          stock_quantity: itemStock,
          brand: product.brand || 'Khác'
        });
      }

      setCartItems(newItems);
      localStorage.setItem('guest_cart', JSON.stringify(newItems));
      toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
    }
  };

  // Update quantity
  const updateQuantity = async (variantId, quantity) => {
    if (quantity < 1) return;

    if (user) {
      const item = cartItems.find(i => i.variant_id === variantId);
      if (!item) return;
      try {
        await updateDbCartItemQty(item.cart_item_id, quantity);
        const dbItems = await fetchDbCart(user.customer_id);
        setCartItems(dbItems);
      } catch (e) {
        console.error('Error updating quantity in database:', e);
        toast.error('Không thể cập nhật số lượng');
      }
    } else {
      const existingIdx = cartItems.findIndex(item => item.variant_id === variantId);
      if (existingIdx > -1) {
        const newItems = [...cartItems];
        newItems[existingIdx].quantity = quantity;
        setCartItems(newItems);
        localStorage.setItem('guest_cart', JSON.stringify(newItems));
      }
    }
  };

  // Remove from cart
  const removeFromCart = async (variantId) => {
    if (user) {
      const item = cartItems.find(i => i.variant_id === variantId);
      if (!item) return;
      try {
        await removeDbCartItem(item.cart_item_id);
        const dbItems = await fetchDbCart(user.customer_id);
        setCartItems(dbItems);
        toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
      } catch (e) {
        console.error('Error removing item from database:', e);
        toast.error('Không thể xóa sản phẩm');
      }
    } else {
      const newItems = cartItems.filter(item => item.variant_id !== variantId);
      setCartItems(newItems);
      localStorage.setItem('guest_cart', JSON.stringify(newItems));
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (user) {
      try {
        await clearDbCartItems(user.customer_id);
        setCartItems([]);
      } catch (e) {
        console.error('Error clearing database cart:', e);
      }
    } else {
      localStorage.removeItem('guest_cart');
      setCartItems([]);
    }
  };

  // Clear selected items from cart
  const clearSelectedItems = async (variantIds) => {
    if (!variantIds || variantIds.length === 0) return;
    
    if (user) {
      try {
        await removeSelectedDbCartItems(user.customer_id, variantIds);
        const dbItems = await fetchDbCart(user.customer_id);
        setCartItems(dbItems);
      } catch (e) {
        console.error('Error clearing selected items from database:', e);
      }
    } else {
      const newItems = cartItems.filter(item => !variantIds.includes(item.variant_id));
      setCartItems(newItems);
      localStorage.setItem('guest_cart', JSON.stringify(newItems));
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        loading,
        user,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        clearSelectedItems
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
