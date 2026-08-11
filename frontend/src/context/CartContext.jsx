import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cart, setCart] = useState({ items: [], total: 0 });
    const [cartCount, setCartCount] = useState(0);

    const fetchCart = useCallback(async () => {
        if (!user) { setCart({ items: [], total: 0 }); setCartCount(0); return; }
        try {
            const { data } = await api.get('/cart');
            setCart(data.data);
            setCartCount(data.data.items.reduce((s, i) => s + i.quantity, 0));
        } catch { }
    }, [user]);

    useEffect(() => { fetchCart(); }, [fetchCart]);

    const addToCart = async (book_id, quantity = 1) => {
        await api.post('/cart', { book_id, quantity });
        await fetchCart();
    };

    const updateItem = async (id, quantity) => {
        await api.put(`/cart/${id}`, { quantity });
        await fetchCart();
    };

    const removeItem = async (id) => {
        await api.delete(`/cart/${id}`);
        await fetchCart();
    };

    const clearCart = async () => {
        await api.delete('/cart/clear');
        await fetchCart();
    };

    return (
        <CartContext.Provider value={{ cart, cartCount, fetchCart, addToCart, updateItem, removeItem, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
