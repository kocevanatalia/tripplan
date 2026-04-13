import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.log(err);
    }
  };

  const navBg = darkMode
    ? "bg-gray-900/90 border-b border-gray-800 text-white"
    : "bg-white/90 border-b border-gray-200 text-gray-900";

  const logoText = darkMode ? "text-blue-400" : "text-blue-600";

  const secondaryBtn = darkMode
    ? "px-4 py-2 rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700 transition"
    : "px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 transition";

  const primaryBtn =
    "px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm";

  const logoTarget = user ? "/dashboard" : "/";

  return (
    <nav className={`sticky top-0 z-50 backdrop-blur ${navBg}`}>
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          to={logoTarget}
          className="text-2xl font-extrabold tracking-tight flex items-center gap-2"
        >
          <span className="text-2xl">✈️</span>
          <span className={logoText}>TripPlan</span>
        </Link>

        <div className="flex items-center gap-3">
          <button onClick={toggleDarkMode} className={secondaryBtn}>
            {darkMode ? "Light" : "Dark"}
          </button>

          {user ? (
            <>
              <Link to="/dashboard" className={secondaryBtn}>
                My Trips
              </Link>
              <button onClick={handleLogout} className={primaryBtn}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={secondaryBtn}>
                Login
              </Link>
              <Link to="/signup" className={primaryBtn}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;