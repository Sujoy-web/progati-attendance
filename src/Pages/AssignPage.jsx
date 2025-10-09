// src/pages/AssignPage.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { FaCheckCircle, FaExclamationTriangle, FaTimes } from "react-icons/fa";

import FiltersBar from "../Components/Assign/FilterBar";
import SearchAndInput from "../Components/Assign/SearchAndInput";
import SelectedStudentCard from "../Components/Assign/SelectedStudentCard";
import StudentsTable from "../Components/Assign/StudentsTable";
import { getUniqueId } from "../utils/helpers";

// ✅ Update this to your real backend URL in production
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://your-backend-api.com/api";

export default function AssignPage({ token }) {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [classSel, setClassSel] = useState("");
  const [sectionSel, setSectionSel] = useState("");
  const [sessionSel, setSessionSel] = useState("");
  const [filter, setFilter] = useState("all");

  const [rawStudents, setRawStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rfid, setRfid] = useState("");
  const [status, setStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const inputRef = useRef(null);
  const nextUnassignedIndexRef = useRef(0);

  // 🔐 Auth-aware fetch wrapper — includes Bearer token
  const apiFetch = useCallback(async (url, options = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return res;
  }, [token]);

  // Fetch dropdowns on mount
  useEffect(() => {
    const fetchDropdowns = async () => {
      
      try {
        const [classRes, sectionRes, sessionRes] = await Promise.all([
          apiFetch(`${BASE_URL}/classes`),
          apiFetch(`${BASE_URL}/sections`),
          apiFetch(`${BASE_URL}/sessions`),
        ]);
console.log("fetching dropdowns", classRes, sectionRes, sessionRes)
        setClasses(await classRes.json());
        setSections(await sectionRes.json());
        setSessions(await sessionRes.json());
      } catch (error) {
        console.error("Error loading dropdowns:", error);
        showStatus("Failed to load options", "error");
      }
    };

    fetchDropdowns();
  }, [apiFetch]);

  // Auto-focus RFID input after students load
  useEffect(() => {
    if (rawStudents.length > 0) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [rawStudents]);

  // Reset assignment pointer when filters or list changes
  useEffect(() => {
    nextUnassignedIndexRef.current = 0;
  }, [classSel, sectionSel, sessionSel, filter, rawStudents]);

  // Apply client-side filter
  const students = rawStudents.filter((s) =>
    filter === "assigned"
      ? s.rfid
      : filter === "unassigned"
      ? !s.rfid
      : true
  );

  const showStatus = useCallback((msg, type) => {
    setStatus({ msg, type });
    setTimeout(() => setStatus(null), 2500);
  }, []);

  const handleSearch = async () => {
    if (!classSel || !sectionSel || !sessionSel) {
      showStatus("Please select class, section, and session", "error");
      return;
    }

    await fetchStudents(classSel, sectionSel, sessionSel);
  };

  const fetchStudents = async (className, sectionName, sessionName) => {
    setLoading(true);
    try {
      const url = `${BASE_URL}/students?class=${encodeURIComponent(className)}&section=${encodeURIComponent(sectionName)}&session=${encodeURIComponent(sessionName)}`;
      const res = await apiFetch(url);
      console.log("fetch student response", res)
      const data = await res.json();
      setRawStudents(data);
      setSelectedStudent(null);
    } catch (error) {
      console.error("Error loading students:", error);
      showStatus("Failed to load students", "error");
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Assign RFID with backend confirmation
  const assignRfid = useCallback(async () => {
    const rfidValue = rfid.trim();
    if (!rfidValue) return;

    const unassignedStudents = students.filter(s => !s.rfid);
    if (unassignedStudents.length === 0) {
      showStatus("No unassigned students left", "error");
      setRfid("");
      return;
    }

    const currentIndex = nextUnassignedIndexRef.current % unassignedStudents.length;
    const studentToAssign = unassignedStudents[currentIndex];

    // Optimistically update UI
    setRawStudents(prev =>
      prev.map(s => (s.id === studentToAssign.id ? { ...s, rfid: rfidValue } : s))
    );
    setRfid("");
    nextUnassignedIndexRef.current = currentIndex + 1;

    // Sync with backend
    try {
      const payload = {
          user_id: studentToAssign.id,
          card: rfidValue,
        }
      await apiFetch(`${BASE_URL}/assignments/`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      showStatus(`✅ Assigned to ${studentToAssign.name}`, "success");
    } catch (error) {
      // Revert on failure
      setRawStudents(prev =>
        prev.map(s => (s.id === studentToAssign.id ? { ...s, rfid: null } : s))
      );
      showStatus("Assignment failed – reverted", "error");
       console.log(error)
    }

    // Refocus input
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [rfid, students, showStatus, apiFetch]);

  // Auto-trigger assign after 300ms of typing
  useEffect(() => {
    if (rfid.trim()) {
      const timeout = setTimeout(assignRfid, 300);
      return () => clearTimeout(timeout);
    }
  }, [rfid, assignRfid]);

  const selectFirstMatchingStudent = () => {
    if (!searchTerm.trim()) return;
    const term = searchTerm.toLowerCase();
    const match = students.find(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.roll.toString().includes(term) ||
        s.adm.toLowerCase().includes(term)
    );
    if (match) {
      setSelectedStudent(match);
      showStatus(`Selected: ${match.name}`, "success");
    } else {
      showStatus("No student found", "error");
    }
  };

  const handleRemove = async (student) => {
    // Optimistically remove
    setRawStudents(prev =>
      prev.map(s => (s.id === student.id ? { ...s, rfid: null } : s))
    );
    showStatus("RFID removed", "warning");
    nextUnassignedIndexRef.current = 0;

    // Sync removal with backend
    try {
      await apiFetch(`${BASE_URL}/remove-rfid/${student.id}`, {
        method: "PUT",
        body: JSON.stringify({ rfid: null }),
      });
    } catch (error) {
      // Revert on error
      setRawStudents(prev =>
        prev.map(s => (s.id === student.id ? { ...s, rfid: student.rfid } : s))
      );
      showStatus("Removal failed – reverted", "error");
      console.log(error)
    }
  };

  return (
    <div className="p-6 text-gray-100 bg-gray-900 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4">RFID Assignment</h2>

      <FiltersBar
        classes={classes.map(c => c.name)}
        sections={sections.map(s => s.name)}
        sessions={sessions.map(s => s.name)}
        classSel={classSel}
        sectionSel={sectionSel}
        sessionSel={sessionSel}
        filter={filter}
        setClassSel={setClassSel}
        setSectionSel={setSectionSel}
        setSessionSel={setSessionSel}
        setFilter={setFilter}
      />

      <div className="max-w-6xl mx-auto mb-4 flex justify-end">
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 rounded-lg font-medium transition-colors"
        >
          {loading ? "Searching..." : "Search Students"}
        </button>
      </div>

      <SearchAndInput
        inputRef={inputRef}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        clearSearch={() => {
          setSearchTerm("");
          setSelectedStudent(null);
        }}
        selectFirstMatchingStudent={selectFirstMatchingStudent}
        rfid={rfid}
        setRfid={setRfid}
        assignRfid={assignRfid}
        loading={loading}
      />

      {selectedStudent && (
        <SelectedStudentCard
          student={selectedStudent}
          clear={() => setSelectedStudent(null)}
        />
      )}

      <StudentsTable
        students={students}
        selectedStudent={selectedStudent}
        handleRowDoubleClick={(s) => setSelectedStudent(s)}
        handleRemove={handleRemove}
        loading={loading}
        getUniqueId={getUniqueId}
      />

      {status && (
        <div
          className={`fixed bottom-5 right-5 px-4 py-3 rounded-lg flex items-center gap-2 shadow-lg ${
            status.type === "success"
              ? "bg-green-800 text-green-100"
              : status.type === "error"
              ? "bg-red-800 text-red-100"
              : "bg-yellow-800 text-yellow-100"
          }`}
        >
          {status.type === "success" && <FaCheckCircle />}
          {status.type === "error" && <FaTimes />}
          {status.type === "warning" && <FaExclamationTriangle />}
          <span>{status.msg}</span>
        </div>
      )}
    </div>
  );
}