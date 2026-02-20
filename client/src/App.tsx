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
import { createContext, useEffect, useState } from "react";
import sampleData from "./sampleDataBase/sampleData.json";

// Main App component sets up routing and layout
// Context for global records state
export const RecordsContext = createContext<any>(null);

function App() {
  const [records, setRecords] = useState<any[]>([]);
  useEffect(() => {
    setRecords(sampleData);
  }, []);

  // Toggle handler: move to verified and increment points
  const handleVerify = (row: any) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.S_no === row.S_no
          ? {
              ...r,
              verification_status: "Verified",
              points: (r.points || 0) + 10,
            }
          : r,
      ),
    );
  };

  return (
    <RecordsContext.Provider value={{ records, setRecords, handleVerify }}>
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<Overview />} />
            <Route
              path="/new-student-requests"
              element={<NewandPendingRequestsTab />}
            />
            <Route
              path="/pending-records"
              element={<NewandPendingRequestsTab />}
            />
            <Route
              path="/previous-verifications"
              element={<PreviousVerificationsTab />}
            />
          </Routes>
        </AppLayout>
      </Router>
    </RecordsContext.Provider>
  );
}

export default App;
