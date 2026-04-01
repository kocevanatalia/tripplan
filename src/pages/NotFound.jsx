import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-3 text-gray-600">Page not found.</p>
      <Link to="/" className="inline-block mt-6 text-blue-600 hover:underline">
        Go back home
      </Link>
    </div>
  );
}

export default NotFound;