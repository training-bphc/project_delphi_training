import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Overview from "./views/training_points/Overview";
import NewStudentRequestTab from "./views/training_points/tabs/NewStudentRequestTab";
import PendingRecordsForVerificationTab from "./views/training_points/tabs/PendingRecordsForVerificationTab";
import PreviousVerificationsTab from "./views/training_points/tabs/PreviousVerificationsTab";

// Main App component sets up routing and layout
function App() {
  return (
    <Router>
      {/* AppLayout provides sidebar and main content area */}
      <AppLayout>
        <Routes>
          {/* Redirect root to /overview */}
          <Route path="/" element={<Navigate to="/overview" replace />} />
          {/* Route for Overview tab */}
          <Route path="/overview" element={<Overview />} />
          {/* Route for New Student Requests tab */}
          <Route
            path="/new-student-requests"
            element={<NewStudentRequestTab />}
          />
          {/* Route for Pending Records for Verification tab */}
          <Route
            path="/pending-records"
            element={<PendingRecordsForVerificationTab />}
          />
          {/* Route for Previous Verifications tab */}
          <Route
            path="/previous-verifications"
            element={<PreviousVerificationsTab />}
          />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
