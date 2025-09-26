import { useState, useEffect, useRef, useCallback } from "react";
import { FaCheckCircle, FaExclamationTriangle, FaTimes } from "react-icons/fa";

// Import services
import { assignApi } from "../services/assignApi";

// Import utils
import { getUniqueId } from "../utils/helpers";
import SelectedStudentCard from "../Components/Assign/SelectedStudentCard";
import SearchAndInput from "../Components/Assign/SearchAndInput";
import FiltersBar from "../Components/Assign/FilterBar";
import StudentsTable from "../Components/Assign/StudentsTable";

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
  const [loading, setLoading] = useState(false); // Only for initial load
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const inputRef = useRef(null);
  const searchRef = useRef(null);
  const rfidTimeoutRef = useRef(null);
  const studentsRef = useRef([]);
  const selectedStudentRef = useRef(null);
  const rfidRef = useRef("");
  const nextUnassignedIndexRef = useRef(0); // 👈 Track next student

  const showStatus = useCallback((msg, type) => {
    setStatus({ msg, type });
    setTimeout(() => setStatus(null), 3000);
  }, []);

  // ================== Core Logic ==================
const assignRfid = useCallback(async (shouldClearRfid = true) => {
  const rfidValue = rfidRef.current.trim();
  if (!rfidValue) {
    showStatus("Scan RFID first", "error");
    if (shouldClearRfid) setRfid("");
    inputRef.current?.focus();
    return;
  }

  // 🔒 Block if RFID is already used by ANY student (including the selected one)
  const isRfidAlreadyUsed = studentsRef.current.some(s => s.rfid === rfidValue);
  if (isRfidAlreadyUsed) {
    showStatus("This RFID is already assigned to another student", "error");
    if (shouldClearRfid) setRfid("");
    inputRef.current?.focus();
    return;
  }

  try {
    // ✅ Case 1: Manual selection
    if (selectedStudentRef.current) {
      const selected = selectedStudentRef.current;

      // ❌ Prevent assigning to a student who already has an RFID
      if (selected.rfid) {
        showStatus(`${selected.name} already has an RFID. Remove it first.`, "error");
        if (shouldClearRfid) setRfid("");
        inputRef.current?.focus();
        return;
      }

      // ✅ Safe to assign
      await assignApi.assignRfidToStudent(selected, rfidValue);
      setStudents(prev =>
        prev.map(s =>
          getUniqueId(s) === getUniqueId(selected) ? { ...s, rfid: rfidValue } : s
        )
      );
      showStatus(`RFID assigned to ${selected.name}`, "success");
      setSelectedStudent(null); // Clear selection after assignment
    }
    // ✅ Case 2: Auto-assign to next unassigned
    else {
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
      await assignApi.assignRfidToStudent(studentToAssign, rfidValue);

      setStudents(prev => {
        const updated = [...prev];
        updated[foundIndex].rfid = rfidValue;
        return updated;
      });

      nextUnassignedIndexRef.current = (foundIndex + 1) % currentList.length;
      showStatus(`RFID assigned to ${studentToAssign.name}`, "success");
    }

    // Clean up
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

  // Load dropdowns
  useEffect(() => {
    const loadDropdownOptions = async () => {
      try {
        const { classes, sections, sessions } = await assignApi.getDropdownOptions();
        setClasses(classes);
        setSections(sections);
        setSessions(sessions);
      } catch (error) {
        console.error("Error loading dropdown options:", error);
        showStatus("Failed to load options", "error");
      }
    };
    loadDropdownOptions();
  }, [showStatus]);

  // Load students (including when no filters)
  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      try {
        const loadedStudents = await assignApi.getStudents(classSel, sectionSel, sessionSel);
        setStudents(loadedStudents);
        setSelectedStudent(null);
        nextUnassignedIndexRef.current = 0; // Reset pointer on filter change
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
      await assignApi.removeRfidFromStudent(student);
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

  // Filtering
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
        loading={loading} // Only shows on initial load
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