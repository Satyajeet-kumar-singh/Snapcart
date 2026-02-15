export default function UnAuthorized() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <h1 className="text-4xl font-bold text-red-600 mb-4">
        Access Denied 🚫
      </h1>

      <p className="text-gray-700 text-center mb-6">
        You do not have permission to access this page.
      </p>

      <a
        href="/login"
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        Go to Login
      </a>
    </div>
  );
}
