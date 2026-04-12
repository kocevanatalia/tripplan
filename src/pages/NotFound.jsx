import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

function NotFound() {
  const { darkMode } = useTheme();

  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold">404</h1>
      <p className={`mt-3 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
        Page not found.
      </p>
      <Link to="/" className="inline-block mt-6 text-blue-600 hover:underline">
        Go back home
      </Link>
    </div>
  );
}

export default NotFound;