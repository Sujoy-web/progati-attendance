import { useState, useEffect, useRef, useCallback } from "react";
import { FaCheckCircle, FaExclamationTriangle, FaTimes } from "react-icons/fa";

// Import utils & components (keep as-is)
import { getUniqueId } from "../utils/helpers";
import SelectedStudentCard from "../Components/Assign/SelectedStudentCard";
import SearchAndInput from "../Components/Assign/SearchAndInput";
import FiltersBar from "../Components/Assign/FilterBar";
import StudentsTable from "../Components/Assign/StudentsTable";

// ====== MOCK DATA (since backend doesn't provide these) ======
const MOCK_CLASSES = ['I', 'II', 'III', 'IV', 'V'];
const MOCK_SECTIONS = ['A', 'B'];
const MOCK_SESSIONS = ['2024-2025', '2025-2026'];

const MOCK_STUDENTS = [
  { id: 1, name: 'John Smith', roll: '01', adm: 'ADM000001', class: 'I', section: 'A', session: '2024-2025', rfid: '1001' },
  { id: 2, name: 'Emily Johnson', roll: '02', adm: 'ADM000002', class: 'II', section: 'B', session: '2024-2025', rfid: '' },
  { id: 3, name: 'Michael Brown', roll: '03', adm: 'ADM000003', class: 'III', section: 'A', session: '2025-2026', rfid: '3003' },
  { id: 4, name: 'Sarah Davis', roll: '04', adm: 'ADM000004', class: 'IV', section: 'A', session: '2024-2025', rfid: '' },
  { id: 5, name: 'Robert Wilson', roll: '05', adm: 'ADM000005', class: 'V', section: 'B', session: '2025-2026', rfid: '' },
];

