import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

function Home() {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await api.get("/customers/me");
        setCustomer(response.data);
      } catch (err) {
        console.log(err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [navigate]);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="home-container">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div>
      <Navbar />
      <div className="home-container">
        <div className="profile-card">
          <h2>Welcome to ShopKart, {customer.fullName}!</h2>
          <p className="home-subtitle">Customer Profile Details</p>

          <div className="profile-details">
            <div className="detail-row">
              <strong>Full Name:</strong> <span>{customer.fullName}</span>
            </div>
            <div className="detail-row">
              <strong>Email:</strong> <span>{customer.email}</span>
            </div>
            <div className="detail-row">
              <strong>Phone Number:</strong> <span>{customer.phone}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
