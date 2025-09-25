
// components/YearPlanner/HolidayTable.jsx
import React from "react";

export default function HolidayTable({ 
  holidays, 
  toggleActive, 
  deleteHoliday, 
  startEditing, 
  editingId, 
  editForm, 
  setEditForm, 
  saveEdit, 
  calcDays 
}) {
  return (
    <div id="holidayTable" className="max-w-6xl mx-auto overflow-x-auto rounded-lg border border-gray-700 shadow">
      <table className="w-full text-sm">
        <thead className="bg-gray-800 text-gray-200">
          <tr>
            <th className="p-3 border-b border-gray-700 text-center">Sl</th>
            <th className="p-3 border-b border-gray-700 text-left">Holiday Name</th>
            <th className="p-3 border-b border-gray-700 text-left">Session</th>
            <th className="p-3 border-b border-gray-700 text-left">Start Date</th>
            <th className="p-3 border-b border-gray-700 text-left">End Date</th>
            <th className="p-3 border-b border-gray-700 text-center">Days</th>
            <th className="p-3 border-b border-gray-700 text-center">Active</th>
            <th className="p-3 border-b border-gray-700 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {holidays.length > 0 ? holidays.map((h, i) => (
            <tr key={h.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition">
              <td className="p-3 text-center">{i + 1}</td>
              <td className="p-3 text-left">
                {editingId === h.id ? (
                  <input 
                    value={editForm.name} 
                    onChange={e => setEditForm({...editForm, name: e.target.value})} 
                    className="bg-gray-700 p-1.5 rounded w-full text-white border border-gray-600"
                  />
                ) : h.name}
              </td>
              <td className="p-3 text-left">{h.session}</td>
              <td className="p-3 text-left">
                {editingId === h.id ? (
                  <input 
                    type="date" 
                    value={editForm.start} 
                    onChange={e => setEditForm({...editForm, start: e.target.value})} 
                    className="bg-gray-700 p-1.5 rounded text-white border border-gray-600"
                  />
                ) : h.start}
              </td>
              <td className="p-3 text-left">
                {editingId === h.id ? (
                  <input 
                    type="date" 
                    value={editForm.end} 
                    onChange={e => setEditForm({...editForm, end: e.target.value})} 
                    className="bg-gray-700 p-1.5 rounded text-white border border-gray-600"
                  />
                ) : h.end}
              </td>
              <td className="p-3 text-center">{calcDays(h.start, h.end)}</td>
              <td className="p-3 text-center">
                <input 
                  type="checkbox" 
                  checked={h.active} 
                  onChange={() => toggleActive(h.id)} 
                />
              </td>
              <td className="p-3 text-center">
                {editingId === h.id ? (
                  <button 
                    onClick={() => saveEdit(h.id)}
                    className="text-blue-400 hover:text-blue-300 mr-2"
                  >
                    Save
                  </button>
                ) : (
                  <button 
                    onClick={() => startEditing(h)}
                    className="text-yellow-400 hover:text-yellow-300 mr-2"
                  >
                    Edit
                  </button>
                )}
                <button 
                  onClick={() => deleteHoliday(h.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="8" className="p-6 text-center text-gray-500">No holidays found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}