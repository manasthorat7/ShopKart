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
      <div className="navbar-brand">ShopKart</div>
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
}

export default Navbar;
