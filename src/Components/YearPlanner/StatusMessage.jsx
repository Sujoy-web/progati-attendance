
// components/YearPlanner/StatusMessage.jsx
import React from "react";
import { FaCheckCircle, FaExclamationTriangle, FaTimes, FaSpinner } from "react-icons/fa";

export default function StatusMessage({ status, setStatus, loading }) {
  return (
    <>
      {status && (
        <div className={`fixed top-4 right-4 z-50 p-3 rounded-lg flex items-center gap-2 ${
          status.type === 'success' ? 'bg-green-800' : 'bg-red-800'
        }`}>
          {status.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
          <p>{status.msg}</p>
          <button onClick={() => setStatus(null)}><FaTimes /></button>
        </div>
      )}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-5 rounded-lg flex items-center gap-3">
            <FaSpinner className="animate-spin" />
            Processing...
          </div>
        </div>
      )}
    </>
  );
}