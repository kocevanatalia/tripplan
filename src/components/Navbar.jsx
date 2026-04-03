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

  return (
    <nav className={`border-b ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"}`}>
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-blue-600">
          TripPlan
        </Link>

        <div className="flex gap-4 items-center">
          <button
            onClick={toggleDarkMode}
            className={`px-3 py-1 rounded-lg border ${
              darkMode
                ? "border-gray-600 text-white hover:bg-gray-700"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>

          {user ? (
            <>
              <Link to="/dashboard" className="hover:underline">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="hover:underline">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">
                Login
              </Link>
              <Link to="/signup" className="hover:underline">
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