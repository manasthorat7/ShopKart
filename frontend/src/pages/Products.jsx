import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [wishlistStatus, setWishlistStatus] = useState({});

  const handleAddToWishlist = async (productId) => {
    setWishlistStatus((prev) => ({ ...prev, [productId]: "loading" }));
    try {
      await api.post(`/wishlist/${productId}`);
      setWishlistStatus((prev) => ({ ...prev, [productId]: "added" }));
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setWishlistStatus((prev) => ({ ...prev, [productId]: "already" }));
      } else if (err.response && err.response.status === 401) {
        setWishlistStatus((prev) => ({ ...prev, [productId]: "Please login first" }));
      } else {
        setWishlistStatus((prev) => ({ ...prev, [productId]: "Failed to add" }));
      }
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const params = {};
        if (search.trim()) {
          params.search = search.trim();
        }
        if (category && category !== "All Categories") {
          params.category = category;
        }

        const response = await api.get("/products", { params });
        setProducts(response.data.products);
      } catch (err) {
        console.log(err);
        setError("Something went wrong while loading products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, category]);

  return (
    <div>
      <Navbar />
      <div className="products-container">
        <h2>Products</h2>

        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              padding: "8px 12px",
              fontSize: "14px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              outline: "none"
            }}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              padding: "8px 12px",
              fontSize: "14px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              outline: "none",
              backgroundColor: "#fff"
            }}
          >
            <option value="All Categories">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Fashion">Fashion</option>
            <option value="Books">Books</option>
            <option value="Home">Home</option>
          </select>
        </div>

        {loading ? (
          <p>Loading products...</p>
        ) : error ? (
          <p>{error}</p>
        ) : products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
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
                    className="btn-wishlist"
                    disabled={wishlistStatus[product._id] === "loading" || wishlistStatus[product._id] === "added"}
                    onClick={() => handleAddToWishlist(product._id)}
                  >
                    {wishlistStatus[product._id] === "loading"
                      ? "⏳ Saving..."
                      : wishlistStatus[product._id] === "added"
                      ? "♥ Added to Wishlist"
                      : wishlistStatus[product._id] === "already"
                      ? "Already in Wishlist"
                      : wishlistStatus[product._id]
                      ? wishlistStatus[product._id]
                      : "♡ Add to Wishlist"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;

