// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./Layout/AppLayout";
import AssignPage from "./Pages/AssignPage";
import YearPlannerPage from "./Pages/YearPlannerPage";
import TimeSetupPage from "./Pages/TimeSetupPage";

import Signin from "./Components/Signin/Signin";
import CardSignin from "./Components/Signin/CardSignin";
import RfidAttendancePage from "./Pages/RfidAttendancePage";
import AssignPageDemo from "./Pages/AssignPageDemo";
import YearPlannerDemo from "./Pages/YearPlannerDemo";
import ManualAttendance from "./Pages/ManualAttendance";

function App() {
  return (
    <div className="relative">
      <Router>
        <Routes>
          {/* Public routes - no layout */}
          <Route path="/" element={<CardSignin />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/card-signin" element={<CardSignin />} />
          <Route path="/mattendance" element={<ManualAttendance />} />
          <Route path="/attendance" element={<RfidAttendancePage />} />
          {/* Protected routes with layout */}
          <Route element={<AppLayout />}>
            <Route path="/assign" element={<AssignPage />} />
            <Route path="/assignDemo" element={<AssignPageDemo />} />
            <Route path="/yearplanner" element={<YearPlannerPage />} />
            <Route path="/yearplannerDemo" element={<YearPlannerDemo />} />
            <Route path="/timesetup" element={<TimeSetupPage />} />

            <Route path="/attendance" element={<RfidAttendancePage />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
