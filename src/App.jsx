// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import RfidAttendancePage from "./pages/RfidAttendancePage";
import RfidReport from "./pages/ReportPage";
import AppLayout from "./Layout/AppLayout";
import RfidAssignPage from "./pages/RfidAssignPage";
import AttendanceTimeSetup from "./components/AttendanceTimeSetup";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<RfidAttendancePage/>} />
            <Route path="/assign" element={<RfidAssignPage/>} />
          <Route path="/attendance" element={<RfidAttendancePage />} />
          <Route path="/report" element={<RfidReport />} />
             <Route path="/timesetup" element={<AttendanceTimeSetup />} />
    
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
