// Pages/RfidAttendancePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RfidAttendancePage() {
  const [manualMode, setManualMode] = useState(false);
  const [inOutStatus, setInOutStatus] = useState(false); // false = IN, true = OUT
  const [currentTime, setCurrentTime] = useState(new Date().toTimeString().slice(0, 5));
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isActiveDay, setIsActiveDay] = useState(true);
  const [dayName, setDayName] = useState('');
  const [allowedClasses, setAllowedClasses] = useState({ in: [], out: [] });
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const navigate = useNavigate();
  const rfidInputRef = useRef('');

  // Mock student data
  const mockStudents = {
    '0007924833': {
      id: 1,
      name: 'Aarav Sharma',
      roll: '15',
      class: 'XII',
      section: 'A',
      rfid: '0007924833',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      inTime: '08:15 AM',
      outTime: '02:30 PM'
    },
    '1234567890': {
      id: 2,
      name: 'Priya Patel',
      roll: '22',
      class: 'XI',
      section: 'B',
      rfid: '00',
      photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      inTime: '08:20 AM',
      outTime: '02:25 PM'
    },
    '9876543210': {
      id: 3,
      name: 'Rahul Kumar',
      roll: '08',
      class: 'X',
      section: 'C',
      rfid: '9876543210',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      inTime: '08:10 AM',
      outTime: '02:35 PM'
    }
  };

  // Format day name
  useEffect(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    setDayName(days[currentDate.getDay()]);
  }, [currentDate]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toTimeString().slice(0, 5));
      setCurrentDate(now);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load allowed classes for today
  useEffect(() => {
    const fetchAllowedClasses = async () => {
      try {
        // Mock allowed classes - all classes allowed for testing
        setAllowedClasses({
          in: ['X', 'XI', 'XII', 'IX', 'VIII'],
          out: ['X', 'XI', 'XII', 'IX', 'VIII']
        });
      } catch (err) {
        console.error('Failed to load allowed classes', err);
        setAllowedClasses({ in: [], out: [] });
      }
    };

    fetchAllowedClasses();
  }, [currentDate]);

  // Handle RFID input
  useEffect(() => {
    const handleKeyDown = async (e) => {
      if (e.key === 'Enter') {
        const rfid = rfidInputRef.current.trim();
        if (!rfid) return;

        setIsLoading(true);
        setStudentData(null);
        setError('');
        setShowPopup(false);

        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 800));

          // Check if RFID exists in mock data
          const student = mockStudents[rfid];

          if (!student) {
            throw new Error('Student not found');
          }

          // Check if student's class is allowed
          let isAllowed = false;
          let status = '';

          if (manualMode) {
            status = inOutStatus ? 'OUT' : 'IN';
            const allowedList = inOutStatus ? allowedClasses.out : allowedClasses.in;
            isAllowed = allowedList.includes(student.class);
          } else {
            // Auto mode: decide based on time
            const nowHour = new Date().getHours();
            if (nowHour < 12) {
              isAllowed = allowedClasses.in.includes(student.class);
              status = 'IN';
            } else {
              isAllowed = allowedClasses.out.includes(student.class);
              status = 'OUT';
            }
          }

          if (isAllowed) {
            const currentTime = new Date().toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            });
            
            setStudentData({
              ...student,
              status,
              timestamp: currentTime,
              message: status === 'IN' 
                ? 'Welcome to school! Have a great day.' 
                : 'See you tomorrow! Stay safe.'
            });
            
            // Show popup with animation
            setTimeout(() => setShowPopup(true), 100);
            
          } else {
            setError(`Class ${student.class} not allowed for ${status} at this time.`);
          }
        } catch (err) {
          console.error('Scan error:', err);
          setError('Invalid card or student not found');
        } finally {
          setIsLoading(false);
          rfidInputRef.current = '';
        }
      } else if (/^[0-9]$/.test(e.key)) {
        rfidInputRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [manualMode, inOutStatus, allowedClasses]);

  // Close student popup
  const closePopup = () => {
    setShowPopup(false);
    setTimeout(() => setStudentData(null), 300);
  };

  // Toggle manual mode
  const toggleManualMode = () => setManualMode(!manualMode);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
        >
          ← Back
        </button>

        <div className="flex items-center">
          <span className="mr-2 text-gray-300">{manualMode ? 'Manual' : 'Auto'}</span>
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

      {/* Auto Mode: Show allowed classes */}
      {!manualMode && (
        <div className="flex justify-center mt-4">
          <div className="bg-gray-800 rounded-lg p-4 flex space-x-6">
            <div className="flex items-center">
              <span className="mr-2 text-green-500 font-medium">IN:</span>
              <div className="flex space-x-2">
                {allowedClasses.in.length > 0 ? (
                  allowedClasses.in.map((cls) => (
                    <span key={cls} className="bg-green-900 text-green-300 px-2 py-1 rounded text-sm">
                      {cls}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">None</span>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <span className="mr-2 text-red-500 font-medium">OUT:</span>
              <div className="flex space-x-2">
                {allowedClasses.out.length > 0 ? (
                  allowedClasses.out.map((cls) => (
                    <span key={cls} className="bg-red-900 text-red-300 px-2 py-1 rounded text-sm">
                      {cls}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">None</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Mode: IN/OUT toggle */}
      {manualMode && (
        <div className="flex justify-center mt-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 font-medium">Status:</span>
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

      {/* Main RFID Area */}
      <main className="flex-grow flex items-center justify-center relative">
        {error && (
          <div className="absolute top-4 bg-red-900 text-red-200 px-4 py-2 rounded-lg animate-pulse">
            {error}
          </div>
        )}

        <div className="animate-bounce">
          <img
            src="/src/assets/rfid.png"
            alt="RFID Scanner"
            className="w-32 h-32 object-contain"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM2Qjc4OEEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjEgMTJhOSA5IDAgMTEtNi4yMTktOC43OG0wIDBoMCIvPjxwYXRoIGQ9Ik0xMiAzbTAgMGgtLjAxTTkgN2gydjJoLTJWN20tNCA0aDJ2MmgtMlYxMW04LTRoMnYyaC0yVjdNOTIuNSA5LjVoMU0xNSAxMmgydjJoLTJ2LTJtLTYgNmgydjJoLTJ2LTJtLTQtNGgydjJoLTJ2LTJtOCAwaDJ2MmgtMlYxNW0tOCA0YTIgMiAwIDAgMCAwLTRtLTggNGEyIDIgMCAwIDAgMC00Ii8+PC9zdmc+';
            }}
          />
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-2"></div>
              <p>Verifying RFID...</p>
            </div>
          </div>
        )}
      </main>

      {/* Student Popup Card with Animation */}
      {studentData && (
        <div className={`fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${showPopup ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-700 shadow-2xl transform transition-all duration-500 ${showPopup ? 'scale-100 translate-y-0 opacity-100' : 'scale-75 translate-y-10 opacity-0'}`}>
            
            {/* Header with close button */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${studentData.status === 'IN' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <h3 className="text-lg font-semibold text-white">Attendance Recorded</h3>
              </div>
              <button
                onClick={closePopup}
                className="text-gray-400 hover:text-white text-xl transition-colors"
              >
                &times;
              </button>
            </div>

            {/* Student Info Card */}
            <div className="bg-gray-700/50 rounded-xl p-4 mb-4 border border-gray-600">
              <div className="flex items-center space-x-4">
                <img
                  src={studentData.photo}
                  alt={studentData.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NjYyI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMThjLTQuNDEgMC04LTMuNTktOC04czMuNTktOCA4LTggOC40MSAzLjU5IDguNDEgOCA4LTMuNTkgOC04cy0zLjU5LTgtOC04eiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iOC41IiByPSIxLjUiLz48cGF0aCBkPSJNMTIgMTNjLTEuNjYgMC0zIC0xLjI1LTMgLTIuNSAwIC0uMzguMTMtLjcuMzUtLjkyLjIzLS4yMy41Mi0uMzguODUtLjM4LjMyIDAgLjYxLjE1Ljg1LjM4LjIyLjIyLjM1LjU0LjM1LjkyIDAgMS4yNS0xLjM0IDIuNS0zIDIuNXoiLz48L3N2Zz4=';
                  }}
                />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-1">{studentData.name}</h2>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <div className="text-gray-300">Roll: <span className="text-white font-medium">{studentData.roll}</span></div>
                    <div className="text-gray-300">RFID: <span className="text-white font-mono font-medium">{studentData.rfid}</span></div>
                    <div className="text-gray-300">Class: <span className="text-white font-medium">{studentData.class}</span></div>
                    <div className="text-gray-300">Section: <span className="text-white font-medium">{studentData.section}</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Information */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                <div className="text-gray-400 text-sm mb-1">In Time</div>
                <div className="text-green-400 font-bold text-lg">{studentData.inTime}</div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                <div className="text-gray-400 text-sm mb-1">Out Time</div>
                <div className="text-red-400 font-bold text-lg">{studentData.outTime}</div>
              </div>
            </div>

            {/* Current Status */}
            <div className="bg-gray-700/30 rounded-lg p-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Current Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${studentData.status === 'IN' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                  {studentData.status} - {studentData.timestamp}
                </span>
              </div>
            </div>

            {/* Message */}
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-3 text-center">
              <div className="text-blue-300 text-sm font-medium">
                {studentData.message}
              </div>
            </div>

            {/* Success Animation */}
            <div className="flex justify-center mt-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-white text-lg">✓</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="p-2 text-center text-gray-500 text-sm">
        {currentDate.toLocaleDateString()} • {dayName} • {currentTime}
      </footer>

      {/* Hidden input for RFID capture */}
      <input
        type="text"
        className="absolute opacity-0 pointer-events-none"
        placeholder="RFID input"
        ref={rfidInputRef}
        onChange={() => {}}
      />
    </div>
  );
}