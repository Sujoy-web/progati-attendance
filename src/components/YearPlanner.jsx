// pages/YearPlannerPage.jsx
import { useState, useEffect } from "react";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
  FaSearch,
  FaTrash,
  FaEdit,
  FaSave,
  FaFileExcel,
  FaPrint,
  FaPlus,
  FaSpinner,
} from "react-icons/fa";

// API endpoints - replace with your actual API URLs
const API_BASE_URL = "https://api.yourdomain.com";
const HOLIDAYS_API = `${API_BASE_URL}/holidays`;
const SESSIONS_API = `${API_BASE_URL}/sessions`;

export default function YearPlannerPage() {
  const [sessions, setSessions] = useState([]);
  const [sessionSel, setSessionSel] = useState("");
  const [holidayName, setHolidayName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [holidays, setHolidays] = useState([]);
  const [status, setStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", start: "", end: "" });
  const [loading, setLoading] = useState(false);

  // Fetch sessions and holidays on component mount
  useEffect(() => {
    fetchSessions();
    fetchHolidays();
  }, []);

  // API function to fetch sessions
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch(SESSIONS_API);
      if (!response.ok) throw new Error("Failed to fetch sessions");
      
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      showStatus("Error loading sessions: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // API function to fetch holidays
  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const response = await fetch(HOLIDAYS_API);
      if (!response.ok) throw new Error("Failed to fetch holidays");
      
      const data = await response.json();
      setHolidays(data);
    } catch (error) {
      showStatus("Error loading holidays: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (msg, type) => {
    setStatus({ msg, type });
    setTimeout(() => setStatus(null), 3000);
  };

  const calcDays = (s, e) => {
    const start = new Date(s);
    const end = new Date(e);
    const diff = (end - start) / (1000 * 60 * 60 * 24) + 1;
    return diff > 0 ? diff : 0;
  };

  // API function to add a holiday
  const handleAddHoliday = async () => {
    if (!sessionSel || !holidayName.trim() || !startDate || !endDate) {
      return showStatus("Please fill all fields", "error");
    }

    try {
      setLoading(true);
      const response = await fetch(HOLIDAYS_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session: sessionSel,
          name: holidayName.trim(),
          start: startDate,
          end: endDate,
          active: true,
        }),
      });

      if (!response.ok) throw new Error("Failed to add holiday");

      const newHoliday = await response.json();
      
      setHolidays([...holidays, newHoliday]);
      setHolidayName("");
      setStartDate("");
      setEndDate("");
      showStatus("Holiday added successfully", "success");
    } catch (error) {
      showStatus("Error adding holiday: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // API function to toggle holiday active status
  const toggleActive = async (id) => {
    try {
      setLoading(true);
      const holiday = holidays.find(h => h.id === id);
      const response = await fetch(`${HOLIDAYS_API}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          active: !holiday.active
        }),
      });

      if (!response.ok) throw new Error("Failed to update holiday");

      const updatedHoliday = await response.json();
      
      setHolidays(holidays.map(h => 
        h.id === id ? { ...h, active: updatedHoliday.active } : h
      ));
    } catch (error) {
      showStatus("Error updating holiday: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // API function to delete a holiday
  const deleteHoliday = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`${HOLIDAYS_API}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete holiday");

      setHolidays(holidays.filter(h => h.id !== id));
      showStatus("Holiday deleted", "success");
    } catch (error) {
      showStatus("Error deleting holiday: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (h) => {
    setEditingId(h.id);
    setEditForm({ name: h.name, start: h.start, end: h.end });
  };

  // API function to update a holiday
  const saveEdit = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`${HOLIDAYS_API}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) throw new Error("Failed to update holiday");

      const updatedHoliday = await response.json();
      
      setHolidays(holidays.map(h => 
        h.id === id ? updatedHoliday : h
      ));
      setEditingId(null);
      showStatus("Holiday updated", "success");
    } catch (error) {
      showStatus("Error updating holiday: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    // Create CSV content instead of Excel
    const headers = ["Sl", "Holiday Name", "Session", "Start Date", "End Date", "Total Days"];
    const activeHolidays = holidays.filter(h => h.active);
    
    const csvContent = [
      headers.join(","),
      ...activeHolidays.map((h, i) => [
        i + 1,
        `"${h.name}"`,
        `"${h.session}"`,
        h.start,
        h.end,
        calcDays(h.start, h.end)
      ].join(","))
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "HolidayPlanner.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showStatus("Exported to CSV successfully", "success");
  };

  const handlePrint = () => {
    const table = document.getElementById("holidayTable").cloneNode(true);
    const footer = document.getElementById("tableFooter").cloneNode(true);

    // Remove inactive rows & Actions column
    Array.from(table.querySelectorAll("tbody tr")).forEach((row) => {
      const isActive = row.querySelector("input[type=checkbox]")?.checked;
      if (!isActive) row.remove();
    });
    Array.from(table.querySelectorAll("th:last-child, td:last-child")).forEach(
      (el) => el.remove()
    );

    const newWin = window.open("", "_blank", "width=900,height=700");
    newWin.document.write(`
      <html>
        <head>
          <title>Holiday Planner</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px;
              color: #333;
            }
            h2 {
              text-align: center;
              margin-bottom: 20px;
              color: #2d3748;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #2d3748;
              color: white;
            }
            .footer {
              background-color: #2d3748;
              color: white;
              padding: 12px;
              text-align: center;
              font-weight: bold;
              margin-top: 20px;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <h2>Holiday Planner</h2>
    `);
    newWin.document.write(table.outerHTML);
    newWin.document.write(`<div class="footer">${footer.textContent}</div>`);
    newWin.document.write("</body></html>");
    newWin.document.close();
    
    // Wait for content to load before printing
    setTimeout(() => {
      newWin.print();
    }, 250);
  };

  const filtered = holidays.filter((h) => {
    const matchesSearch =
      searchTerm === "" ||
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.session.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalDays = filtered.reduce(
    (sum, h) => (h.active ? sum + calcDays(h.start, h.end) : sum),
    0
  );

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
      {/* Status Message */}
      {status && (
        <div
          className={`fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg flex items-center gap-2 ${
            status.type === "success" ? "bg-green-800" : "bg-red-800"
          }`}
        >
          {status.type === "success" ? (
            <FaCheckCircle />
          ) : (
            <FaExclamationTriangle />
          )}
          <p className="font-medium">{status.msg}</p>
          <button onClick={() => setStatus(null)}>
            <FaTimes />
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-5 rounded-lg flex items-center gap-3">
            <FaSpinner className="animate-spin" />
            <span>Processing...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Holiday Planner</h1>
        <p className="text-gray-400">Manage and track holidays for academic sessions</p>
      </div>

      {/* Form */}
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
              className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Session</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
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
              className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <button
          onClick={handleAddHoliday}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-600 py-2.5 px-5 rounded font-medium text-sm w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaPlus className="text-sm" /> Add Holiday
        </button>
      </div>

      {/* Actions */}
      <div className="max-w-6xl mx-auto mb-6 flex flex-col md:flex-row items-stretch md:items-center gap-4">
        <div className="flex items-center flex-1 bg-gray-800 rounded px-3 py-2 border border-gray-700">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or session..."
            className="w-full bg-transparent outline-none text-white placeholder-gray-400"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-green-700 hover:bg-green-600 px-4 py-2.5 rounded text-sm font-medium"
          >
            <FaFileExcel /> Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 px-4 py-2.5 rounded text-sm font-medium"
          >
            <FaPrint /> Print
          </button>
        </div>
      </div>

      {/* Table */}
      <div id="holidayTable" className="max-w-6xl mx-auto overflow-x-auto rounded-lg border border-gray-700 shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-gray-200">
            <tr>
              <th className="p-3 border-b border-gray-700 text-center">Sl</th>
              <th className="p-3 border-b border-gray-700 text-left">Holiday Name</th>
              <th className="p-3 border-b border-gray-700 text-left">Session</th>
              <th className="p-3 border-b border-gray-700 text-left">Start Date</th>
              <th className="p-3 border-b border-gray-700 text-left">End Date</th>
              <th className="p-3 border-b border-gray-700 text-center">Days</th>
              <th className="p-3 border-b border-gray-700 text-center">Active</th>
              <th className="p-3 border-b border-gray-700 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length > 0 ? (
              filtered.map((h, i) => (
                <tr
                  key={h.id}
                  className="border-b border-gray-700 hover:bg-gray-800/50 transition"
                >
                  <td className="p-3 text-center">{i + 1}</td>

                  <td className="p-3 text-left">
                    {editingId === h.id ? (
                      <input
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        className="bg-gray-700 p-1.5 rounded w-full text-white border border-gray-600"
                      />
                    ) : (
                      h.name
                    )}
                  </td>

                  <td className="p-3 text-left">{h.session}</td>

                  <td className="p-3 text-left">
                    {editingId === h.id ? (
                      <input
                        type="date"
                        value={editForm.start}
                        onChange={(e) =>
                          setEditForm({ ...editForm, start: e.target.value })
                        }
                        className="bg-gray-700 p-1.5 rounded text-white border border-gray-600"
                      />
                    ) : (
                      h.start
                    )}
                  </td>

                  <td className="p-3 text-left">
                    {editingId === h.id ? (
                      <input
                        type="date"
                        value={editForm.end}
                        onChange={(e) =>
                          setEditForm({ ...editForm, end: e.target.value })
                        }
                        className="bg-gray-700 p-1.5 rounded text-white border border-gray-600"
                      />
                    ) : (
                      h.end
                    )}
                  </td>

                  <td className="p-3 text-center">
                    {calcDays(h.start, h.end)}
                  </td>

                  <td className="p-3 text-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={h.active}
                        onChange={() => toggleActive(h.id)}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </td>

                  <td className="p-3 text-center">
                    <div className="flex gap-2 justify-center">
                      {editingId === h.id ? (
                        <button
                          onClick={() => saveEdit(h.id)}
                          className="text-green-400 hover:text-green-300 p-1.5 rounded-full bg-gray-700 hover:bg-gray-600"
                          title="Save"
                        >
                          <FaSave />
                        </button>
                      ) : (
                        <button
                          onClick={() => startEditing(h)}
                          className="text-blue-400 hover:text-blue-300 p-1.5 rounded-full bg-gray-700 hover:bg-gray-600"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                      )}
                      <button
                        onClick={() => deleteHoliday(h.id)}
                        className="text-red-400 hover:text-red-300 p-1.5 rounded-full bg-gray-700 hover:bg-gray-600"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="p-6 text-center text-gray-500"
                >
                  No holidays found. Add a holiday to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Footer */}
        {filtered.length > 0 && (
          <div id="tableFooter" className="bg-gray-800 text-gray-200 p-4 text-center">
            The total holiday in session{" "}
            <span className="font-bold">{sessionSel || "—"}</span> is{" "}
            <span className="font-bold">{totalDays}</span> days (
            {filtered.filter((h) => h.active).length} holidays)
          </div>
        )}
      </div>
    </div>
  );
}