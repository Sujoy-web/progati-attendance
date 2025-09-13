// pages/AttendanceTimeSetup.jsx
import { useState, useEffect } from "react";

const weekDays = [
  "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"
];

const availableClasses = [
  "Class 1","Class 2","Class 3","Class 4","Class 5","Class 6"
];

export default function AttendanceTimeSetup() {
  const [setups, setSetups] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showClassDropdowns, setShowClassDropdowns] = useState({});

  // ✅ Load setups from API on mount
  useEffect(() => {
    fetch("/api/attendance-setups")
      .then((res) => res.json())
      .then((data) => setSetups(data))
      .catch((err) => console.error("Error loading setups:", err));
  }, []);

  // ✅ Save setup (new or update)
  const saveSetup = async (setup) => {
    const method = setup.id ? "PUT" : "POST";
    const url = setup.id
      ? `/api/attendance-setups/${setup.id}`
      : "/api/attendance-setups";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(setup),
    });

    if (!res.ok) {
      alert("Failed to save setup");
      return;
    }

    const saved = await res.json();
    setSetups((prev) =>
      setup.id
        ? prev.map((s) => (s.id === saved.id ? saved : s))
        : [...prev, saved]
    );
  };

  // ✅ Delete setup
  const deleteSetup = async (setupId) => {
    const res = await fetch(`/api/attendance-setups/${setupId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setSetups((prev) => prev.filter((s) => s.id !== setupId));
    }
  };

  // ✅ Generate schedule
  const applyAll = async () => {
    try {
      const res = await fetch("/api/attendance-schedule/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setups }),
      });
      if (!res.ok) throw new Error("Failed to generate schedule");
      const data = await res.json();
      setSchedule(data);
      setShowSchedule(true);
    } catch (err) {
      console.error(err);
      alert("Schedule generation failed.");
    }
  };

  // ✅ Class selection UI
  const toggleClassDropdown = (id) => {
    setShowClassDropdowns((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleClass = (setupId, cls) => {
    setSetups((prev) =>
      prev.map((s) =>
        s.id === setupId
          ? {
              ...s,
              selectedClasses: s.selectedClasses.includes(cls)
                ? s.selectedClasses.filter((c) => c !== cls)
                : [...s.selectedClasses, cls],
            }
          : s
      )
    );
  };

  const selectAllClasses = (setupId) => {
    setSetups((prev) =>
      prev.map((s) =>
        s.id === setupId ? { ...s, selectedClasses: [...availableClasses] } : s
      )
    );
  };

  // ✅ Rules management
  const addRule = (setupId) => {
    setSetups((prev) =>
      prev.map((s) =>
        s.id === setupId
          ? {
              ...s,
              rules: [...s.rules, { id: Date.now(), class: "", rule: "" }],
            }
          : s
      )
    );
  };

  const updateRule = (setupId, ruleId, field, value) => {
    setSetups((prev) =>
      prev.map((s) =>
        s.id === setupId
          ? {
              ...s,
              rules: s.rules.map((r) =>
                r.id === ruleId ? { ...r, [field]: value } : r
              ),
            }
          : s
      )
    );
  };

  const deleteRule = (setupId, ruleId) => {
    setSetups((prev) =>
      prev.map((s) =>
        s.id === setupId
          ? { ...s, rules: s.rules.filter((r) => r.id !== ruleId) }
          : s
      )
    );
  };

  return (
    <div className="p-6 space-y-6 bg-gray-900 text-white min-h-screen">
      <h2 className="text-2xl font-bold mb-4">📅 Attendance Time & Rules Setup</h2>

      {/* Add Setup Button */}
      <button
        onClick={() =>
          saveSetup({
            name: `Setup ${setups.length + 1}`,
            selectedClasses: [],
            fromDate: "",
            toDate: "",
            rules: [],
          })
        }
        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
      >
        + Add Setup
      </button>

      {/* Setup Blocks */}
      {setups.map((setup) => (
        <div
          key={setup.id}
          className="p-4 border border-gray-700 rounded-lg mt-4 bg-gray-800 shadow-md"
        >
          {/* Setup Title + Delete */}
          <div className="flex justify-between items-center mb-3">
            <input
              type="text"
              value={setup.name}
              onChange={(e) => saveSetup({ ...setup, name: e.target.value })}
              className="bg-gray-700 text-white px-2 py-1 rounded w-1/2"
            />
            <button
              onClick={() => deleteSetup(setup.id)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
            >
              🗑 Delete
            </button>
          </div>

          {/* Class Selection */}
          <div className="mb-3">
            <label className="block text-sm mb-1">Select Classes</label>
            <div className="flex gap-3">
              <button
                onClick={() => toggleClassDropdown(setup.id)}
                className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded"
              >
                {showClassDropdowns[setup.id] ? "Hide" : "Choose Classes"}
              </button>
              <button
                onClick={() => selectAllClasses(setup.id)}
                className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded"
              >
                Select All
              </button>
            </div>

            {showClassDropdowns[setup.id] && (
              <div className="flex flex-wrap gap-2 mt-2">
                {availableClasses.map((cls) => (
                  <label
                    key={cls}
                    className="bg-gray-700 px-2 py-1 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={setup.selectedClasses.includes(cls)}
                      onChange={() => toggleClass(setup.id, cls)}
                      className="mr-2"
                    />
                    {cls}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Date Range */}
          <div className="flex gap-4 mb-3">
            <div>
              <label className="block text-sm">From</label>
              <input
                type="date"
                value={setup.fromDate}
                onChange={(e) => saveSetup({ ...setup, fromDate: e.target.value })}
                className="bg-gray-700 text-white px-2 py-1 rounded"
              />
            </div>
            <div>
              <label className="block text-sm">To</label>
              <input
                type="date"
                value={setup.toDate}
                onChange={(e) => saveSetup({ ...setup, toDate: e.target.value })}
                className="bg-gray-700 text-white px-2 py-1 rounded"
              />
            </div>
          </div>

          {/* Rules Section */}
          <div className="mb-3">
            <h4 className="font-semibold mb-2">Rules</h4>
            {setup.rules.map((rule) => (
              <div key={rule.id} className="flex items-center gap-3 mb-2">
                <select
                  value={rule.class}
                  onChange={(e) =>
                    updateRule(setup.id, rule.id, "class", e.target.value)
                  }
                  className="bg-gray-700 text-white px-2 py-1 rounded"
                >
                  <option value="">Select Class</option>
                  {setup.selectedClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Enter Rule"
                  value={rule.rule}
                  onChange={(e) =>
                    updateRule(setup.id, rule.id, "rule", e.target.value)
                  }
                  className="bg-gray-700 text-white px-2 py-1 rounded flex-1"
                />
                <button
                  onClick={() => deleteRule(setup.id, rule.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm"
                >
                  ❌
                </button>
              </div>
            ))}
            <button
              onClick={() => addRule(setup.id)}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
            >
              + Add Rule
            </button>
          </div>
        </div>
      ))}

      {/* Actions */}
      {setups.length > 0 && (
        <div className="flex flex-wrap gap-4 mt-6">
          <button
            onClick={applyAll}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            ✅ Generate Final Schedule
          </button>
          <button
            onClick={() => setShowSchedule(!showSchedule)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
          >
            {showSchedule ? "Hide Final Schedule" : "Show Final Schedule"}
          </button>
        </div>
      )}

      {/* Final Schedule Display */}
      {showSchedule && schedule.length > 0 && (
        <div className="mt-6 bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-bold mb-3">📊 Final Attendance Schedule</h3>
          <table className="table-auto w-full border-collapse border border-gray-700">
            <thead>
              <tr className="bg-gray-700">
                <th className="border border-gray-600 px-4 py-2">Class</th>
                {weekDays.map((day) => (
                  <th key={day} className="border border-gray-600 px-4 py-2">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schedule.map((row, i) => (
                <tr key={i} className="hover:bg-gray-700">
                  <td className="border border-gray-600 px-4 py-2 font-semibold">
                    {row.class}
                  </td>
                  {weekDays.map((day) => (
                    <td key={day} className="border border-gray-600 px-4 py-2">
                      {row[day] || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
