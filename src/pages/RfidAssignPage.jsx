// pages/RfidAssignPage.jsx
import { useState, useEffect, useRef } from "react";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaTrash,
  FaSearch,
  FaTimes,
} from "react-icons/fa";

export default function RfidAssignPage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [classSel, setClassSel] = useState("");
  const [sectionSel, setSectionSel] = useState("");
  const [sessionSel, setSessionSel] = useState("");
  const [filter, setFilter] = useState("all");
  const [rfid, setRfid] = useState("");
  const [status, setStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const inputRef = useRef(null);
  const searchRef = useRef(null);

  // ✅ Initial API call: get all classes/sections/sessions
  useEffect(() => {
    async function fetchFilters() {
      try {
        const res = await fetch("https://yourapi.com/api/get-filters");
        const data = await res.json();

        // Assuming API returns { classes:[], sections:[], sessions:[] }
        setClasses(data.classes || []);
        setSections(data.sections || []);
        setSessions(data.sessions || []);
      } catch (err) {
        console.error("Error fetching filters", err);
      }
    }
    fetchFilters();
  }, []);

  // ✅ Fetch students when filters change
  useEffect(() => {
    if (!classSel || !sectionSel || !sessionSel) return;

    async function fetchStudents() {
      const payload = {
        class: classSel,
        section: sectionSel,
        session: sessionSel,
      };

      console.log("Fetching students payload:", payload);

      try {
        const res = await fetch("https://yourapi.com/api/get-students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        // Assuming API returns { students:[...] }
        setStudents(data.students || []);
        setSelectedStudent(null);
      } catch (err) {
        console.error("Error fetching students", err);
      }
    }

    fetchStudents();
  }, [classSel, sectionSel, sessionSel]);

  const showStatus = (msg, type) => {
    setStatus({ msg, type });
    setTimeout(() => setStatus(null), 3000);
  };

  // ✅ Assign RFID and push to API
  const assignRfid = async () => {
    if (!rfid.trim()) return showStatus("Scan RFID first", "error");

    // Check if RFID already exists
    if (students.some((s) => s.rfid === rfid.trim())) {
      setRfid("");
      inputRef.current?.focus();
      return showStatus("RFID already used", "error");
    }

    let updated = [...students];

    if (selectedStudent) {
      updated = updated.map((s) =>
        s.id === selectedStudent.id ? { ...s, rfid: rfid.trim() } : s
      );
      setStudents(updated);

      const payload = {
        studentId: selectedStudent.id,
        rfid: rfid.trim(),
      };
      console.log("Assign RFID payload:", payload);

      try {
        await fetch("https://yourapi.com/api/assign-rfid", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.error("Error assigning RFID", err);
      }

      setRfid("");
      setSelectedStudent(null);
      showStatus(`RFID assigned to ${selectedStudent.name}`, "success");
      inputRef.current?.focus();
      return;
    }

    // Auto assign to first unassigned
    const idx = students.findIndex((s) => !s.rfid);
    if (idx < 0) {
      setRfid("");
      inputRef.current?.focus();
      return showStatus("No unassigned student", "error");
    }

    updated[idx].rfid = rfid.trim();
    setStudents(updated);

    const payload = {
      studentId: updated[idx].id,
      rfid: rfid.trim(),
    };
    console.log("Auto-assign RFID payload:", payload);

    try {
      await fetch("https://yourapi.com/api/assign-rfid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("Error assigning RFID", err);
    }

    setRfid("");
    showStatus(`RFID assigned to ${updated[idx].name}`, "success");
    inputRef.current?.focus();
  };

  // ✅ Remove RFID and update API
  const handleRemove = async (id) => {
    const student = students.find((s) => s.id === id);
    const updated = students.map((s) => (s.id === id ? { ...s, rfid: "" } : s));
    setStudents(updated);

    const payload = { studentId: id, rfid: "" };
    console.log("Remove RFID payload:", payload);

    try {
      await fetch("https://yourapi.com/api/assign-rfid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("Error removing RFID", err);
    }

    showStatus(`RFID removed from ${student.name}`, "success");
    inputRef.current?.focus();
  };

  // ✅ Filtering
  const filtered = students.filter((s) => {
    const matchesSearch =
      searchTerm === "" ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.roll.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.adm.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "assigned") return matchesSearch && s.rfid;
    if (filter === "unassigned") return matchesSearch && !s.rfid;
    return matchesSearch;
  });

  // ✅ Render (same UI, only logic changed)
  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
      {/* Status Toast */}
      {status && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 animate-fadeIn ${
            status.type === "success" ? "bg-green-800" : "bg-red-800"
          }`}
        >
          {status.type === "success" ? (
            <FaCheckCircle className="text-green-300" />
          ) : (
            <FaExclamationTriangle className="text-red-300" />
          )}
          <p className="font-medium">{status.msg}</p>
          <button
            onClick={() => setStatus(null)}
            className="ml-2 text-gray-300 hover:text-white"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-6xl mx-auto grid grid-cols-4 gap-3 mb-5">
        <select
          value={classSel}
          onChange={(e) => setClassSel(e.target.value)}
          className="p-3 rounded-lg bg-gray-800 text-sm border border-gray-700"
        >
          <option value="">Class</option>
          {classes.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={sectionSel}
          onChange={(e) => setSectionSel(e.target.value)}
          className="p-3 rounded-lg bg-gray-800 text-sm border border-gray-700"
        >
          <option value="">Section</option>
          {sections.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={sessionSel}
          onChange={(e) => setSessionSel(e.target.value)}
          className="p-3 rounded-lg bg-gray-800 text-sm border border-gray-700"
        >
          <option value="">Session</option>
          {sessions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-3 rounded-lg bg-gray-800 text-sm border border-gray-700"
        >
          <option value="all">All Students</option>
          <option value="assigned">Assigned RFID</option>
          <option value="unassigned">Unassigned RFID</option>
        </select>
      </div>

      {/* Students Table */}
      {classSel && sectionSel && sessionSel && (
        <div className="max-w-6xl mx-auto overflow-x-auto border border-gray-700 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Roll</th>
                <th className="p-3 text-left">ADM</th>
                <th className="p-3 text-left">Class</th>
                <th className="p-3 text-left">Section</th>
                <th className="p-3 text-left">Session</th>
                <th className="p-3 text-left">RFID</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id} className="border-t border-gray-700">
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3">{s.name}</td>
                  <td className="p-3">{s.roll}</td>
                  <td className="p-3">{s.adm}</td>
                  <td className="p-3">{s.class}</td>
                  <td className="p-3">{s.section}</td>
                  <td className="p-3">{s.session}</td>
                  <td className="p-3">
                    {s.rfid ? (
                      <span className="bg-green-900/30 text-green-400 px-2 py-1 rounded text-xs">
                        {s.rfid}
                      </span>
                    ) : (
                      <span className="text-gray-500">Not assigned</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {s.rfid && (
                      <button
                        onClick={() => handleRemove(s.id)}
                        className="bg-red-700 hover:bg-red-600 px-3 py-1 rounded text-xs"
                      >
                        <FaTrash /> Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center py-6 text-gray-500">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

