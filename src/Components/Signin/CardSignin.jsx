// src/Components/Signin/CardSignin.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CardSignin = ({ onSigninComplete }) => {
  const [cardId, setCardId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const navigate = useNavigate();

  // ✅ Focus on input when mounted
  useEffect(() => {
    const inputElement = document.getElementById("card-scanner");
    if (inputElement) inputElement.focus();
  }, []);

  const validateCardId = (cardId) => /^[a-zA-Z0-9]{10}$/.test(cardId);

  // ✅ Automatically sign in when 10 chars entered
  const handleCardInput = (e) => {
    const inputValue = e.target.value;
    setCardId(inputValue);
    if (inputValue.length === 10) handleSignin(inputValue);
  };

  const handleSignin = async (cardIdToUse = cardId) => {
    if (!cardIdToUse.trim()) return setError("Please scan a card");
    if (!validateCardId(cardIdToUse)) {
      setError("Please scan a valid 10-character card");
      setCardId("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = { cardId: cardIdToUse };
      console.log("Payload being sent:", payload);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/card-login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // ✅ allow refresh cookie
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid card ID");
        setCardId("");
        return;
      }

      // ✅ Store access token securely (in memory or session)
      const token = data.accessToken;
      if (token) {
        setAccessToken(token);
        sessionStorage.setItem("accessToken", token);
        console.log("Access Token:", token);
      }

      if (onSigninComplete) onSigninComplete(data.user);
      navigate("/attendance");
    } catch (err) {
      console.error("Sign-in error:", err);
      setError("Unable to connect to server. Please try again.");
      setCardId("");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Example: Protected API call using Bearer + auto refresh
  const fetchProtectedData = async () => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) {
      console.warn("No access token found — please log in again.");
      return;
    }

    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/protected`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include", // ✅ sends refresh cookie if needed
    });

    if (res.status === 401) {
      // Access token expired — try refresh
      console.log("Access token expired, refreshing...");
      const refreshRes = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
        {
          method: "POST",
          credentials: "include", // browser sends refresh cookie automatically
        }
      );

      if (refreshRes.ok) {
        const { accessToken: newToken } = await refreshRes.json();
        sessionStorage.setItem("accessToken", newToken);
        setAccessToken(newToken);
        console.log("🔄 Token refreshed!");
      } else {
        console.warn("Refresh failed — please sign in again.");
        navigate("/signin");
      }
      return;
    }

    const data = await res.json();
    console.log("Protected data:", data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 px-4">
      <div className="w-full max-w-lg">
        <div className="bg-black bg-opacity-80 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-800 p-10">
          {/* Hidden input for card scanning */}
          <input
            type="text"
            id="card-scanner"
            value={cardId}
            onChange={handleCardInput}
            className="absolute opacity-0 w-0 h-0"
            maxLength={10}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck="false"
          />

          <div className="text-center mb-8">
            <div className="mx-auto bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mb-6">
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
            <h2 className="text-3xl font-bold text-white mb-4">
              Welcome to Attendance Manager
            </h2>
            <p className="text-2xl text-gray-300 mb-1">
              Tap your access card to sign in
            </p>
            <p className="text-lg text-gray-400">
              Hold your card near the device
            </p>
          </div>

          <div className="flex justify-center my-12">
            <img
              src="/src/assets/rfid.png"
              alt="RFID Scanner"
              className="w-32 h-32 object-contain animate-bounce"
            />
          </div>

          {error && (
            <div className="bg-red-900 bg-opacity-50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm flex items-center justify-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}

          {loading && (
            <div className="flex justify-center mb-6">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          <div className="mt-12 text-center">
            <p className="text-gray-400 mb-2">Having trouble with card scan?</p>
            <button
              onClick={() => navigate("/signin")}
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors text-lg"
            >
              Sign in with Phone/Email
            </button>
          </div>

          {accessToken && (
            <div className="mt-4 text-center">
              <p className="text-green-400 text-sm mb-2">
                Access token active!
              </p>
              <button
                onClick={fetchProtectedData}
                className="text-blue-400 hover:underline text-sm"
              >
                Test Protected API
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardSignin;
