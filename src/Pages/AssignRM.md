// src/pages/AssignPageDemo.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { FaCheckCircle, FaExclamationTriangle, FaTimes } from "react-icons/fa";

import FiltersBar from "../Components/Assign/FilterBar";
import SearchAndInput from "../Components/Assign/SearchAndInput";
import SelectedStudentCard from "../Components/Assign/SelectedStudentCard";
import StudentsTable from "../Components/Assign/StudentsTable";
import { getUniqueId } from "../utils/helpers";

// Use VITE env or fallback (remove trailing space!)
const BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:3000/api";

// Simple fetch wrapper with auth
const makeApiRequest = async (url, options = {}) => {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  
  // Add timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  try {
    const response = await fetch(fullUrl, {
      ...config,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle 401 unauthorized
    if (response.status === 401) {
      console.warn('401 Unauthorized - removing tokens');
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data, status: response.status };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

// API methods
const apiClient = {
  post: async (url, data, options = {}) => {
    return makeApiRequest(url, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  },
  
  delete: async (url, options = {}) => {
    return makeApiRequest(url, {
      method: 'DELETE',
      ...options,
    });
  },
};

export default function AssignPage() {
  // Hardcoded mock data — no API fetches for dropdowns
  const MOCK_CLASSES = ["Class V", "Class VI", "Class VII"];
  const MOCK_SECTIONS = ["A", "B", "C"];
  const MOCK_SESSIONS = ["2024–2025", "2025–2026"];

  const MOCK_STUDENTS_TEMPLATE = [
    { id: 1, name: "Alice Johnson", roll: "01", adm: "ADM1001", rfid: null, assignment_id: null },
    { id: 2, name: "Bob Smith", roll: "02", adm: "ADM1002", rfid: null, assignment_id: null },
    { id: 3, name: "Charlie Brown", roll: "03", adm: "ADM1003", rfid: null, assignment_id: null },
    { id: 4, name: "Diana Prince", roll: "04", adm: "ADM1004", rfid: null, assignment_id: null },
    { id: 5, name: "Ethan Hunt", roll: "05", adm: "ADM1005", rfid: null, assignment_id: null },
  ];

  const [classSel, setClassSel] = useState("");
  const [sectionSel, setSectionSel] = useState("");
  const [sessionSel, setSessionSel] = useState("");
  const [filter, setFilter] = useState("all");
  const [rawStudents, setRawStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [rfid, setRfid] = useState("");
  const [status, setStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const inputRef = useRef(null);
  const nextUnassignedIndexRef = useRef(0);

  // Initialize students when filters selected
  useEffect(() => {
    if (classSel && sectionSel && sessionSel) {
      const students = MOCK_STUDENTS_TEMPLATE.map((s) => ({
        ...s,
        class: classSel,
        section: sectionSel,
        session: sessionSel,
      }));
      setRawStudents(students);
    } else {
      setRawStudents([]);
    }
    setSelectedStudent(null);
  }, [classSel, sectionSel, sessionSel]);

  // Auto-focus RFID input
  useEffect(() => {
    if (rawStudents.length > 0) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [rawStudents]);

  // Reset assignment pointer
  useEffect(() => {
    nextUnassignedIndexRef.current = 0;
  }, [classSel, sectionSel, sessionSel, filter, rawStudents]);

  const students = rawStudents.filter((s) =>
    filter === "assigned" ? s.rfid : filter === "unassigned" ? !s.rfid : true
  );

  const showStatus = useCallback((msg, type) => {
    setStatus({ msg, type });
    setTimeout(() => setStatus(null), 2500);
  }, []);

  const assignRfid = useCallback(async () => {
    const rfidValue = rfid.trim();
    if (!rfidValue) return;

    const unassigned = students.filter((s) => !s.rfid);
    if (unassigned.length === 0) {
      showStatus("No unassigned students left", "error");
      setRfid("");
      return;
    }

    const idx = nextUnassignedIndexRef.current % unassigned.length;
    const student = unassigned[idx];

    // Optimistic UI update
    setRawStudents((prev) =>
      prev.map((s) => (s.id === student.id ? { ...s, rfid: rfidValue } : s))
    );
    setRfid("");
    nextUnassignedIndexRef.current = idx + 1;

    try {
      // Send as query parameters instead of request body
      const cardNumber = parseInt(rfidValue, 10);
      if (isNaN(cardNumber) || cardNumber <= 0) {
        showStatus("Invalid card number", "error");
        return;
      }

      // Use query parameters for the API call
      const result = await apiClient.post(
        `/assignments/?user_id=${student.id}&card_number=${cardNumber}`
      );
      const assignmentId = result.data.id;

      setRawStudents((prev) =>
        prev.map((s) =>
          s.id === student.id ? { ...s, assignment_id: assignmentId } : s
        )
      );

      showStatus(`✅ Assigned to ${student.name}`, "success");
    } catch (error) {
      // Revert on error
      setRawStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, rfid: null } : s))
      );
      showStatus(`Assignment failed: ${error.message}`, "error");
    } finally {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [rfid, students, showStatus]);

  useEffect(() => {
    if (rfid.trim()) {
      const timeout = setTimeout(assignRfid, 300);
      return () => clearTimeout(timeout);
    }
  }, [rfid, assignRfid]);

  const handleRemove = useCallback(
    async (student) => {
      if (!student.assignment_id) {
        setRawStudents((prev) =>
          prev.map((s) => (s.id === student.id ? { ...s, rfid: null } : s))
        );
        showStatus("RFID removed (local)", "warning");
        return;
      }

      setRawStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, rfid: null, assignment_id: null } : s))
      );

      try {
        await apiClient.delete(`/assignments/${student.assignment_id}`);
        showStatus("Assignment deleted", "success");
      } catch (error) {
        setRawStudents((prev) =>
          prev.map((s) =>
            s.id === student.id
              ? { ...s, rfid: student.rfid, assignment_id: student.assignment_id }
              : s
          )
        );
        showStatus(`Delete failed: ${error.message}`, "error");
      }
    },
    [showStatus]
  );

  const selectFirstMatchingStudent = () => {
    if (!searchTerm.trim()) return;
    const term = searchTerm.toLowerCase();
    const match = students.find(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.roll.includes(term) ||
        s.adm.toLowerCase().includes(term)
    );
    if (match) {
      setSelectedStudent(match);
      showStatus(`Selected: ${match.name}`, "success");
    } else {
      showStatus("No student found", "error");
    }
  };

  return (
    <div className="p-6 text-gray-100 bg-gray-900 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4">RFID Assignment</h2>

      <FiltersBar
        classes={MOCK_CLASSES}
        sections={MOCK_SECTIONS}
        sessions={MOCK_SESSIONS}
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
          onClick={() => {
            if (!classSel || !sectionSel || !sessionSel) {
              showStatus("Please select class, section, and session", "error");
            }
          }}
          disabled={!!(classSel && sectionSel && sessionSel)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 rounded-lg font-medium transition-colors"
        >
          {classSel && sectionSel && sessionSel ? "Students Loaded" : "Select Filters"}
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
        loading={false}
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
        loading={false}
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