import { Link, useLocation } from "react-router-dom";
import { FaUserCheck, FaIdCard, FaClock } from "react-icons/fa";

export default function Sidebar() {
  const location = useLocation();

  const links = [
    { path: "/assign", label: "RFID Assignment", icon: <FaIdCard /> },
        { path: "/yearplanner", label: "Year Planner", icon: <FaIdCard /> },
        { path: "/timesetup", label: "Time Setup", icon: <FaClock /> },
         { path: "/mattendance", label: "RFID ATTENDANCE", icon: <FaClock /> },
    
  ];

  return (
    <aside className="h-full w-64 bg-gray-900 text-white flex flex-col shadow-lg">
      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {links.map((link) => {
          const active = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center px-4 py-3 rounded-lg space-x-3 transition-colors ${
                active ? "bg-blue-600 text-white" : "hover:bg-gray-700"
              }`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 text-sm text-gray-400 border-t border-gray-700">
        © {new Date().getFullYear()} Smart System
      </div>
    </aside>
  );
}
