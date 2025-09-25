import { FaTimes } from "react-icons/fa";

export default function SelectedStudentCard({ student, clear }) {
  return (
    <div className="max-w-6xl mx-auto mb-4 p-4 bg-blue-900/30 rounded-lg border border-blue-700 flex justify-between items-center">
      <div>
        <p className="font-medium text-blue-300">Selected Student:</p>
        <p>
          {student.name} (Roll: {student.roll}, Adm: {student.adm})
        </p>
      </div>
      <button 
        onClick={clear} 
        className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded-lg text-sm flex items-center gap-2 transition-colors"
      >
        <FaTimes /> Clear
      </button>
    </div>
  );
}