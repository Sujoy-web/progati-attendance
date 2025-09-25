import { FaSearch, FaTimes } from "react-icons/fa";

export default function SearchAndInput({ 
  searchRef, inputRef, searchTerm, setSearchTerm, 
  clearSearch, selectFirstMatchingStudent, 
  rfid, setRfid, assignRfid, loading 
}) {
  return (
    <div className="max-w-6xl mx-auto mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2 relative">
        <div className="relative flex items-center">
          <FaSearch className="absolute left-3 text-gray-400" />
          <input
            ref={searchRef}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && selectFirstMatchingStudent()}
            placeholder="Search by name, roll, adm..."
            className="w-full pl-10 pr-10 py-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100"
          />
          {searchTerm && (
            <button 
              onClick={clearSearch} 
              className="absolute right-3 text-gray-400 hover:text-gray-200"
            >
              <FaTimes />
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">Press Enter to select first match</p>
      </div>

      <div>
        <input
          ref={inputRef}
          value={rfid}
          onChange={(e) => setRfid(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && assignRfid()}
          placeholder="Scan RFID..."
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 font-mono text-gray-100"
          disabled={loading}
        />
        <p className="text-xs text-gray-500 mt-1">Press Enter to assign</p>
      </div>
    </div>
  );
}