export default function RfidAssignPage() {
  // ================== State ==================
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
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const inputRef = useRef(null);
  const searchRef = useRef(null);
  const rfidTimeoutRef = useRef(null);
  const studentsRef = useRef([]);
  const selectedStudentRef = useRef(null);
  const rfidRef = useRef("");
  const nextUnassignedIndexRef = useRef(0);

  const showStatus = useCallback((msg, type) => {
    setStatus({ msg, type });
    setTimeout(() => setStatus(null), 3000);
  }, []);

  // ================== REAL API CALLS (RFID only) ==================
  const assignRfidToStudent = async (student, rfidValue) => {
    const BASE_URL = import.meta.env.VITE_API_URL || '/api';
    const card = parseInt(rfidValue, 10);
    if (isNaN(card)) throw new Error("Invalid RFID number");

    const response = await fetch(`${BASE_URL}/assignments/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: student.id, card })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }
    return response.json();
  };

  const removeRfidFromStudent = async (student) => {
    const BASE_URL = import.meta.env.VITE_API_URL || '/api';
    
    // Get assignment by user_id
    const assignmentsRes = await fetch(`${BASE_URL}/assignments/user/${student.id}`);
    if (!assignmentsRes.ok) throw new Error("Failed to find assignment");
    
    const assignments = await assignmentsRes.json();
    if (!assignments.length) throw new Error("No assignment found");

    // Delete by assignment ID
    const deleteRes = await fetch(`${BASE_URL}/assignments/${assignments[0].id}`, {
      method: 'DELETE'
    });
    if (!deleteRes.ok) throw new Error("Failed to delete assignment");
    
    return { message: "Assignment deleted" };
  };

  // ================== Core Logic ==================
  const assignRfid = useCallback(async (shouldClearRfid = true) => {
    const rfidValue = rfidRef.current.trim();
    if (!rfidValue) {
      showStatus("Scan RFID first", "error");
      if (shouldClearRfid) setRfid("");
      inputRef.current?.focus();
      return;
    }

    const isRfidAlreadyUsed = studentsRef.current.some(s => s.rfid === rfidValue);
    if (isRfidAlreadyUsed) {
      showStatus("This RFID is already assigned to another student", "error");
      if (shouldClearRfid) setRfid("");
      inputRef.current?.focus();
      return;
    }

    try {
      if (selectedStudentRef.current) {
        const selected = selectedStudentRef.current;
        if (selected.rfid) {
          showStatus(`${selected.name} already has an RFID. Remove it first.`, "error");
          if (shouldClearRfid) setRfid("");
          inputRef.current?.focus();
          return;
        }

        await assignRfidToStudent(selected, rfidValue);
        setStudents(prev =>
          prev.map(s =>
            getUniqueId(s) === getUniqueId(selected) ? { ...s, rfid: rfidValue } : s
          )
        );
        showStatus(`RFID assigned to ${selected.name}`, "success");
        setSelectedStudent(null);
      } else {
        const currentList = studentsRef.current;
        let foundIndex = -1;
        const start = nextUnassignedIndexRef.current;

        for (let i = 0; i < currentList.length; i++) {
          const idx = (start + i) % currentList.length;
          if (!currentList[idx].rfid) {
            foundIndex = idx;
            break;
          }
        }

        if (foundIndex === -1) {
          showStatus("No unassigned student found", "error");
          if (shouldClearRfid) setRfid("");
          inputRef.current?.focus();
          return;
        }

        const studentToAssign = currentList[foundIndex];
        await assignRfidToStudent(studentToAssign, rfidValue);

        setStudents(prev => {
          const updated = [...prev];
          updated[foundIndex].rfid = rfidValue;
          return updated;
        });

        nextUnassignedIndexRef.current = (foundIndex + 1) % currentList.length;
        showStatus(`RFID assigned to ${studentToAssign.name}`, "success");
      }

      if (shouldClearRfid) setRfid("");
      inputRef.current?.focus();
    } catch (error) {
      console.error("Error assigning RFID:", error);
      showStatus("Failed to assign RFID. Try again.", "error");
      if (shouldClearRfid) setRfid("");
      inputRef.current?.focus();
    }
  }, [showStatus]);

  // ================== Effects ==================
  useEffect(() => {
    studentsRef.current = students;
  }, [students]);

  useEffect(() => {
    selectedStudentRef.current = selectedStudent;
  }, [selectedStudent]);

  useEffect(() => {
    rfidRef.current = rfid;
  }, [rfid]);

  // Load dropdowns (from MOCK)
  useEffect(() => {
    // Simulate async load
    const loadDropdownOptions = async () => {
      try {
        // In real app, this would be an API call.
        // For now, use mock data.
        setClasses(MOCK_CLASSES);
        setSections(MOCK_SECTIONS);
        setSessions(MOCK_SESSIONS);
      } catch (error) {
        console.error("Error loading dropdown options:", error);
        showStatus("Failed to load options", "error");
      }
    };
    loadDropdownOptions();
  }, [showStatus]);

  // Load students (from MOCK, filtered)
  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      try {
        let loaded = [...MOCK_STUDENTS];
        if (classSel) loaded = loaded.filter(s => s.class === classSel);
        if (sectionSel) loaded = loaded.filter(s => s.section === sectionSel);
        if (sessionSel) loaded = loaded.filter(s => s.session === sessionSel);
        setStudents(loaded);
        setSelectedStudent(null);
        nextUnassignedIndexRef.current = 0;
      } catch (error) {
        console.error("Error loading students:", error);
        showStatus("Failed to load students", "error");
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [classSel, sectionSel, sessionSel, showStatus]);

  // Auto-assign on RFID input
  useEffect(() => {
    if (rfid.trim()) {
      if (rfidTimeoutRef.current) clearTimeout(rfidTimeoutRef.current);
      rfidTimeoutRef.current = setTimeout(() => assignRfid(true), 300);
    }
    return () => {
      if (rfidTimeoutRef.current) clearTimeout(rfidTimeoutRef.current);
    };
  }, [rfid, assignRfid]);

  // Handle remove
  const handleRemove = async (student) => {
    try {
      await removeRfidFromStudent(student);
      setStudents(prev =>
        prev.map(s =>
          getUniqueId(s) === getUniqueId(student) ? { ...s, rfid: "" } : s
        )
      );
      showStatus(`RFID removed from ${student.name}`, "success");
      inputRef.current?.focus();
    } catch (error) {
      console.error("Error removing RFID:", error);
      showStatus("Failed to remove RFID", "error");
    }
  };

  const selectFirstMatchingStudent = () => {
    if (!searchTerm.trim()) return;
    const found = students.find(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.roll.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.adm.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (found) {
      setSelectedStudent(found);
      showStatus(`Selected: ${found.name}`, "success");
    } else {
      setSelectedStudent(null);
      showStatus("No student found", "error");
    }
    inputRef.current?.focus();
  };

  const handleRowDoubleClick = (student) => {
    setSelectedStudent(student);
    showStatus(`Selected: ${student.name}`, "success");
    inputRef.current?.focus();
  };

  const filtered = students.filter((s) => {
    const matchesSearch =
      !searchTerm ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.roll.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.adm.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "assigned") return matchesSearch && s.rfid;
    if (filter === "unassigned") return matchesSearch && !s.rfid;
    return matchesSearch;
  });

  // ================== JSX ==================
  return (
    <div className="p-4 sm:p-6 bg-gray-900 min-h-screen text-gray-100">
      {/* Status */}
      {status && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 ${
            status.type === "success" ? "bg-green-800" : "bg-red-800"
          }`}
        >
          {status.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />}
          <p className="text-white">{status.msg}</p>
          <button onClick={() => setStatus(null)} className="ml-2 text-white hover:text-gray-200">
            <FaTimes />
          </button>
        </div>
      )}

      <FiltersBar
        classes={classes}
        sections={sections}
        sessions={sessions}
        classSel={classSel}
        sectionSel={sectionSel}
        sessionSel={sessionSel}
        filter={filter}
        setClassSel={setClassSel}
        setSectionSel={setSectionSel}
        setSessionSel={setSessionSel}
        setFilter={setFilter}
      />

      <SearchAndInput
        searchRef={searchRef}
        inputRef={inputRef}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        clearSearch={() => {
          setSearchTerm("");
          setSelectedStudent(null);
          searchRef.current?.focus();
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
          clear={() => {
            setSelectedStudent(null);
            inputRef.current?.focus();
          }}
        />
      )}

      <div className="max-w-6xl mx-auto mb-3">
        <p className="text-sm text-gray-400">
          Showing {filtered.length} of {students.length} students
          {searchTerm && ` matching "${searchTerm}"`} | Double-click to select
        </p>
      </div>

      <StudentsTable
        students={filtered}
        selectedStudent={selectedStudent}
        handleRowDoubleClick={handleRowDoubleClick}
        handleRemove={handleRemove}
        loading={loading}
        getUniqueId={getUniqueId}
      />
    </div>
  );
}