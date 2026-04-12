function Toast({ message, type = "success" }) {
  if (!message) return null;

  const baseClass =
    "fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-white font-medium transition";

  const typeClass =
    type === "success"
      ? "bg-green-600"
      : "bg-red-600";

  return (
    <div className={`${baseClass} ${typeClass}`}>
      {message}
    </div>
  );
}

export default Toast;