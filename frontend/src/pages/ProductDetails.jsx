import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { useCart } from "../context/CartContext";

function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wishlistStatus, setWishlistStatus] = useState("");
  const [cartStatus, setCartStatus] = useState("");

  const handleAddToCart = async () => {
    setCartStatus("loading");
    const result = await addToCart(product._id);
    if (result.success) {
      setCartStatus("added");
      setTimeout(() => setCartStatus(""), 1500);
    } else {
      setCartStatus(result.error || "Failed to add");
      setTimeout(() => setCartStatus(""), 2500);
    }
  };

  const handleAddToWishlist = async () => {
    setWishlistStatus("loading");
    try {
      await api.post(`/wishlist/${product._id}`);
      setWishlistStatus("added");
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setWishlistStatus("already");
      } else if (err.response && err.response.status === 401) {
        setWishlistStatus("Please login first");
      } else {
        setWishlistStatus("Failed to add");
      }
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        console.log(err);
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="home-container">
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div>
        <Navbar />
        <div className="home-container">
          <p>{error || "Product not found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="home-container">
        <div className="profile-card">
          <img
            src={product.image}
            alt={product.name}
            style={{ width: "100%", maxHeight: "350px", objectFit: "cover", borderRadius: "4px", marginBottom: "20px" }}
          />
          <h2>{product.name}</h2>
          <p className="home-subtitle">{product.category}</p>
          <p style={{ marginBottom: "16px", color: "#555", lineHeight: "1.5" }}>{product.description}</p>
          <div className="profile-details">
            <div className="detail-row">
              <strong>Price:</strong>
              <span>₹{product.price}</span>
            </div>
            <div className="detail-row">
              <strong>Stock:</strong>
              <span>{product.stock} units left</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
            <button
              className="btn-primary"
              style={{ margin: 0 }}
              disabled={cartStatus === "loading"}
              onClick={handleAddToCart}
            >
              {cartStatus === "loading"
                ? "Adding..."
                : cartStatus === "added"
                ? "✓ Added to Cart"
                : cartStatus
                ? cartStatus
                : "Add to Cart"}
            </button>
            <button
              className="btn-wishlist"
              style={{ margin: 0, padding: "10px", fontSize: "15px", fontWeight: "bold" }}
              disabled={wishlistStatus === "loading" || wishlistStatus === "added"}
              onClick={handleAddToWishlist}
            >
              {wishlistStatus === "loading"
                ? "⏳ Saving..."
                : wishlistStatus === "added"
                ? "♥ Added to Wishlist"
                : wishlistStatus === "already"
                ? "Already in Wishlist"
                : wishlistStatus
                ? wishlistStatus
                : "♡ Add to Wishlist"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
