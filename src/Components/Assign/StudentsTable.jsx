import { FaSearch, FaTrash } from "react-icons/fa";

export default function StudentsTable({ 
  students, selectedStudent, handleRowDoubleClick, 
  handleRemove, loading, getUniqueId 
}) {
  return (
    <div className="max-w-6xl mx-auto overflow-x-auto rounded-lg border border-gray-700">
      <table className="w-full text-sm">
        <thead className="bg-gray-800">
          <tr>
            <th className="p-3 text-left">#</th>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Roll</th>
            <th className="p-3 text-left">ADM</th>
            <th className="p-3 text-left">Class</th>
            <th className="p-3 text-left">Section</th>
            <th className="p-3 text-left">Session</th>
            <th className="p-3 text-left">RFID</th>
            <th className="p-3 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="9" className="p-8 text-center text-gray-400">
                Loading students...
              </td>
            </tr>
          ) : students.length > 0 ? (
            students.map((s, i) => (
              <tr
                key={getUniqueId(s)}
                className={`border-t border-gray-700 hover:bg-gray-800/50 cursor-pointer transition-colors ${
                  selectedStudent && getUniqueId(selectedStudent) === getUniqueId(s)
                    ? "bg-blue-900/20" 
                    : ""
                }`}
                onDoubleClick={() => handleRowDoubleClick(s)}
              >
                <td className="p-3">{i + 1}</td>
                <td className="p-3">{s.name}</td>
                <td className="p-3">{s.roll}</td>
                <td className="p-3 font-mono">{s.adm}</td>
                <td className="p-3">{s.class}</td>
                <td className="p-3">{s.section}</td>
                <td className="p-3">{s.session}</td>
                <td className="p-3">
                  {s.rfid ? (
                    <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded-md text-xs font-mono">
                      {s.rfid}
                    </span>
                  ) : (
                    <span className="text-gray-500 text-xs">Not assigned</span>
                  )}
                </td>
                <td className="p-3 text-center">
                  {s.rfid && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(s);
                      }} 
                      className="px-3 py-1 bg-red-700 hover:bg-red-600 rounded text-xs flex gap-1 mx-auto transition-colors"
                    >
                      <FaTrash /> Remove
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="p-8 text-center text-gray-500">
                <div className="flex flex-col items-center">
                  <FaSearch className="text-3xl mb-2" />
                  <p>No students found</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}