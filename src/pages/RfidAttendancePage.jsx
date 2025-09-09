// pages/RfidAttendancePage.jsx
import { useState, useEffect, useRef } from "react";
import { FaCheckCircle, FaSignOutAlt, FaIdCard, FaSpinner } from "react-icons/fa";

export default function RfidAttendancePage() {
  const [rfid, setRfid] = useState("");
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const [mode, setMode] = useState("in");

  useEffect(() => {
    inputRef.current?.focus();
  }, [attendance, mode]);

  const handleScan = async (e) => {
    if (e.key !== "Enter" || !rfid.trim()) return;

    setLoading(true);
    setAttendance(null);

    try {
      // 🔹 Prepare payload
      const payload = {
        rfid: rfid.trim(),
        status: mode, // "in" or "out"
      };

      console.log("📤 Sending payload:", payload);

      // 🔹 POST request to backend
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("📥 Server response:", result);

      if (!response.ok || !result.success) {
        setAttendance({ success: false, message: result.message || "RFID not recognized" });
      } else {
        setAttendance({
          success: true,
          student: result.student, // { name, roll, class, section, img }
          status: result.status,   // "in" | "out"
          time: new Date().toISOString(),
          message: result.message,
        });
      }
    } catch (err) {
      console.error("❌ Network error:", err);
      setAttendance({ success: false, message: "Network error" });
    } finally {
      setLoading(false);
      setRfid("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const renderCard = () => {
    if (!attendance) return null;
    if (!attendance.success) {
      return (
        <div className="absolute top-6 z-50 bg-red-500 p-6 rounded text-white shadow-lg">
          {attendance.message}
        </div>
      );
    }

    const { student, status, time, message } = attendance;
    const dateStr = new Date(time).toLocaleString();
    const icon =
      status === "out" ? (
        <FaSignOutAlt className="text-blue-600 text-3xl" />
      ) : (
        <FaCheckCircle className="text-green-600 text-3xl" />
      );
    const cardColor = status === "out" ? "border-blue-500" : "border-green-500";

    return (
      <div
        className={`absolute top-6 z-50 bg-white p-6 rounded-2xl shadow-lg border ${cardColor} max-w-xl mx-auto animate-fade-in`}
      >
        <div className="flex items-center gap-4">
          {/* Student Image */}
          {student.img && (
            <img
              src={student.img}
              alt={student.name}
              className="w-16 h-16 rounded-full object-cover border"
            />
          )}

          <div>
            <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
            <p className="text-gray-500 text-sm">
              Roll: {student.roll} | Class: {student.class} | Sec: {student.section}
            </p>
            <p className="text-gray-500 text-xs">{dateStr}</p>
          </div>
          <div className="ml-auto">{icon}</div>
        </div>
        <div className="mt-2 text-lg font-semibold text-gray-800">{message}</div>
      </div>
    );
  };

  // Auto hide card
  useEffect(() => {
    if (attendance) {
      const timer = setTimeout(() => setAttendance(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [attendance]);

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 to-gray-700 p-6 relative">
      {loading && (
        <div className="absolute top-6 z-50 flex flex-col items-center bg-white p-4 rounded shadow">
          <FaSpinner className="animate-spin text-blue-600 text-3xl" />
          <p>Processing...</p>
        </div>
      )}
      {renderCard()}

      {/* Mode toggle */}
      <div className="absolute top-4 right-6">
        <button
          onClick={() => setMode((prev) => (prev === "in" ? "out" : "in"))}
          className={`px-4 py-2 rounded-lg font-semibold ${
            mode === "in" ? "bg-green-600" : "bg-red-600"
          } text-white`}
        >
          Mode: {mode.toUpperCase()}
        </button>
      </div>

      {/* RFID Input */}
      <div className="w-full max-w-lg mb-6 flex flex-col items-center gap-20">
        <div className="w-full relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <FaIdCard className="text-gray-400" />
          </div>
          <input
            ref={inputRef}
            value={rfid}
            onChange={(e) => setRfid(e.target.value)}
            onKeyDown={handleScan}
            placeholder="Scan RFID and press Enter"
            className="w-full pl-12 pr-5 py-4 text-center text-lg font-mono rounded-xl bg-white text-gray-800 placeholder-gray-400 border border-gray-300 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <img
            src="src/assets/rfid.png"
            alt="RFID Scanner"
            className="w-[200px] h-[200px] animate-bounce"
          />
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
