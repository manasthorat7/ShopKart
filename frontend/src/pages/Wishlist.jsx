import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

function Wishlist() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);
  const [removeError, setRemoveError] = useState("");

  const fetchWishlist = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/wishlist");
      setWishlist(response.data.wishlist);
    } catch (err) {
      console.log(err);
      setError("Unable to load wishlist.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    setRemovingId(productId);
    setRemoveError("");
    try {
      await api.delete(`/wishlist/${productId}`);
      setWishlist((prev) => prev.filter((product) => product._id !== productId));
    } catch (err) {
      console.log(err);
      setRemoveError("Unable to remove from wishlist.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="wishlist-container">
        <h2>My Wishlist</h2>

        {loading ? (
          <p>Loading your wishlist...</p>
        ) : error ? (
          <div>
            <p>{error}</p>
            <button className="btn-primary" style={{ maxWidth: "200px" }} onClick={fetchWishlist}>
              Try Again
            </button>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="wishlist-empty">
            <p>Your wishlist is empty ❤️</p>
            <button className="btn-primary" style={{ maxWidth: "200px" }} onClick={() => navigate("/products")}>
              Browse Products
            </button>
          </div>
        ) : (
          <>
            {removeError && <p className="error-message">{removeError}</p>}
            <div className="products-grid">
              {wishlist.map((product) => (
                <div key={product._id} className="product-card">
                  <img src={product.image} alt={product.name} className="product-image" />
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="product-category">{product.category}</p>
                    <p className="product-price">₹{product.price}</p>
                    <p className="product-stock">{product.stock} units left</p>
                    <button className="btn-details" onClick={() => navigate(`/products/${product._id}`)}>
                      View Details
                    </button>
                    <button
                      className="btn-wishlist-remove"
                      disabled={removingId === product._id}
                      onClick={() => handleRemove(product._id)}
                    >
                      {removingId === product._id ? "Removing..." : "Remove from Wishlist"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Wishlist;
