// src/Pages/RfidAttendancePage.jsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ManualRfidAttendancePage() {
  const [inOutStatus, setInOutStatus] = useState(false); // false = IN, true = OUT
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const rfidInputRef = useRef(null);

  // 🔐 Get access token directly from storage
  const getAccessToken = () => {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || 'mock-jwt-token';
  };

  // 🔐 Direct API call with auth header
  const markAttendance = useCallback(async (cardValue, statusValue) => {
    const token = getAccessToken();
    const baseURL = import.meta.env.VITE_API_BASE_URL?.trim() || 'http://localhost:3000/api';
    
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const payload = {
      card: cardValue,
      status: statusValue
    };

    console.log('Sending payload:', payload);
    console.log('Using token:', token ? `${token.substring(0, 10)}...` : 'No token');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${baseURL}/attendance/mark`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMsg = `HTTP ${response.status}`;
        try {
          const errData = await response.json();
          errorMsg = errData.detail?.[0]?.msg || errData.error || errorMsg;
        } catch (e) {
          // fallback
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }, []);

  // Manual test button handler
  const handleManualTest = async () => {
    const cardValue = '7395821648'; // 10-digit format to match scanned cards
    const statusValue = inOutStatus ? 'Check_OUT' : 'Check_IN';
    
    setIsLoading(true);
    setError('');
    setSuccessData(null);

    try {
      const data = await markAttendance(cardValue, statusValue);
      console.log('Response from server:', data);

      setSuccessData({
        card: data.card,
        status: data.status,
        id: data.id,
        time: new Date(data.time).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        ip_address: data.ip_address,
        user_type: data.user_type,
      });

      setTimeout(() => setSuccessData(null), 5000);
    } catch (err) {
      setError(err.message || 'Failed to mark attendance. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle RFID input via keyboard
  useEffect(() => {
    const handleKeyDown = async (e) => {
      // Ensure ref is valid
      if (!rfidInputRef.current) return;

      if (e.key === 'Enter') {
        const card = rfidInputRef.current.value.trim();
        if (!card) return;

        setIsLoading(true);
        setError('');
        setSuccessData(null);

        // Format card as 10-digit string to match AssignPage.jsx behavior
        let cardValue = card;
        if (/^\d+$/.test(card)) {
          // Pad to 10 digits if numeric
          if (card.length < 10) {
            cardValue = card.padStart(10, '0');
          }
        }
        const statusValue = inOutStatus ? 'Check_OUT' : 'Check_IN';

        try {
          const data = await markAttendance(cardValue, statusValue);
          console.log('Response from server:', data);

          setSuccessData({
            card: data.card,
            status: data.status,
            id: data.id,
            time: new Date(data.time).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            ip_address: data.ip_address,
            user_type: data.user_type,
          });

          setTimeout(() => setSuccessData(null), 5000);
        } catch (err) {
          setError(err.message || 'Failed to mark attendance. Please try again.');
        } finally {
          if (rfidInputRef.current) {
            rfidInputRef.current.value = '';
          }
          setIsLoading(false);
        }
      } else if (/^[0-9]$/.test(e.key)) {
        rfidInputRef.current.value += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inOutStatus, markAttendance]);

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-10 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-md text-base font-medium transition"
      >
        ← Back
      </button>

      {/* Toggle IN/OUT */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex items-center bg-gray-800 rounded-full p-1.5">
          <button
            className={`px-6 py-2.5 text-base font-semibold rounded-full transition-colors duration-300 ease-in-out ${
              !inOutStatus ? 'bg-green-600 text-white' : 'text-gray-300 hover:text-white'
            }`}
            onClick={() => setInOutStatus(false)}
            disabled={isLoading}
          >
            IN
          </button>
          <button
            className={`px-6 py-2.5 text-base font-semibold rounded-full transition-colors duration-300 ease-in-out ${
              inOutStatus ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white'
            }`}
            onClick={() => setInOutStatus(true)}
            disabled={isLoading}
          >
            OUT
          </button>
        </div>
      </div>

      {/* Manual Test Button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleManualTest}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white px-4 py-2 rounded-md text-base font-medium transition"
        >
          Test Card 7395821648
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="absolute top-[72px] left-1/2 transform -translate-x-1/2 z-10 w-full max-w-xs sm:max-w-sm mt-2">
          <div className="text-center bg-red-900/85 backdrop-blur-sm text-red-100 px-4 py-2 rounded-lg text-sm font-medium">
            {error}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen pt-16 pb-8 px-4">
        {successData ? (
          <div className="text-center animate-fade-in">
            <h2 className="text-2xl font-bold text-green-400">Card: {successData.card}</h2>
            <p className="mt-2">Status: {successData.status}</p>
            <p className="mt-1 text-gray-300">ID: {successData.id}</p>
            <p className="mt-1 text-gray-300">Time: {successData.time}</p>
            <p className="mt-1 text-gray-300">IP: {successData.ip_address}</p>
            <p className="mt-1 text-gray-300">User Type: {successData.user_type}</p>
          </div>
        ) : (
          !isLoading && (
            <div className="animate-bounce">
              <img
                src="/src/assets/rfid.png"
                alt="RFID Card"
                className="w-28 h-28 sm:w-32 sm:h-32 object-contain"
              />
            </div>
          )
        )}

        {isLoading && (
          <div className="text-center mt-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
            <p className="mt-2 text-gray-400">Processing...</p>
          </div>
        )}
      </div>

      {/* Hidden input to capture RFID keystrokes */}
      <input
        type="text"
        className="absolute opacity-0 pointer-events-none"
        ref={rfidInputRef}
        readOnly={false} // must be writable
      />
    </div>
  );
}