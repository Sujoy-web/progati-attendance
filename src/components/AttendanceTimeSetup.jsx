// pages/AttendanceTimeSetup.jsx
import { useState, useEffect } from "react";

const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function AttendanceTimeSetup() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [rules, setRules] = useState(
    weekDays.map((day) => ({
      day,
      inStart: "",
      inEnd: "",
      outStart: "",
      outEnd: "",
      isOff: false,
    }))
  );
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch working days from backend
  useEffect(() => {
    const fetchWorkingDays = async () => {
      try {
        const res = await fetch("/api/attendance/working-days"); // Replace with your endpoint
        if (!res.ok) throw new Error("Failed to fetch working days");
        const data = await res.json();

        // data should be like [{ day: "Monday", isOff: false }, ...]
        const updatedRules = rules.map((r) => {
          const backendRule = data.find((d) => d.day === r.day);
          if (backendRule) return { ...r, isOff: backendRule.isOff };
          return r;
        });

        setRules(updatedRules);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch working days from server");
      }
    };
    fetchWorkingDays();
  }, []);

  // handle rule change
  const handleRuleChange = (index, field, value) => {
    const updated = [...rules];
    updated[index][field] = value;

    // If Monday (index 0) changes → apply to all days
    if (index === 0) {
      updated.forEach((row, i) => {
        if (i !== 0) {
          row[field] = value;
        }
      });
    }

    setRules(updated);
  };

  // generate full schedule based on rules
  const applyRules = () => {
    if (!fromDate || !toDate) {
      alert("Please select From and To date");
      return;
    }

    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (start > end) {
      alert("From Date cannot be after To Date");
      return;
    }

    const newSchedule = [];
    let current = new Date(start);

    while (current <= end) {
      const dayName = weekDays[current.getDay() === 0 ? 6 : current.getDay() - 1]; // map Sun=0 to index 6
      const rule = rules.find((r) => r.day === dayName);

      newSchedule.push({
        date: current.toISOString().split("T")[0],
        day: dayName,
        ...rule,
      });

      current.setDate(current.getDate() + 1);
    }

    setSchedule(newSchedule);
  };

  // save schedule to backend
  const handleSave = async () => {
    if (schedule.length === 0) {
      alert("No schedule to save");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/attendance/save-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule }),
      });

      if (!res.ok) throw new Error("Failed to save schedule");
      alert("Schedule saved successfully to backend!");
    } catch (err) {
      console.error(err);
      alert("Error saving schedule to backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold">Set Attendance Rules (Weekly)</h2>

      {loading && <p className="text-blue-600 font-semibold">Processing...</p>}

      {/* From-To Date */}
      <div className="flex gap-4">
        <div>
          <label className="block text-sm font-medium">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="p-2 border rounded"
          />
        </div>
      </div>

      {/* Rules Table */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Set Rules (Mon–Sun)</h3>
        <table className="table-auto border-collapse border w-full">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">Day</th>
              <th className="border px-4 py-2">In From</th>
              <th className="border px-4 py-2">In To</th>
              <th className="border px-4 py-2">Out From</th>
              <th className="border px-4 py-2">Out To</th>
              <th className="border px-4 py-2">Off Day</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((row, idx) => (
              <tr key={row.day} className={row.isOff ? "bg-red-100" : ""}>
                <td className="border px-4 py-2">{row.day}</td>
                <td className="border px-4 py-2">
                  <input
                    type="time"
                    value={row.inStart}
                    disabled={row.isOff}
                    onChange={(e) =>
                      handleRuleChange(idx, "inStart", e.target.value)
                    }
                    className="p-1 border rounded"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="time"
                    value={row.inEnd}
                    disabled={row.isOff}
                    onChange={(e) =>
                      handleRuleChange(idx, "inEnd", e.target.value)
                    }
                    className="p-1 border rounded"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="time"
                    value={row.outStart}
                    disabled={row.isOff}
                    onChange={(e) =>
                      handleRuleChange(idx, "outStart", e.target.value)
                    }
                    className="p-1 border rounded"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="time"
                    value={row.outEnd}
                    disabled={row.isOff}
                    onChange={(e) =>
                      handleRuleChange(idx, "outEnd", e.target.value)
                    }
                    className="p-1 border rounded"
                  />
                </td>
                <td className="border px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={row.isOff}
                    onChange={(e) =>
                      handleRuleChange(idx, "isOff", e.target.checked)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={applyRules}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Apply Rules
        </button>
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Save Schedule
        </button>
      </div>

      {/* Preview schedule */}
      {schedule.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mt-6 mb-2">
            Generated Schedule (Editable)
          </h3>
          <table className="table-auto border-collapse border w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">Date</th>
                <th className="border px-4 py-2">Day</th>
                <th className="border px-4 py-2">In From</th>
                <th className="border px-4 py-2">In To</th>
                <th className="border px-4 py-2">Out From</th>
                <th className="border px-4 py-2">Out To</th>
                <th className="border px-4 py-2">Off Day</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row, idx) => (
                <tr key={row.date} className={row.isOff ? "bg-red-100" : ""}>
                  <td className="border px-4 py-2">{row.date}</td>
                  <td className="border px-4 py-2">{row.day}</td>

                  <td className="border px-4 py-2">
                    <input
                      type="time"
                      value={row.inStart}
                      disabled={row.isOff}
                      onChange={(e) => {
                        const updated = [...schedule];
                        updated[idx].inStart = e.target.value;
                        setSchedule(updated);
                      }}
                      className="p-1 border rounded"
                    />
                  </td>

                  <td className="border px-4 py-2">
                    <input
                      type="time"
                      value={row.inEnd}
                      disabled={row.isOff}
                      onChange={(e) => {
                        const updated = [...schedule];
                        updated[idx].inEnd = e.target.value;
                        setSchedule(updated);
                      }}
                      className="p-1 border rounded"
                    />
                  </td>

                  <td className="border px-4 py-2">
                    <input
                      type="time"
                      value={row.outStart}
                      disabled={row.isOff}
                      onChange={(e) => {
                        const updated = [...schedule];
                        updated[idx].outStart = e.target.value;
                        setSchedule(updated);
                      }}
                      className="p-1 border rounded"
                    />
                  </td>

                  <td className="border px-4 py-2">
                    <input
                      type="time"
                      value={row.outEnd}
                      disabled={row.isOff}
                      onChange={(e) => {
                        const updated = [...schedule];
                        updated[idx].outEnd = e.target.value;
                        setSchedule(updated);
                      }}
                      className="p-1 border rounded"
                    />
                  </td>

                  <td className="border px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={row.isOff}
                      onChange={(e) => {
                        const updated = [...schedule];
                        updated[idx].isOff = e.target.checked;
                        setSchedule(updated);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
