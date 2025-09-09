// pages/RfidAttendanceReport.jsx
import { useState, useEffect } from "react";

export default function RfidReport() {
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    session: "",
    class: "",
    section: "",
  });

  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [dates, setDates] = useState([]);

  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);

  // Load filter options from backend
  useEffect(() => {
    async function loadFilters() {
      try {
        const res = await fetch("/api/attendance/filters");
        if (!res.ok) throw new Error("Failed to load filters");
        const data = await res.json();
        setSessions(data.sessions || []);
        setClasses(data.classes || []);
        setSections(data.sections || []);
        setDates(data.dates || []);
      } catch (err) {
        console.error("Error fetching filters:", err);
      }
    }
    loadFilters();
  }, []);

  // handle filter input change
  const handleChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  // POST to get report
  const fetchReport = async () => {
    setLoading(true);
    setShowTable(false);
    try {
      const res = await fetch("/api/attendance/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
      });
      if (!res.ok) throw new Error("Failed to fetch report");
      const data = await res.json();
      setReport(data || []);
      setShowTable(true);
    } catch (err) {
      console.error("Error fetching report:", err);
      setReport([]);
      setShowTable(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Filters */}
        <div className="bg-gray-800 p-6 rounded shadow mb-6">
          <h2 className="text-2xl font-bold mb-4">Attendance Report</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Date From */}
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-gray-100"
            />
            {/* Date To */}
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-gray-100"
            />
            {/* Session */}
            <select
              name="session"
              value={filters.session}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-gray-100"
            >
              <option value="">All Sessions</option>
              {sessions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {/* Class */}
            <select
              name="class"
              value={filters.class}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-gray-100"
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {/* Section */}
            <select
              name="section"
              value={filters.section}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-gray-100"
            >
              <option value="">All Sections</option>
              {sections.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={fetchReport}
              className="px-4 py-2 bg-blue-600 rounded"
            >
              {loading ? "Loading..." : "Generate Report"}
            </button>
          </div>
        </div>

        {/* Report Table */}
        {showTable && (
          <div className="bg-gray-800 rounded shadow overflow-x-auto">
            {report.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                No records found
              </div>
            ) : (
              <table className="w-full table-auto text-left border border-gray-700">
                <thead className="bg-gray-700 text-gray-100">
                  <tr>
                    <th className="p-2 border-r border-gray-600">#</th>
                    <th className="p-2 border-r border-gray-600">
                      Student Name
                    </th>
                    <th className="p-2 border-r border-gray-600">Class</th>
                    <th className="p-2 border-r border-gray-600">Section</th>
                    <th className="p-2 border-r border-gray-600">Roll</th>
                    <th className="p-2 border-r border-gray-600">In Time</th>
                    <th className="p-2 border-r border-gray-600">Out Time</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {report.map((r, i) => (
                    <tr
                      key={i}
                      className={`border-t border-gray-700 ${
                        i % 2 === 0 ? "bg-gray-900" : "bg-gray-800"
                      }`}
                    >
                      <td className="p-2">{i + 1}</td>
                      <td className="p-2">{r.name}</td>
                      <td className="p-2">{r.class}</td>
                      <td className="p-2">{r.section}</td>
                      <td className="p-2">{r.roll}</td>
                      <td className="p-2">
                        {r.inTime ? new Date(r.inTime).toLocaleString() : "—"}
                      </td>
                      <td className="p-2">
                        {r.outTime
                          ? new Date(r.outTime).toLocaleString()
                          : "—"}
                      </td>
                      <td
                        className={`p-2 font-semibold ${
                          r.status === "present"
                            ? "text-green-400"
                            : "text-red-500"
                        }`}
                      >
                        {r.status === "present" ? "Present" : "Absent"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
