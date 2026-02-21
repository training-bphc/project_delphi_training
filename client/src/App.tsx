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

type TrainingRecord = {
  S_no: number;
  name: string;
  bits_id: string;
  email_id: string;
  date: string;
  category: string;
  added_by: string;
  verification_status: string;
  points: number;
};

// Main App component sets up routing and layout
// Context for global records state
export const RecordsContext = createContext<any>(null);

function App() {
  const [records, setRecords] = useState<TrainingRecord[]>([]);

  const fetchRecords = async () => {
    const response = await fetch("/api/records");
    if (!response.ok) {
      throw new Error("Failed to fetch records");
    }

    const payload = await response.json();
    setRecords(payload.data ?? []);
  };

  useEffect(() => {
    fetchRecords().catch((error) => {
      console.error("Unable to load records", error);
    });
  }, []);

  // Toggle handler: move to verified and increment points
  const handleVerify = async (row: TrainingRecord) => {
    const response = await fetch(`/api/records/${row.S_no}/verify`, {
      method: "PATCH",
    });

    if (!response.ok) {
      throw new Error("Failed to verify record");
    }

    const payload = await response.json();
    const updatedRecord = payload.data as TrainingRecord;

    setRecords((prev) =>
      prev.map((record) =>
        record.S_no === updatedRecord.S_no ? updatedRecord : record,
      ),
    );
  };

  return (
    <RecordsContext.Provider
      value={{ records, setRecords, handleVerify, refreshRecords: fetchRecords }}
    >
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
