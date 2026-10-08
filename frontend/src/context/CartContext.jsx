import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const refreshCart = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        setError(null);
        try {
            const response = await api.get("/cart");
            if (response.data && Array.isArray(response.data.cart)) {
                setCartItems(response.data.cart);
            } else {
                setCartItems([]);
            }
        } catch (err) {
            if (err.response && err.response.status === 401) {
                // User is unauthenticated; safely reset cart without crashing or error alert
                setCartItems([]);
            } else {
                setError(err.response?.data?.message || "Failed to fetch cart");
            }
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const addToCart = async (productId) => {
        setError(null);
        try {
            const response = await api.post(`/cart/${productId}`);
            await refreshCart(false);
            return { success: true, data: response.data };
        } catch (err) {
            const message = err.response?.data?.message || "Failed to add to cart";
            return { success: false, error: message };
        }
    };

    const updateQuantity = async (productId, quantity) => {
        setError(null);
        try {
            const response = await api.patch(`/cart/${productId}`, { quantity });
            await refreshCart(false);
            return { success: true, data: response.data };
        } catch (err) {
            const message = err.response?.data?.message || "Failed to update quantity";
            return { success: false, error: message };
        }
    };

    const removeFromCart = async (productId) => {
        setError(null);
        try {
            const response = await api.delete(`/cart/${productId}`);
            await refreshCart(false);
            return { success: true, data: response.data };
        } catch (err) {
            const message = err.response?.data?.message || "Failed to remove from cart";
            return { success: false, error: message };
        }
    };

    useEffect(() => {
        refreshCart(true);
    }, []);

    // Derived total cart quantity (sum of all item quantities)
    const totalQuantity = cartItems.reduce(
        (total, item) => total + (item.quantity || 0),
        0
    );
    const cartCount = totalQuantity;

    const value = {
        cartItems,
        loading,
        error,
        totalQuantity,
        cartCount,
        refreshCart,
        addToCart,
        updateQuantity,
        removeFromCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};
