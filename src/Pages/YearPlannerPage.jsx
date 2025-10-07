// pages/YearPlannerPage.jsx
import React, { useState, useEffect } from "react";

// Define API base URL directly in this file
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// --- Inline API Functions ---
const fetchSessions = async () => {
  const response = await fetch(`${API_BASE_URL}/sessions`);
  if (!response.ok) throw new Error('Failed to fetch sessions');
  return response.json();
};

const fetchHolidays = async () => {
  const response = await fetch(`${API_BASE_URL}/holidays`);
  if (!response.ok) throw new Error('Failed to fetch holidays');
  return response.json();
};

const createHoliday = async (holidayData) => {
  const response = await fetch(`${API_BASE_URL}/holidays`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(holidayData),
  });
  if (!response.ok) throw new Error('Failed to create holiday');
  return response.json();
};

const updateHoliday = async (id, holidayData) => {
  const response = await fetch(`${API_BASE_URL}/holidays/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(holidayData),
  });
  if (!response.ok) throw new Error('Failed to update holiday');
  return response.json();
};

const deleteHoliday = async (id) => {
  const response = await fetch(`${API_BASE_URL}/holidays/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete holiday');
  return true;
};

const toggleHolidayStatus = async (id) => {
  const response = await fetch(`${API_BASE_URL}/holidays/${id}/toggle-status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('Failed to toggle holiday status');
  return response.json();
};

// --- Components ---
import HolidayTable from "../Components/YearPlanner/HolidayTable";
import HolidayActions from "../Components/YearPlanner/HolidayActions";
import HolidayForm from "../Components/YearPlanner/HolidayForm";
import StatusMessage from "../Components/YearPlanner/StatusMessage";

export default function YearPlannerPage() {
  const [holidays, setHolidays] = useState([]);
  const [sessions, setSessions] = useState([]); // [{ id, name }]
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", start: "", end: "" });

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

  // Load sessions and holidays on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [sessionsData, holidaysData] = await Promise.all([
          fetchSessions(),
          fetchHolidays()
        ]);

        const enrichedHolidays = holidaysData.map(holiday => {
          const session = sessionsData.find(s => s.id === holiday.session_id);
          return {
            ...holiday,
            session_name: session ? session.name : "Unknown Session"
          };
        });

        setSessions(sessionsData);
        setHolidays(enrichedHolidays);
      } catch (error) {
        showStatus("Failed to load data", "error");
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, []);

  // CRUD: Add Holiday
  const addHoliday = async ({ session_id, name, start, end }) => {
    if (!session_id || !name || !start || !end) {
      return showStatus("Fill all fields", "error");
    }
    
    try {
      setLoading(true);
      const newHoliday = await createHoliday({ session_id, name, start, end });
      
      const session = sessions.find(s => s.id === session_id);
      const enrichedHoliday = {
        ...newHoliday,
        session_name: session ? session.name : "Unknown Session"
      };

      setHolidays(prev => [...prev, enrichedHoliday]);
      showStatus("Holiday added successfully", "success");
    } catch (error) {
      showStatus("Failed to add holiday", "error");
      console.error("Error adding holiday:", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle active status
  const toggleActive = async (id) => {
    try {
      const updatedHoliday = await toggleHolidayStatus(id);
      const session = sessions.find(s => s.id === updatedHoliday.session_id);
      const enriched = {
        ...updatedHoliday,
        session_name: session ? session.name : "Unknown Session"
      };
      setHolidays(prev => 
        prev.map(holiday => 
          holiday.id === id ? enriched : holiday
        )
      );
    } catch (error) {
      showStatus("Failed to update status", "error");
      console.error("Error toggling status:", error);
    }
  };

  // Delete holiday
  const handleDeleteHoliday = async (id) => {
    try {
      await deleteHoliday(id);
      setHolidays(prev => prev.filter(holiday => holiday.id !== id));
      showStatus("Holiday deleted", "success");
    } catch (error) {
      showStatus("Failed to delete holiday", "error");
      console.error("Error deleting holiday:", error);
    }
  };

  // Edit helpers
  const startEditing = (h) => {
    setEditingId(h.id);
    setEditForm({ name: h.name, start: h.start, end: h.end });
  };

  const saveEdit = async (id) => {
    try {
      setLoading(true);
      const updatedHoliday = await updateHoliday(id, editForm);
      
      const session = sessions.find(s => s.id === updatedHoliday.session_id);
      const enriched = {
        ...updatedHoliday,
        session_name: session ? session.name : "Unknown Session"
      };

      setHolidays(prev => 
        prev.map(holiday => 
          holiday.id === id ? enriched : holiday
        )
      );
      setEditingId(null);
      showStatus("Holiday updated", "success");
    } catch (error) {
      showStatus("Failed to update holiday", "error");
      console.error("Error updating holiday:", error);
    } finally {
      setLoading(false);
    }
  };

  // Export to CSV
  const exportCSV = () => {
    const headers = ["Sl", "Holiday Name", "Session", "Start Date", "End Date", "Total Days"];
    const activeHolidays = holidays.filter((h) => h.active);
    const csvContent = [
      headers.join(","),
      ...activeHolidays.map((h, i) => [
        i + 1,
        `"${h.name}"`,
        `"${h.session_name}"`,
        h.start,
        h.end,
        calcDays(h.start, h.end),
      ].join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "HolidayPlanner.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showStatus("Exported to CSV successfully", "success");
  };

  // Print table
  const printTable = () => {
    const table = document.getElementById("holidayTable")?.cloneNode(true);
    if (!table) return;
    
    const newWin = window.open("", "_blank", "width=900,height=700");
    newWin.document.write(`<html><head><title>Holiday Planner</title><style>
      body{font-family:Arial,sans-serif;padding:20px;color:#333;}
      table{width:100%;border-collapse:collapse;margin-bottom:20px;}
      th,td{border:1px solid #ddd;padding:8px;text-align:left;}
      th{background-color:#2d3748;color:white;}
    </style></head><body><h2>Holiday Planner</h2>`);
    newWin.document.write(table.outerHTML);
    newWin.document.write("</body></html>");
    newWin.document.close();
    setTimeout(() => newWin.print(), 250);
  };

  // Filter holidays
  const filtered = holidays.filter(
    (h) =>
      searchTerm === "" ||
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.session_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
      <StatusMessage status={status} setStatus={setStatus} loading={loading} />

      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Holiday Planner</h1>
        <p className="text-gray-400">Manage and track holidays for academic sessions</p>
      </div>

      <HolidayForm 
        sessions={sessions} 
        addHoliday={addHoliday} 
        loading={loading} 
      />
      
      <HolidayActions
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        exportCSV={exportCSV}
        printTable={printTable}
      />
      
      <HolidayTable
        holidays={filtered}
        toggleActive={toggleActive}
        deleteHoliday={handleDeleteHoliday}
        startEditing={startEditing}
        editingId={editingId}
        editForm={editForm}
        setEditForm={setEditForm}
        saveEdit={saveEdit}
        calcDays={calcDays}
      />

      {filtered.length > 0 && (
        <div id="tableFooter" className="bg-gray-800 text-gray-200 p-4 text-center mt-2">
          Total active holidays: {filtered.filter((h) => h.active).length} | Total days:{" "}
          {filtered.filter((h) => h.active).reduce((sum, h) => sum + calcDays(h.start, h.end), 0)}
        </div>
      )}
    </div>
  );
}