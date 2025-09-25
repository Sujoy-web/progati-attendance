// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./Layout/AppLayout";
import AssignPage from "./Pages/AssignPage";
import YearPlannerPage from './Pages/YearPlannerPage';
import TimeSetupPage from './Pages/TimeSetupPage';
import Signup from './Components/SignupPage/Signup';
import Signin from './Components/Signin/Signin';
import RfidAttendancePage from './Pages/RfidAttendancePage';

function App() {
  return (
    <div className="relative">
      <Router>
        <Routes>
          {/* Public routes - no layout */}
          <Route path="/" element={<Signin />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/attendance" element={<RfidAttendancePage />} />
          {/* Protected routes with layout */}
          <Route element={<AppLayout />}>
            <Route path="/assign" element={<AssignPage />} />
            <Route path="/yearplanner" element={<YearPlannerPage />} />
            <Route path="/timesetup" element={<TimeSetupPage />} />
            <Route path="/attendance" element={<RfidAttendancePage />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
