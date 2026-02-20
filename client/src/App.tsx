import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AppLayout from "./frontEnd/components/AppLayout";
import Overview from "./frontEnd/views/training_points/Overview";
import NewandPendingRequestsTab from "./frontEnd/views/training_points/tabs/NewandPendingRequestsTab";
import PreviousVerificationsTab from "./frontEnd/views/training_points/tabs/PreviousVerificationsTab";

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
          {/* Route for New and Pending Requests tab (merged) */}
          <Route
            path="/new-student-requests"
            element={<NewandPendingRequestsTab />}
          />
          <Route
            path="/pending-records"
            element={<NewandPendingRequestsTab />}
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
