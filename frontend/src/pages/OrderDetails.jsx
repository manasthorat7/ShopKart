import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get(`/orders/${id}`);
        setOrder(response.data.order);
      } catch (err) {
        console.log(err);
        if (err.response?.status === 401) {
          navigate("/login");
        } else {
          setError("Unable to load order details.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div>
      <Navbar />
      <div className="orders-container">
        <div style={{ marginBottom: "16px" }}>
          <button
            className="btn-details"
            style={{ width: "auto", padding: "7px 16px" }}
            onClick={() => navigate("/orders")}
          >
            ← Back to My Orders
          </button>
        </div>

        {loading ? (
          <p className="cart-status-message">Loading order details...</p>
        ) : error ? (
          <div className="cart-empty">
            <p>{error}</p>
            <button
              className="btn-primary"
              style={{ width: "auto", padding: "8px 20px" }}
              onClick={() => navigate("/orders")}
            >
              My Orders
            </button>
          </div>
        ) : (
          <>
            <h2 style={{ marginBottom: "20px" }}>Order Details</h2>

            {/* Order summary header */}
            <div className="checkout-card" style={{ marginBottom: "20px" }}>
              <h3>Order Information</h3>
              <div className="summary-row">
                <span>Order ID:</span>
                <span style={{ fontSize: "13px", color: "#555" }}>{order._id}</span>
              </div>
              <div className="summary-row">
                <span>Date:</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              <div className="summary-row">
                <span>Payment Status:</span>
                <span className={`order-badge order-badge-${order.paymentStatus?.toLowerCase()}`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="summary-row">
                <span>Order Status:</span>
                <span className="order-badge order-badge-status">
                  {order.status}
                </span>
              </div>
              <div className="summary-row" style={{ marginTop: "8px" }}>
                <strong>Total Amount:</strong>
                <strong className="summary-price">₹{order.totalAmount}</strong>
              </div>
            </div>

            {/* Items — using stored snapshots, NOT current product prices */}
            <div className="checkout-card" style={{ marginBottom: "20px" }}>
              <h3>Items Ordered</h3>
              <div className="checkout-item-list">
                {order.items.map((item) => {
                  const itemSubtotal = item.price * item.quantity;
                  return (
                    <div key={item._id} className="checkout-item-row">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="checkout-item-image"
                        />
                      )}
                      <div className="checkout-item-info">
                        {/* name and price are order-time snapshots */}
                        <p className="checkout-item-name">{item.name}</p>
                        <p className="checkout-item-meta">
                          ₹{item.price} × {item.quantity}
                        </p>
                      </div>
                      <p className="checkout-item-subtotal">₹{itemSubtotal}</p>
                    </div>
                  );
                })}
              </div>
              <div className="checkout-divider" />
              <div className="summary-row">
                <strong>Order Total:</strong>
                <strong className="summary-price">₹{order.totalAmount}</strong>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="checkout-card" style={{ marginBottom: "20px" }}>
              <h3>Shipping Address</h3>
              <p style={{ fontSize: "15px", lineHeight: "1.7", color: "#333" }}>
                {order.shippingAddress.fullName}<br />
                {order.shippingAddress.addressLine1}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}<br />
                Phone: {order.shippingAddress.phone}
              </p>
            </div>

            <button
              className="btn-primary"
              style={{ width: "auto", padding: "10px 24px" }}
              onClick={() => navigate("/products")}
            >
              Continue Shopping
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default OrderDetails;
