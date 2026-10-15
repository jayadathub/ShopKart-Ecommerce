import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../axiosCalls/axios";

// User dashboard verifying session status and providing navigation to catalog
function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axiosInstance.get("/users/me");
      } catch (error) {
        navigate("/login");
        return;
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "lightgrey" }}>
        <p className="text-lg font-medium text-black">Checking session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "lightgrey" }}>
      <Navbar />

      <div className="home-page" style={{ backgroundColor: "lightgrey" }}>
        <div className="home-card">
          <h1 className="home-title">Welcome to ShopKart! 🛒</h1>

          <p className="home-subtitle">
            You have successfully logged in. Discover our new product catalog and find great deals.
          </p>

          <Link to="/products" className="home-button">
            Explore Product Catalog →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;