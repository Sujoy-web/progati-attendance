import { useEffect, useState } from "react";
import { FaBars } from "react-icons/fa";

export default function Header({ onMenuClick }) {
  const [time, setTime] = useState("--:--");
  const [date, setDate] = useState("Loading...");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      setDate(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-full px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Left: Logo + Title */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/20"
            onClick={onMenuClick}
          >
            <FaBars className="w-5 h-5 text-white" />
          </button>

          {/* Logo */}
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white">
          Attendance Manager
            </h1>
            <p className="text-blue-200 text-xs sm:text-sm">
              Scan Card & Select User
            </p>
          </div>
        </div>

        {/* Right: Time & Date */}
        <div className="text-right text-white">
          <div className="text-base sm:text-lg font-semibold">{time}</div>
          <div className="text-blue-200 text-xs sm:text-sm">{date}</div>
        </div>
      </div>
    </header>
  );
}
