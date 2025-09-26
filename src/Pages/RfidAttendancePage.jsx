// Pages/RfidAttendancePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RfidAttendancePage() {
  const [manualMode, setManualMode] = useState(false);
  const [inOutStatus, setInOutStatus] = useState(false); // false for IN, true for OUT
  const [allowedClasses, setAllowedClasses] = useState({
    in: ['1', '2', '3'],
    out: ['4']
  });
  const [currentTime, setCurrentTime] = useState(new Date().toTimeString().slice(0, 5));
  const navigate = useNavigate();
  const rfidInputRef = useRef('');

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toTimeString().slice(0, 5));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Global RFID input capture
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        if (rfidInputRef.current) {
          // Process RFID scan here
          if (manualMode) {
            // In manual mode, use the selected IN/OUT status
            const status = inOutStatus ? 'OUT' : 'IN';
            console.log(`RFID scanned: ${rfidInputRef.current}, Status: ${status}`);
            // Here you would typically call your attendance API
          } else {
            // In auto mode, determine status based on allowed classes
            console.log('RFID scanned:', rfidInputRef.current);
            // You could add logic here to determine if it's IN or OUT based on allowed classes
          }
          rfidInputRef.current = '';
        }
      } else if (/^[0-9]$/.test(e.key)) {
        rfidInputRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [manualMode, inOutStatus]);

  // Toggle manual mode
  const toggleManualMode = () => {
    setManualMode(!manualMode);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
        >
          ← Back
        </button>
        
        {/* Mode Toggle */}
        <div className="flex items-center">
          <span className="mr-2 text-gray-300">
            {manualMode ? 'Manual' : 'Auto'}
          </span>
          <button
            onClick={toggleManualMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              manualMode ? 'bg-blue-600' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                manualMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </header>

      {/* Auto Focus Mode - Allowed Classes */}
      {!manualMode && (
        <div className="flex justify-center mt-4">
          <div className="bg-gray-800 rounded-lg p-4 flex space-x-6">
            {/* Allow Classes for Entry (IN) */}
            <div className="flex items-center">
              <span className="mr-2 text-green-500 font-medium">IN:</span>
              <div className="flex space-x-2">
                {allowedClasses.in.map((cls) => (
                  <span key={cls} className="bg-green-900 text-green-300 px-2 py-1 rounded text-sm">
                    {cls}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Allow Classes for Exit (OUT) */}
            <div className="flex items-center">
              <span className="mr-2 text-red-500 font-medium">OUT:</span>
              <div className="flex space-x-2">
                {allowedClasses.out.map((cls) => (
                  <span key={cls} className="bg-red-900 text-red-300 px-2 py-1 rounded text-sm">
                    {cls}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Mode - In/Out Toggle */}
      {manualMode && (
        <div className="flex justify-center mt-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 font-medium">Status:</span>
              
              {/* In/Out Toggle */}
              <div className="flex items-center bg-gray-700 rounded-full p-1">
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    !inOutStatus ? 'bg-green-600 text-white' : 'bg-transparent text-gray-300'
                  }`}
                  onClick={() => setInOutStatus(false)}
                >
                  IN
                </button>
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    inOutStatus ? 'bg-red-600 text-white' : 'bg-transparent text-gray-300'
                  }`}
                  onClick={() => setInOutStatus(true)}
                >
                  OUT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center">
        {/* Bouncing RFID Image */}
        <div className="animate-bounce">
          <img 
            src="/src/assets/rfid.png" 
            alt="RFID Scanner" 
            className="w-32 h-32 object-contain"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM2Qjc4OEEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjEgMTJhOSA5IDAgMTEtNi4yMTktOC43OG0wIDBoMCIvPjxwYXRoIGQ9Ik0xMiAzbTAgMGgtLjAxTTkgN2gydjJoLTJWN20tNCA0aDJ2MmgtMlYxMW04LTRoMnYyaC0yVjdNOTIuNSA5LjVoMU0xNSAxMmgydjJoLTJ2LTJtLTYgNmgydjJoLTJ2LTJtLTQtNGgydjJoLTJ2LTJtOCAwaDJ2MmgtMlYxNW0tOCA0aDJ2MmgtMnYtMm0tNCAwaDJ2MmgtMnYtMm0xMiAwYTIgMiAwIDAgMCAwLTRtLTggNGEyIDIgMCAwIDAgMC00bTQgMGEyIDIgMCAwIDAgMC00bS04IDBhMiAyIDAgMCAwIDAtNG0xMiA4YTIgMiAwIDAgMCAwLTRtLTggNGEyIDIgMCAwIDAgMC00Ii8+PC9zdmc+';
            }}
          />
        </div>
      </main>

      {/* Footer with current time */}
      <footer className="p-2 text-center text-gray-500 text-sm">
        {currentTime}
      </footer>
    </div>
  );
}