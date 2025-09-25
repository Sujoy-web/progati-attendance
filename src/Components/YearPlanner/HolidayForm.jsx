// components/YearPlanner/HolidayForm.jsx
import React, { useState } from "react";

export default function HolidayForm({ sessions, addHoliday, loading }) {
  const [sessionSel, setSessionSel] = useState("");
  const [holidayName, setHolidayName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = () => {
    addHoliday({
      session: sessionSel,
      name: holidayName,
      start: startDate,
      end: endDate,
    });
    setHolidayName("");
    setStartDate("");
    setEndDate("");
    setSessionSel("");
  };

  return (
    <div className="max-w-6xl mx-auto bg-gray-800 p-5 rounded-lg shadow mb-8">
      <h2 className="text-lg font-semibold mb-4 text-white border-b border-gray-700 pb-2">
        Add New Holiday
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Session
          </label>
          <select
            value={sessionSel}
            onChange={(e) => setSessionSel(e.target.value)}
            className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 text-white"
          >
            <option value="">Select Session</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Holiday Name
          </label>
          <input
            value={holidayName}
            onChange={(e) => setHolidayName(e.target.value)}
            placeholder="Enter holiday name"
            className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 text-white"
          />
        </div>
      </div>
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-600 py-2.5 px-5 rounded font-medium text-sm w-full md:w-auto"
      >
        {loading ? 'Adding...' : 'Add Holiday'}
      </button>
    </div>
  );
}