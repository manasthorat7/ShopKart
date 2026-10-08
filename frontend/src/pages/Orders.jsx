import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/orders");
      setOrders(response.data.orders || []);
    } catch (err) {
      console.log(err);
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError("Unable to load your orders.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const totalItems = (order) =>
    order.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div>
      <Navbar />
      <div className="orders-container">
        <h2>My Orders</h2>

        {loading ? (
          <p className="cart-status-message">Loading your orders...</p>
        ) : error ? (
          <div className="cart-empty">
            <p>{error}</p>
            <button
              className="btn-primary"
              style={{ width: "auto", padding: "8px 20px" }}
              onClick={fetchOrders}
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="cart-empty">
            <h3>No orders found.</h3>
            <p>You haven't placed any orders yet.</p>
            <button
              className="btn-primary"
              style={{ width: "auto", padding: "10px 24px", marginTop: "12px" }}
              onClick={() => navigate("/products")}
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-card-header">
                  <div>
                    <p className="order-id">Order #{order._id}</p>
                    <p className="order-date">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="order-badges">
                    <span className={`order-badge order-badge-${order.paymentStatus?.toLowerCase()}`}>
                      {order.paymentStatus}
                    </span>
                    <span className="order-badge order-badge-status">
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="order-card-body">
                  <div className="summary-row">
                    <span>Items:</span>
                    <span>{totalItems(order)} item(s) ({order.items.length} product{order.items.length !== 1 ? "s" : ""})</span>
                  </div>
                  <div className="summary-row">
                    <strong>Total:</strong>
                    <strong className="summary-price">₹{order.totalAmount}</strong>
                  </div>
                </div>

                <button
                  className="btn-details"
                  style={{ marginTop: "12px", width: "auto", padding: "7px 16px" }}
                  onClick={() => navigate(`/orders/${order._id}`)}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
