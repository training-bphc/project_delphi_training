import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import AppLayout from "./layout/AppLayout";
import Login from "@/views/login/Login";
import AdminOverview from "@/views/admin/TrainingPoints";
import AddTrainingPoints from "@/views/admin/AddTrainingPoints";
import AddPointsSingle from "@/views/admin/AddPointsSingle";
import AddPointsCSV from "@/views/admin/AddPointsCSV";
import PendingRequests from "@/views/admin/PendingRequests";
import VerifiedRequests from "@/views/admin/VerifiedRequests";
import AdminResources from "@/views/admin/Resources";
import StudentTrainingPoints from "@/views/student/TrainingPoints";
import AddVerification from "@/views/student/AddVerification";
import StudentResources from "@/views/student/Resources";

function RoutingContent() {
  const { user, token, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
    );
  }

  // Not logged in - show login
  if (!token || !user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Logged in - show role-based layout
  return (
    <Routes>
      {user.role === "admin" ? (
        <>
          <Route element={<AppLayout />}>
            <Route path="/admin/training-points" element={<AdminOverview />} />
            <Route
              path="/admin/pending"
              element={<PendingRequests />}
            />
            <Route
              path="/admin/verified"
              element={<VerifiedRequests />}
            />
            <Route 
              path="/admin/add-training-points"
              element={<AddTrainingPoints />} 
            />
            <Route 
              path="/admin/add-training-points/single"
              element={<AddPointsSingle />} 
            />
            <Route 
              path="/admin/add-training-points/csv"
              element={<AddPointsCSV />} 
            />
            <Route path="/admin/resources" element={<AdminResources />} />
            <Route
              path="*"
              element={<Navigate to="/admin/training-points" replace />}
            />
          </Route>
        </>
      ) : (
        <>
          <Route element={<AppLayout />}>
            <Route
              path="/student/training"
              element={
                <StudentTrainingPoints
                  studentId={user.id}
                  studentEmail={user.email}
                />
              }
            />
            <Route
              path="/student/verification"
              element={<AddVerification />}
            />
            <Route path="/student/resources" element={<StudentResources />} />
            <Route
              path="*"
              element={<Navigate to="/student/training" replace />}
            />
          </Route>
        </>
      )}
    </Routes>
  );
}

export default RoutingContent;
