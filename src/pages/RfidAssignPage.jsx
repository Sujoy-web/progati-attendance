// pages/RfidAssignPage.jsx
import { useState, useEffect, useRef } from "react";
import { FaCheckCircle, FaExclamationTriangle, FaTrash } from "react-icons/fa";

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
  const inputRef = useRef(null);

  // ✅ 1. Load metadata (classes, sections, sessions)
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await fetch("/api/meta");
        const data = await res.json();
        setClasses(data.classes || []);
        setSections(data.sections || []);
        setSessions(data.sessions || []);
      } catch (err) {
        console.error("Error loading meta:", err);
      }
    };
    fetchMeta();
  }, []);

  // ✅ 2. Fetch students when class/section/session selected
  useEffect(() => {
    if (!classSel || !sectionSel || !sessionSel) return;

    const fetchStudents = async () => {
      try {
        const res = await fetch("/api/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            class: classSel,
            section: sectionSel,
            session: sessionSel,
          }),
        });
        const data = await res.json();
        setStudents(data.students || []);
      } catch (err) {
        console.error("Error loading students:", err);
      }
    };

    fetchStudents();
  }, [classSel, sectionSel, sessionSel]);

  const showStatus = (msg, type) => {
    setStatus({ msg, type });
    setTimeout(() => setStatus(null), 2000);
  };

  // ✅ 3. Assign RFID
  const assignRfid = async () => {
    if (!rfid.trim()) return showStatus("Scan RFID first", "error");
    if (students.some((s) => s.rfid === rfid.trim()))
      return showStatus("RFID already used", "error");

    const unassigned = students.find((s) => !s.rfid);
    if (!unassigned) return showStatus("No unassigned student", "error");

    try {
      const res = await fetch("/api/assign-rfid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: unassigned.id, rfid: rfid.trim() }),
      });
      const data = await res.json();

      setStudents((prev) =>
        prev.map((s) => (s.id === data.student.id ? data.student : s))
      );
      setRfid("");
      showStatus(`Assigned → ${data.student.name}`, "success");
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (err) {
      console.error("Error assigning RFID:", err);
      showStatus("Failed to assign RFID", "error");
    }
  };

  // ✅ 4. Remove RFID
  const handleRemove = async (id) => {
    try {
      await fetch("/api/remove-rfid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: id }),
      });

      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, rfid: "" } : s))
      );
      showStatus("RFID removed", "success");
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (err) {
      console.error("Error removing RFID:", err);
      showStatus("Failed to remove RFID", "error");
    }
  };

  useEffect(() => inputRef.current?.focus(), []);

  const filtered = students.filter((s) => {
    if (filter === "assigned") return s.rfid;
    if (filter === "unassigned") return !s.rfid;
    return true;
  });

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
      {status && (
        <div
          className={`mb-4 p-3 rounded flex items-center gap-2 ${
            status.type === "success" ? "bg-green-700" : "bg-red-700"
          }`}
        >
          {status.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />}
          <span>{status.msg}</span>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-6xl mx-auto grid grid-cols-4 gap-3 mb-5">
        <select
          value={classSel}
          onChange={(e) => setClassSel(e.target.value)}
          className="p-3 rounded bg-gray-800 text-lg"
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
          className="p-3 rounded bg-gray-800 text-sm"
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
          className="p-3 rounded bg-gray-800 text-sm"
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
          className="p-3 rounded bg-gray-800 text-sm"
        >
          <option value="all">All</option>
          <option value="assigned">Assigned</option>
          <option value="unassigned">Unassigned</option>
        </select>
      </div>

      {classSel && sectionSel && sessionSel && (
        <>
          {/* RFID input */}
          <div className="mb-5">
            <input
              ref={inputRef}
              value={rfid}
              onChange={(e) => setRfid(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && assignRfid()}
              placeholder="Scan RFID..."
              className="w-full p-3 rounded bg-gray-800 font-mono"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-700 text-sm">
              <thead className="bg-gray-800">
                <tr>
                  <th className="p-3 border border-gray-700">#</th>
                  <th className="p-3 border border-gray-700">Student Name</th>
                  <th className="p-3 border border-gray-700">Roll No.</th>
                  <th className="p-3 border border-gray-700">ADM</th>
                  <th className="p-3 border border-gray-700">RFID No.</th>
                  <th className="p-3 border border-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((s, i) => (
                    <tr
                      key={s.id}
                      className="border-t border-gray-700 hover:bg-gray-800/50"
                    >
                      <td className="p-3 border border-gray-700 text-center">
                        {i + 1}
                      </td>
                      <td className="p-3 border border-gray-700">{s.name}</td>
                      <td className="p-3 border border-gray-700 text-center">
                        {s.roll}
                      </td>
                      <td className="p-3 border border-gray-700 text-center">
                        {s.adm}
                      </td>
                      <td className="p-3 border border-gray-700 text-center">
                        {s.rfid ? (
                          <span className="text-green-400">{s.rfid}</span>
                        ) : (
                          <span className="text-gray-500">Not assigned</span>
                        )}
                      </td>
                      <td className="p-3 border border-gray-700 text-center">
                        {s.rfid && (
                          <button
                            onClick={() => handleRemove(s.id)}
                            className="px-2 py-1 bg-red-700 rounded text-xs flex items-center gap-1 mx-auto"
                          >
                            <FaTrash /> Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="p-4 text-center text-gray-500"
                    >
                      No students found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
