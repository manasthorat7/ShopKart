import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          <button className="btn-primary" style={{ marginTop: "20px" }}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
