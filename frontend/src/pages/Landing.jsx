import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Root landing page that immediately redirects visitors to the login view
function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/login");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <p className="text-lg">Redirecting to login...</p>
    </div>
  );
}

export default Landing;