import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import api from "../services/api";

// Load Razorpay checkout.js script dynamically on demand.
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// Client-side shipping form validation.
function validateShipping(form) {
  const { fullName, phone, addressLine1, city, state, pincode } = form;

  if (!fullName || fullName.trim() === "") return "Full Name is required.";
  if (!addressLine1 || addressLine1.trim() === "") return "Address Line 1 is required.";
  if (!city || city.trim() === "") return "City is required.";
  if (!state || state.trim() === "") return "State is required.";

  if (!pincode || !/^\d{6}$/.test(pincode.trim())) {
    return "Pincode must be exactly 6 digits.";
  }

  if (!phone || !/^\+?\d{7,15}$/.test(phone.trim())) {
    return "Please enter a valid phone number (7–15 digits).";
  }

  return null; // null = valid
}

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, refreshCart } = useCart();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [formError, setFormError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [processing, setProcessing] = useState(false);

  // Derived totals — display only, NOT sent to backend.
  const displaySubtotal = cartItems.reduce((acc, item) => {
    const price = item.product?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  const displayTotalQty = cartItems.reduce(
    (acc, item) => acc + (item.quantity || 0),
    0
  );

  const handleChange = (e) => {
    setFormError("");
    setPaymentError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Empty cart guard.
  if (cartItems.length === 0) {
    return (
      <div>
        <Navbar />
        <div className="checkout-container">
          <div className="cart-empty">
            <h2>Your cart is empty 🛒</h2>
            <p>Add items to your cart before checking out.</p>
            <button
              className="btn-primary"
              style={{ width: "auto", padding: "10px 24px" }}
              onClick={() => navigate("/products")}
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handlePayNow = async () => {
    setFormError("");
    setPaymentError("");

    // 1. Client-side validation.
    const validationError = validateShipping(form);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setProcessing(true);

    try {
      // 2. Load Razorpay script.
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setPaymentError("Failed to load payment gateway. Please try again.");
        setProcessing(false);
        return;
      }

      // 3. Create payment order on the backend.
      //    Send ONLY shippingAddress. Backend gets cart and prices from DB.
      const orderRes = await api.post("/orders/create-payment-order", {
        shippingAddress: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          addressLine1: form.addressLine1.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        },
      });

      const { orderId, razorpayOrderId, amount, currency, key } = orderRes.data;

      // 4. Open Razorpay Checkout.
      const options = {
        key,
        amount,
        currency,
        order_id: razorpayOrderId,
        name: "ShopKart",
        description: "Order Payment",
        prefill: {
          name: form.fullName.trim(),
          contact: form.phone.trim(),
        },
        theme: { color: "#0066cc" },

        // 5. Payment success handler.
        handler: async function (response) {
          try {
            // Send payment verification data to backend.
            // Backend performs HMAC SHA256 signature check.
            const verifyRes = await api.post("/orders/verify-payment", {
              orderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              // Backend has cleared the cart. Refresh the CartContext.
              await refreshCart(false);
              // Navigate to order success page.
              navigate(`/order-success/${orderId}`);
            } else {
              setPaymentError(
                verifyRes.data.message || "Payment verification failed."
              );
            }
          } catch (err) {
            console.log(err);
            setPaymentError(
              err.response?.data?.message ||
                "Payment verification failed. Please contact support."
            );
          } finally {
            setProcessing(false);
          }
        },

        // 6. Modal closed without payment.
        modal: {
          ondismiss: function () {
            setProcessing(false);
            setPaymentError("Payment was cancelled.");
          },
        },
      };

      const rzp = new window.Razorpay(options);

      // Handle Razorpay-level payment failure.
      rzp.on("payment.failed", function (response) {
        console.log(response.error);
        setProcessing(false);
        setPaymentError(
          response.error?.description || "Payment failed. Please try again."
        );
      });

      rzp.open();
    } catch (err) {
      console.log(err);
      setPaymentError(
        err.response?.data?.message ||
          "Something went wrong. Please try again."
      );
      setProcessing(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="checkout-container">
        <h2>Checkout</h2>

        <div className="checkout-layout">
          {/* ── Shipping Form ── */}
          <div className="checkout-form-section">
            <div className="checkout-card">
              <h3>Shipping Details</h3>

              {formError && (
                <p className="error-message">{formError}</p>
              )}

              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={form.fullName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="addressLine1">Address Line 1</label>
                <input
                  id="addressLine1"
                  name="addressLine1"
                  type="text"
                  placeholder="House no., Street, Area"
                  value={form.addressLine1}
                  onChange={handleChange}
                />
              </div>

              <div className="checkout-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    placeholder="Mumbai"
                    value={form.city}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="state">State</label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    placeholder="Maharashtra"
                    value={form.state}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="pincode">Pincode</label>
                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  placeholder="400001"
                  maxLength={6}
                  value={form.pincode}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* ── Order Summary ── */}
          <div className="checkout-summary-section">
            <div className="checkout-card">
              <h3>Order Summary</h3>

              <div className="checkout-item-list">
                {cartItems.map((item) => {
                  const product = item.product;
                  if (!product) return null;
                  const itemSubtotal = (product.price || 0) * item.quantity;
                  return (
                    <div key={product._id} className="checkout-item-row">
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="checkout-item-image"
                        />
                      )}
                      <div className="checkout-item-info">
                        <p className="checkout-item-name">{product.name}</p>
                        <p className="checkout-item-meta">
                          ₹{product.price} × {item.quantity}
                        </p>
                      </div>
                      <p className="checkout-item-subtotal">₹{itemSubtotal}</p>
                    </div>
                  );
                })}
              </div>

              <div className="checkout-divider" />

              <div className="summary-row">
                <span>Total Items:</span>
                <span>{displayTotalQty}</span>
              </div>
              <div className="summary-row">
                <strong>Total Amount:</strong>
                <strong className="summary-price">₹{displaySubtotal}</strong>
              </div>

              <p className="checkout-note">
                * Final amount is calculated securely on the server.
              </p>

              {paymentError && (
                <p className="error-message" style={{ marginTop: "12px" }}>
                  {paymentError}
                </p>
              )}

              <button
                id="btn-pay-now"
                className="btn-primary btn-checkout"
                disabled={processing}
                onClick={handlePayNow}
              >
                {processing ? "Processing..." : "Pay Now"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
