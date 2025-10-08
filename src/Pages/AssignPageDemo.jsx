

import { useState, useEffect, useRef, useCallback } from "react";
import { FaCheckCircle, FaExclamationTriangle, FaTimes } from "react-icons/fa";

import FiltersBar from "../Components/Assign/FilterBar";
import SearchAndInput from "../Components/Assign/SearchAndInput";
import SelectedStudentCard from "../Components/Assign/SelectedStudentCard";
import StudentsTable from "../Components/Assign/StudentsTable";
import { getUniqueId } from "../utils/helpers";

// ✅ Clean API URL
const BASE_URL = "https://your-backend-api.com/api";

// 🧪 Updated mock to match real API structure
const mockFetch = (url) =>
  new Promise((resolve) => {
    setTimeout(() => {
      if (url.includes("/classes")) {
        resolve({
          ok: true,
          json: () => Promise.resolve([
            { id: 1, name: "Class V" },
            { id: 2, name: "Class VI" },
            { id: 3, name: "Class VII" }
          ])
        });
      } else if (url.includes("/sections")) {
        resolve({
          ok: true,
          json: () => Promise.resolve([
            { id: 1, name: "A", class_id: 1 },
            { id: 2, name: "B", class_id: 1 },
            { id: 3, name: "C", class_id: 2 }
          ])
        });
      } else if (url.includes("/sessions")) {
        resolve({
          ok: true,
          json: () => Promise.resolve([
            { id: 1, name: "2024–2025" },
            { id: 2, name: "2025–2026" }
          ])
        });
      } else if (url.includes("/students")) {
        const urlObj = new URL(url, "http://mock");
        const className = urlObj.searchParams.get("class");
        const sectionName = urlObj.searchParams.get("section");
        const sessionName = urlObj.searchParams.get("session");

        const MOCK_STUDENTS = [
          { id: 1, name: "Alice Johnson", roll: "01", adm: "ADM1001", class: className, section: sectionName, session: sessionName, rfid: "123456" },
          { id: 2, name: "Bob Smith", roll: "02", adm: "ADM1002", class: className, section: sectionName, session: sessionName, rfid: null },
          { id: 3, name: "Charlie Brown", roll: "03", adm: "ADM1003", class: className, section: sectionName, session: sessionName, rfid: null },
          { id: 4, name: "Diana Prince", roll: "04", adm: "ADM1004", class: className, section: sectionName, session: sessionName, rfid: "789012" },
          { id: 5, name: "Ethan Hunt", roll: "05", adm: "ADM1005", class: className, section: sectionName, session: sessionName, rfid: null },
        ];

        resolve({ ok: true, json: () => Promise.resolve(MOCK_STUDENTS) });
      } else {
        resolve({ ok: false });
      }
    }, 300);
  });

const apiFetch = async (url, options = {}) => {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error();
    return res;
  } catch {
    console.warn("⚠️ Using mock data for:", url);
    return mockFetch(url);
  }
};

export default function AssignPageDemo() {
  // Store full objects
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [sessions, setSessions] = useState([]);

  // Selections store NAME (for API compatibility)
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

  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const nextUnassignedIndexRef = useRef(0);
  const assignedRfidSetRef = useRef(new Set());

  // Fetch dropdowns on mount
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [classRes, sectionRes, sessionRes] = await Promise.all([
          apiFetch(`${BASE_URL}/classes`),
          apiFetch(`${BASE_URL}/sections`),
          apiFetch(`${BASE_URL}/sessions`),
        ]);

        setClasses(await classRes.json());
        setSections(await sectionRes.json());
        setSessions(await sessionRes.json());
      } catch (error) {
        console.error("Error loading dropdowns:", error);
        showStatus("Failed to load options", "error");
      }
    };

    fetchDropdowns();
  }, []);

  // Keep global RFID set in sync
  useEffect(() => {
    const assigned = new Set();
    rawStudents.forEach(s => {
      if (s.rfid) assigned.add(s.rfid);
    });
    assignedRfidSetRef.current = assigned;
  }, [rawStudents]);

  // Auto-focus RFID input after students load
  useEffect(() => {
    if (rawStudents.length > 0) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [rawStudents]);

  // Reset pointers when filters or list changes
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
    setTimeout(() => setStatus(null), 2000);
  }, []);

  // 🔍 Manual search trigger
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
      // ✅ Pass NAMES (as your backend expects)
      const url = `${BASE_URL}/students?class=${encodeURIComponent(className)}&section=${encodeURIComponent(sectionName)}&session=${encodeURIComponent(sessionName)}`;
      const res = await apiFetch(url);
      if (!res.ok) throw new Error("Failed to fetch students");
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

  // 🔁 Auto-assign with duplicate prevention
  const assignRfid = useCallback(() => {
    const rfidValue = rfid.trim();
    if (!rfidValue) return;

    if (assignedRfidSetRef.current.has(rfidValue)) {
      showStatus("This RFID is already assigned!", "error");
      setRfid("");
      setTimeout(() => inputRef.current?.focus(), 50);
      return;
    }

    const unassignedStudents = students.filter(s => !s.rfid);

    if (unassignedStudents.length === 0) {
      showStatus("No unassigned students left", "error");
      setRfid("");
      return;
    }

    const currentIndex = nextUnassignedIndexRef.current % unassignedStudents.length;
    const studentToAssign = unassignedStudents[currentIndex];

    setRawStudents(prev =>
      prev.map(s =>
        s.id === studentToAssign.id ? { ...s, rfid: rfidValue } : s
      )
    );

    showStatus(`✅ Assigned to ${studentToAssign.name}`, "success");
    setRfid("");
    nextUnassignedIndexRef.current = currentIndex + 1;
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [rfid, students, showStatus]);

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

  const handleRemove = (student) => {
    setRawStudents(prev =>
      prev.map(s => (s.id === student.id ? { ...s, rfid: null } : s))
    );
    showStatus("RFID removed", "warning");
    nextUnassignedIndexRef.current = 0;
  };

  return (
    <div className="p-6 text-gray-100 bg-gray-900 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4">RFID Assignment</h2>

      {/* Pass .name arrays to FiltersBar */}
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
        searchRef={searchRef}
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