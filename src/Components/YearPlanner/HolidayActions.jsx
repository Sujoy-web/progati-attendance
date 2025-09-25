import { FaDownload } from "react-icons/fa";
import { FiPrinter } from "react-icons/fi";

export default function HolidayActions({ searchTerm, setSearchTerm, exportCSV, printTable }) {
  return (
    <div className="max-w-6xl mx-auto mb-6 flex flex-col md:flex-row items-stretch md:items-center gap-4">
      <div className="flex items-center flex-1 bg-gray-800 rounded px-3 py-2 border border-gray-700">
        <input 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search by name or session..."
          className="w-full bg-transparent outline-none text-white placeholder-gray-400"
        />
      </div>
      <div className="flex gap-2">
        <button 
          onClick={exportCSV} 
          className="flex items-center gap-2 bg-green-700 hover:bg-green-600 px-4 py-2.5 rounded text-sm font-medium"
        >
          <FaDownload size={16} />
          Export CSV
        </button>
        <button 
          onClick={printTable} 
          className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 px-4 py-2.5 rounded text-sm font-medium"
        >
          <FiPrinter size={16} />
          Print
        </button>
      </div>
    </div>
  );
}
