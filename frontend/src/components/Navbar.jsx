import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/customers/logout");
      navigate("/login");
    } catch (err) {
      console.log(err);
      navigate("/login");
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand" style={{ cursor: "pointer" }} onClick={() => navigate("/products")}>
        ShopKart
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <span style={{ color: "#fff", cursor: "pointer" }} onClick={() => navigate("/wishlist")}>
          Wishlist
        </span>
        <span
          style={{ color: "#fff", cursor: "pointer", fontSize: "20px" }}
          title="Profile"
          onClick={() => navigate("/home")}
        >
          👤
        </span>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
