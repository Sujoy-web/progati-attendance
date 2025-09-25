import { useState, useEffect, useRef } from "react";
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
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const inputRef = useRef(null);
  const searchRef = useRef(null);

  // ================== Effects ==================
  // Load dropdown values on mount
  useEffect(() => {
    const loadDropdownOptions = async () => {
      try {
        const { classes, sections, sessions } =
          await assignApi.getDropdownOptions();
        setClasses(classes);
        setSections(sections);
        setSessions(sessions);
      } catch (error) {
        console.error("Error loading dropdown options:", error);
        showStatus("Failed to load options", "error");
      }
    };

    loadDropdownOptions();
  }, []);

  // Load students when filters change
  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      try {
        const loadedStudents = await assignApi.getStudents(
          classSel,
          sectionSel,
          sessionSel
        );
        setStudents(loadedStudents);
        setSelectedStudent(null);
      } catch (error) {
        console.error("Error loading students:", error);
        showStatus("Failed to load students", "error");
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [classSel, sectionSel, sessionSel]);

  useEffect(() => {
    if (classSel || sectionSel || sessionSel) {
      inputRef.current?.focus();
    }
  }, [classSel, sectionSel, sessionSel]);

  // ================== Utilities ==================
  const showStatus = (msg, type) => {
    setStatus({ msg, type });
    setTimeout(() => setStatus(null), 3000);
  };

  // ================== Core Logic ==================
  const assignRfid = async () => {
    if (!rfid.trim()) return showStatus("Scan RFID first", "error");

    try {
      setLoading(true);

      if (selectedStudent) {
        // Assign to selected student via REAL API
        await assignApi.assignRfidToStudent(selectedStudent, rfid.trim());
        const updated = students.map((s) =>
          getUniqueId(s) === getUniqueId(selectedStudent)
            ? { ...s, rfid: rfid.trim() }
            : s
        );
        setStudents(updated);
        showStatus(`RFID assigned to ${selectedStudent.name}`, "success");
        setRfid("");
        setSelectedStudent(null);
        inputRef.current?.focus();
        return;
      }

      // Auto-assign to first unassigned student
      const idx = students.findIndex((s) => !s.rfid);
      if (idx < 0) {
        setRfid("");
        inputRef.current?.focus();
        showStatus("No unassigned student", "error");
        return;
      }

      const studentToAssign = students[idx];
      await assignApi.assignRfidToStudent(studentToAssign, rfid.trim());
      const updated = [...students];
      updated[idx].rfid = rfid.trim();
      setStudents(updated);
      showStatus(`RFID assigned to ${updated[idx].name}`, "success");
      setRfid("");
      inputRef.current?.focus();
    } catch (error) {
      console.error("Error assigning RFID:", error);
      showStatus("Failed to assign RFID", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (student) => {
    try {
      setLoading(true);
      await assignApi.removeRfidFromStudent(student);
      const updated = students.map((s) =>
        getUniqueId(s) === getUniqueId(student) ? { ...s, rfid: "" } : s
      );
      setStudents(updated);
      showStatus(`RFID removed from ${student.name}`, "success");
      inputRef.current?.focus();
    } catch (error) {
      console.error("Error removing RFID:", error);
      showStatus("Failed to remove RFID", "error");
    } finally {
      setLoading(false);
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
      inputRef.current?.focus();
    } else {
      setSelectedStudent(null);
      showStatus("No student found", "error");
      inputRef.current?.focus();
    }
  };

  const handleRowDoubleClick = (student) => {
    setSelectedStudent(student);
    showStatus(`Selected: ${student.name}`, "success");
    inputRef.current?.focus();
  };

  // ================== Filtering ==================
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

  // ================== JSX ==================
  return (
    <div className="p-4 sm:p-6 bg-gray-900 min-h-screen text-gray-100">
      {/* Status message */}
      {status && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 ${
            status.type === "success" ? "bg-green-800" : "bg-red-800"
          }`}
        >
          <div className="text-xl">
            {status.type === "success" ? (
              <FaCheckCircle />
            ) : (
              <FaExclamationTriangle />
            )}
          </div>
          <p className="text-white">{status.msg}</p>
          <button
            onClick={() => setStatus(null)}
            className="ml-2 text-white hover:text-gray-200"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Filters */}
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

      {/* Content */}
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

      {/* Selected card */}
      {selectedStudent && (
        <SelectedStudentCard
          student={selectedStudent}
          clear={() => {
            setSelectedStudent(null);
            inputRef.current?.focus();
          }}
        />
      )}

      {/* Info */}
      <div className="max-w-6xl mx-auto mb-3">
        <p className="text-sm text-gray-400">
          Showing {filtered.length} of {students.length} students
          {searchTerm && ` matching "${searchTerm}"`} | Double-click to select
        </p>
      </div>

      {/* Table */}
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
