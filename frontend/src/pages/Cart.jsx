import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

function Cart() {
  const navigate = useNavigate();
  const {
    cartItems,
    loading,
    error,
    refreshCart,
    updateQuantity,
    removeFromCart
  } = useCart();

  const [actionLoading, setActionLoading] = useState({});

  const handleUpdateQuantity = async (productId, newQuantity) => {
    setActionLoading((prev) => ({ ...prev, [productId]: true }));
    await updateQuantity(productId, newQuantity);
    setActionLoading((prev) => ({ ...prev, [productId]: false }));
  };

  const handleRemove = async (productId) => {
    setActionLoading((prev) => ({ ...prev, [productId]: true }));
    await removeFromCart(productId);
    setActionLoading((prev) => ({ ...prev, [productId]: false }));
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="cart-container">
          <p className="cart-status-message">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="cart-container">
          <div className="cart-empty">
            <p>Unable to load your cart.</p>
            <button className="btn-primary" style={{ width: "auto", padding: "8px 20px" }} onClick={refreshCart}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div>
        <Navbar />
        <div className="cart-container">
          <div className="cart-empty">
            <h2>Your cart is empty 🛒</h2>
            <p>Looks like you haven't added anything yet.</p>
            <button className="btn-primary" style={{ width: "auto", padding: "10px 24px" }} onClick={() => navigate("/products")}>
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  const totalQuantity = cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0);

  return (
    <div>
      <Navbar />
      <div className="cart-container">
        <h2>Shopping Cart</h2>

        <div className="cart-layout">
          <div className="cart-items-list">
            {cartItems.map((item) => {
              const product = item.product;
              if (!product) return null;

              const isUpdating = actionLoading[product._id];
              const isAtMaxStock = item.quantity >= product.stock;
              const isAtMinQuantity = item.quantity <= 1;
              const itemSubtotal = (product.price || 0) * item.quantity;

              return (
                <div key={product._id} className="cart-item-card">
                  <img src={product.image} alt={product.name} className="cart-item-image" />
                  
                  <div className="cart-item-details">
                    <h3>{product.name}</h3>
                    <p className="cart-item-category">{product.category}</p>
                    <p className="cart-item-price">₹{product.price}</p>
                    <p className="cart-item-stock">{product.stock} units in stock</p>
                  </div>

                  <div className="cart-item-controls">
                    <div className="quantity-controls">
                      <button
                        className="qty-btn"
                        disabled={isAtMinQuantity || isUpdating}
                        onClick={() => handleUpdateQuantity(product._id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        disabled={isAtMaxStock || isUpdating}
                        onClick={() => handleUpdateQuantity(product._id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>

                    <p className="item-subtotal">Subtotal: ₹{itemSubtotal}</p>

                    <button
                      className="btn-remove-cart"
                      disabled={isUpdating}
                      onClick={() => handleRemove(product._id)}
                    >
                      {isUpdating ? "Updating..." : "Remove"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="order-summary-card">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Total Items:</span>
              <span>{totalQuantity}</span>
            </div>
            <div className="summary-row">
              <strong>Subtotal:</strong>
              <strong className="summary-price">₹{subtotal}</strong>
            </div>
            <button className="btn-primary btn-checkout" onClick={() => navigate("/checkout")}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
