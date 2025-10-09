// Pages/RfidAttendancePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RfidAttendancePage() {
  const [inOutStatus, setInOutStatus] = useState(false); // false = IN, true = OUT
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null); // { name, photo, className, section, time, status }
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const rfidInputRef = useRef('');

  // Handle RFID input
  useEffect(() => {
    const handleKeyDown = async (e) => {
      if (e.key === 'Enter') {
        const rfid = rfidInputRef.current.trim();
        if (!rfid) return;

        setIsLoading(true);
        setError('');
        setSuccessData(null);

        try {
          // Step 1: Get student info by card
          const userRes = await fetch(`/api/attendance/card/${rfid}`);
          if (!userRes.ok) {
            throw new Error('Invalid RFID card');
          }
          const userData = await userRes.json();
          const { name, photoUrl, className, section } = userData;

          // Step 2: Mark attendance
          const status = inOutStatus ? 'OUT' : 'IN';
          const markRes = await fetch('/api/attendance/mark', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rfid, status }),
          });

          const markData = await markRes.json();
          if (!markRes.ok) {
            throw new Error(markData.error || 'Action not allowed');
          }

          // Format time for display
          const time = markData.checkInTime
            ? new Date(markData.checkInTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Now';

          // Show success screen
          setSuccessData({
            name,
            photo: photoUrl || '/src/assets/default-avatar.png',
            className,
            section,
            time,
            status,
          });

          // Auto-reset after 5 seconds
          setTimeout(() => {
            setSuccessData(null);
          }, 5000);
        } catch (err) {
          setError(err.message || 'Network error. Please try again.');
        } finally {
          rfidInputRef.current = '';
          setIsLoading(false);
        }
      } else if (/^[0-9]$/.test(e.key)) {
        rfidInputRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inOutStatus]);

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      {/* Back Button - Top Left */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-10 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-md text-base font-medium transition"
        aria-label="Go back"
      >
        ← Back
      </button>

      {/* Toggle Button - Top Center (Larger + Smooth Transition) */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex items-center bg-gray-800 rounded-full p-1.5">
          <button
            className={`px-6 py-2.5 text-base font-semibold rounded-full transition-colors duration-300 ease-in-out ${
              !inOutStatus
                ? 'bg-green-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
            onClick={() => setInOutStatus(false)}
            disabled={isLoading}
          >
            IN
          </button>
          <button
            className={`px-6 py-2.5 text-base font-semibold rounded-full transition-colors duration-300 ease-in-out ${
              inOutStatus
                ? 'bg-red-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
            onClick={() => setInOutStatus(true)}
            disabled={isLoading}
          >
            OUT
          </button>
        </div>
      </div>

      {/* Error Message - Below toggle */}
      {error && (
        <div className="absolute top-[72px] left-1/2 transform -translate-x-1/2 z-10 w-full max-w-xs sm:max-w-sm mt-2">
          <div className="text-center bg-red-900/85 backdrop-blur-sm text-red-100 px-4 py-2 rounded-lg text-sm font-medium">
            {error}
          </div>
        </div>
      )}

      {/* Main Content: Success Screen or Bouncing Card */}
      <div className="flex flex-col items-center justify-center min-h-screen pt-16 pb-8 px-4">
        {successData ? (
          // ✅ Success Screen
          <div className="text-center animate-fade-in">
            <img
              src={successData.photo}
              alt={successData.name}
              className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-2 border-green-500"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM2Qjc4OEEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjgiIHI9IjQiLz48cGF0aCBkPSJNNS4zIDE0LjNoMTMuNGEyIDIgMCAwIDAgMC00SDUuM2EyIDIgMCAwIDAgMC00Ii8+PHBhdGggZD0iTTUuMyAxOGgxMy40YTIgMiAwIDAgMCAwLTRINy4zIi8+PC9zdmc+';
              }}
            />
            <h2 className="text-2xl font-bold text-green-400">
              Welcome, {successData.name}!
            </h2>
            <p className="text-gray-300 mt-1">
              {successData.className} • Section {successData.section}
            </p>
            <p className="mt-3 text-lg">
              {successData.status === 'IN' ? '_Checked In_' : '_Checked Out_'} at{' '}
              <span className="font-mono text-green-300">{successData.time}</span>
            </p>
          </div>
        ) : (
          // 🔄 Bouncing RFID Card (or loading)
          !isLoading && (
            <div className="animate-bounce">
              <img
                src="/src/assets/rfid.png"
                alt="RFID Card"
                className="w-28 h-28 sm:w-32 sm:h-32 object-contain"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM2Qjc4OEEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjEgMTJhOSA5IDAgMTEtNi4yMTktOC43OG0wIDBoMCIvPjxwYXRoIGQ9Ik0xMiAzbTAgMGgtLjAxTTkgN2gydjJoLTJWN20tNCA0aDJ2MmgtMlYxMW04LTRoMnYyaC0yVjdNOTIuNSA5LjVoMU0xNSAxMmgydjJoLTJ2LTJtLTYgNmgydjJoLTJ2LTJtLTQtNGgydjJoLTJ2LTJtOCAwaDJ2MmgtMlYxNW0tOCA0YTIgMiAwIDAgMCAwLTRtLTggNGEyIDIgMCAwIDAgMC00Ii8+PC9zdmc+';
                }}
              />
            </div>
          )
        )}

        {/* Optional: Show loading state */}
        {isLoading && (
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-gray-400">Processing...</p>
          </div>
        )}
      </div>

      {/* Hidden input for RFID */}
      <input
        type="text"
        className="absolute opacity-0 pointer-events-none"
        ref={rfidInputRef}
        onChange={() => {}}
      />
    </div>
  );
}