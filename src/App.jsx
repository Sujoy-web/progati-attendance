// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import RfidAttendancePage from "./pages/RfidAttendancePage";
import RfidReport from "./pages/ReportPage";
import AppLayout from "./Layout/AppLayout";
import RfidAssignPage from "./pages/RfidAssignPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<RfidAttendancePage/>} />
            <Route path="/assign" element={<RfidAssignPage/>} />
          <Route path="/attendance" element={<RfidAttendancePage />} />
          <Route path="/report" element={<RfidReport />} />
    
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
