import { createContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/auth';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import AdminOverview from './views/admin/Overview';
import NewandPendingRequestsTab from './views/admin/tabs/NewandPendingRequestsTab';
import PreviousVerificationsTab from './views/admin/tabs/PreviousVerificationsTab';
import StudentTrainingPoints from './views/student/TrainingPoints';
import AddTrainingPoints from './views/student/AddTrainingPoints';
import './App.css';

export interface Record {
  s_no: number;
  name: string;
  bits_id: string;
  email_id: string;
  date: string;
  category: string;
  added_by: string;
  verification_status: 'Pending' | 'Verified';
  points?: number;
}

export interface CreateRecordPayload {
  email_id: string;
  date: string;
  category: string;
  added_by: string;
  name?: string;
  bits_id?: string;
  points?: number;
}

export interface RecordsContextType {
  records: Record[];
  handleVerify: (sNo: number) => Promise<void>;
  handleCreateRecord: (record: CreateRecordPayload) => Promise<void>;
}

export const RecordsContext = createContext<RecordsContextType | undefined>(undefined);

function AppContent() {
  const { user, token, isLoading: authLoading } = useAuth();
  const [records, setRecords] = useState<Record[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch records on token change
  useEffect(() => {
    if (token) {
      fetchRecords();
    }
  }, [token]);

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/records', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch records: ${response.statusText}`);
      }

      const data = await response.json();
      const recordsPayload: Record[] = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.records)
          ? data.records
          : [];

      setRecords(recordsPayload);
    } catch (error) {
      console.error('Failed to fetch records:', error);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (sNo: number) => {
    try {
      const response = await fetch(`/api/records/${sNo}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to verify record: ${response.statusText}`);
      }

      await fetchRecords();
    } catch (error) {
      console.error('Failed to verify record:', error);
      alert('Failed to verify record');
    }
  };

  const handleCreateRecord = async (record: CreateRecordPayload) => {
    try {
      const response = await fetch('/api/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(record),
      });

      if (!response.ok) {
        throw new Error(`Failed to create record: ${response.statusText}`);
      }

      await fetchRecords();
    } catch (error) {
      console.error('Failed to create record:', error);
      alert('Failed to create record');
    }
  };

  if (authLoading || isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
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
    <RecordsContext.Provider value={{ records, handleVerify, handleCreateRecord }}>
      <Routes>
        {user.role === 'admin' ? (
          <>
            <Route element={<AppLayout />}>
              <Route path="/admin/overview" element={<AdminOverview />} />
              <Route path="/admin/pending" element={<NewandPendingRequestsTab />} />
              <Route path="/admin/verified" element={<PreviousVerificationsTab />} />
              <Route path="*" element={<Navigate to="/admin/overview" replace />} />
            </Route>
          </>
        ) : (
          <>
            <Route element={<AppLayout />}>
              <Route
                path="/student/training"
                element={<StudentTrainingPoints studentId={user.id} studentEmail={user.email} />}
              />
              <Route path="/student/add" element={<AddTrainingPoints studentId={user.id} />} />
              <Route path="*" element={<Navigate to="/student/training" replace />} />
            </Route>
          </>
        )}
      </Routes>
    </RecordsContext.Provider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
