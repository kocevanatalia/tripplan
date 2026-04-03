import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useTheme } from "../context/ThemeContext";

function Layout() {
  const { darkMode } = useTheme();

  return (
    <div className={darkMode ? "min-h-screen bg-gray-900 text-white" : "min-h-screen bg-gray-100 text-gray-900"}>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;