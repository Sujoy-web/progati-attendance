// src/Components/Signin/Signin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signin = ({ onSigninComplete }) => {
  const [loginType, setLoginType] = useState("email");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phoneNumber) => /^[0-9]{10}$/.test(phoneNumber);

const handleSignin = async (e) => {
  e.preventDefault();

  // --- Basic validation ---
  if (!identifier.trim()) {
    return setError(`Please enter your ${loginType}`);
  }
  if (loginType === "phone" && !validatePhone(identifier)) {
    return setError("Please enter a valid 10-digit phone number");
  }
  if (loginType === "email" && !validateEmail(identifier)) {
    return setError("Please enter a valid email address");
  }
  if (!password) {
    return setError("Please enter your password");
  }

  setLoading(true);
  setError("");

  try {
    // --- Prepare payload ---
    const payload = { [loginType]: identifier, password };
    console.log("Payload being sent:", payload); // ✅ log the payload

    // --- Send POST request ---
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // NOTE: Removed credentials: "include" for login to fix CORS
        // Login typically returns JWT in response body, not in cookies
        body: JSON.stringify(payload),
      }
    );

    // --- Parse response ---
    const data = await response.json();
    console.log("Response from server:", data); // ✅ log server response

    // --- Handle errors ---
    if (!response.ok) {
      setError(data.message || `Invalid ${loginType} or password`);
      return;
    }

    // --- Store access token temporarily ---
    setAccessToken(data.accessToken);
    sessionStorage.setItem("accessToken", data.accessToken);
    console.log("Access Token stored:", data.accessToken);
    
    // --- Store refresh token if provided in response ---
    if (data.refreshToken) {
      sessionStorage.setItem("refreshToken", data.refreshToken);
      console.log("Refresh Token stored");
    }

    // --- Optional callback ---
    if (onSigninComplete) onSigninComplete(data.user);

    // --- Navigate on success ---
    navigate("/attendance");
  } catch (err) {
    console.error("Sign-in error:", err);
    setError("Unable to connect to server. Please try again.");
  } finally {
    setLoading(false);
  }
};

  // ✅ Example of making secure API calls with Bearer header
  const fetchProtectedData = async () => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) {
      console.warn("No access token found — please log in again.");
      return;
    }

    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/protected`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // ✅ send bearer token
      },
    });

    if (res.status === 401) {
      // 🔁 token expired — try to refresh it
      console.log("Access token expired, refreshing...");
      // Try to get refresh token from wherever it's stored (could be in localStorage, sessionStorage, or cookie)
      const refreshToken = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");
      
      if (!refreshToken) {
        console.warn("No refresh token found, please log in again.");
        navigate("/signin");
        return;
      }
      
      const refreshRes = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${refreshToken}`, // send refresh token in header
          },
        }
      );

      if (refreshRes.ok) {
        const { accessToken: newToken } = await refreshRes.json();
        sessionStorage.setItem("accessToken", newToken);
        setAccessToken(newToken);
        console.log("🔄 Access token refreshed successfully!");
      } else {
        console.warn("Failed to refresh token, please log in again.");
        navigate("/signin");
      }
      return;
    }

    const data = await res.json();
    console.log("Protected data:", data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-black bg-opacity-80 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-800 p-8">
          <div className="text-center mb-8">
            <div className="mx-auto bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-400">Sign in to your account</p>
          </div>

          <form onSubmit={handleSignin} className="space-y-6">
            {/* Phone / Email toggle buttons */}
            <div>
              <div className="flex space-x-4 mb-2">
                <button
                  type="button"
                  onClick={() => setLoginType("phone")}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    loginType === "phone"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  Phone
                </button>
                <button
                  type="button"
                  onClick={() => setLoginType("email")}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    loginType === "email"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  Email
                </button>
              </div>

              {/* Input field */}
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {loginType === "phone" ? "Phone Number" : "Email Address"}
              </label>

              {loginType === "phone" ? (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-400">+91</span>
                  </div>
                  <input
                    type="tel"
                    value={identifier}
                    onChange={(e) =>
                      setIdentifier(
                        e.target.value.replace(/\D/g, "").slice(0, 10)
                      )
                    }
                    placeholder="Enter your 10-digit phone number"
                    className="w-full pl-12 pr-3 py-3 border border-gray-700 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={10}
                  />
                </div>
              ) : (
                <input
                  type="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-3 py-3 border border-gray-700 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>

            {/* Password input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3 py-3 pr-10 border border-gray-700 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-900 bg-opacity-50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-all ${
                  loading
                    ? "bg-gray-700 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                }`}
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </div>

            {accessToken && (
              <div className="mt-4">
                <p className="text-green-400 text-sm">Access token active!</p>
                <button
                  type="button"
                  onClick={fetchProtectedData}
                  className="text-blue-400 hover:underline text-sm"
                >
                  Fetch Protected Data
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signin;
