import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

function OrderSuccess() {
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
        setError("Unable to load order details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  return (
    <div>
      <Navbar />
      <div className="order-success-container">
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
          <div className="order-success-card">
            <div className="order-success-header">
              <span className="order-success-icon">✅</span>
              <h2>Order Placed Successfully!</h2>
              <p className="order-success-subtitle">
                Thank you for your purchase.
              </p>
            </div>

            <div className="order-info-block">
              <div className="order-info-row">
                <span>Order ID:</span>
                <span className="order-info-value">{order._id}</span>
              </div>
              <div className="order-info-row">
                <span>Payment Status:</span>
                <span className={`order-badge order-badge-${order.paymentStatus?.toLowerCase()}`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="order-info-row">
                <span>Order Status:</span>
                <span className="order-badge order-badge-placed">
                  {order.status}
                </span>
              </div>
              <div className="order-info-row">
                <strong>Total Amount:</strong>
                <strong className="summary-price">₹{order.totalAmount}</strong>
              </div>
            </div>

            <div className="order-success-actions">
              <button
                className="btn-primary"
                style={{ width: "auto", padding: "10px 24px" }}
                onClick={() => navigate("/orders")}
              >
                My Orders
              </button>
              <button
                className="btn-primary"
                style={{
                  width: "auto",
                  padding: "10px 24px",
                  backgroundColor: "#28a745"
                }}
                onClick={() => navigate("/products")}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderSuccess;
