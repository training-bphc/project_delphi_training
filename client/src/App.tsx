import { createContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/auth';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import AdminOverview from './views/admin/Overview';
import NewandPendingRequestsTab from './views/admin/tabs/NewandPendingRequestsTab';
import PreviousVerificationsTab from './views/admin/tabs/PreviousVerificationsTab';
import AdminResources from './views/admin/Resources';
import StudentTrainingPoints from './views/student/TrainingPoints';
import AddTrainingPoints from './views/student/AddTrainingPoints';
import StudentResources from './views/student/Resources';
import './App.css';

export interface Record {
  s_no: number;
  name: string;
  bits_id: string;
  email_id: string;
  date: string;
  category_id: number;
  category: string;
  added_by: string;
  verification_status: 'Pending' | 'Verified' | 'Rejected';
  points?: number;
  awarded_by?: string | null;
}

export interface VerificationRequest {
  request_id: number;
  student_id: number;
  category_id: number;
  category: string;
  description?: string;
  proof_links: string[];
  status: 'Pending' | 'Verified' | 'Rejected';
  awarded_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrainingCategory {
  category_id: number;
  category_name: string;
  description?: string | null;
  max_points: number;
  is_mythology: boolean;
}

export interface CreateRecordPayload {
  email_id: string;
  date: string;
  category_id: number;
  added_by: string;
  name?: string;
  bits_id?: string;
  points?: number;
}

export interface RecordsContextType {
  records: Record[];
  verificationRequests: VerificationRequest[];
  categories: TrainingCategory[];
  handleVerify: (sNo: number) => Promise<void>;
  handleCreateRecord: (record: CreateRecordPayload) => Promise<void>;
  handleVerifyRequest: (requestId: number) => Promise<void>;
  handleRejectRequest: (requestId: number) => Promise<void>;
  handleDeleteRecord: (sNo: number) => Promise<void>;
  handleUndoDelete: (sNo: number) => Promise<void>;
  handleRefreshRecords: () => Promise<void>;
}

export const RecordsContext = createContext<RecordsContextType | undefined>(undefined);

function AppContent() {
  const { user, token, isLoading: authLoading } = useAuth();
  const [records, setRecords] = useState<Record[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [categories, setCategories] = useState<TrainingCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch records on token change
  useEffect(() => {
    if (token) {
      fetchRecords();
      fetchCategories();
      if (user?.role === 'admin') {
        fetchVerificationRequests();
      }
    }
  }, [token, user?.role]);

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

  const fetchVerificationRequests = async () => {
    try {
      const response = await fetch('/api/verification-requests', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch verification requests: ${response.statusText}`);
      }

      const data = await response.json();
      const requestsPayload: VerificationRequest[] = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.requests)
          ? data.requests
          : [];

      setVerificationRequests(requestsPayload);
    } catch (error) {
      console.error('Failed to fetch verification requests:', error);
      setVerificationRequests([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }

      const data = await response.json();
      const categoriesPayload: TrainingCategory[] = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.categories)
          ? data.categories
          : [];

      setCategories(categoriesPayload);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
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

  const handleVerifyRequest = async (requestId: number) => {
    try {
      const response = await fetch(`/api/verification-requests/${requestId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to verify request: ${response.statusText}`);
      }

      await fetchRecords();
      await fetchVerificationRequests();
    } catch (error) {
      console.error('Failed to verify request:', error);
      alert('Failed to verify request');
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
      const response = await fetch(`/api/verification-requests/${requestId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to reject request: ${response.statusText}`);
      }

      await fetchRecords();
      await fetchVerificationRequests();
    } catch (error) {
      console.error('Failed to reject request:', error);
      alert('Failed to reject request');
    }
  };

  const handleDeleteRecord = async (sNo: number) => {
    try {
      const response = await fetch(`/api/records/${sNo}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete record: ${response.statusText}`);
      }

      await fetchRecords();
    } catch (error) {
      console.error('Failed to delete record:', error);
      alert('Failed to delete record');
    }
  };

  const handleUndoDelete = async (sNo: number) => {
    try {
      const response = await fetch(`/api/records/${sNo}/undo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to undo delete: ${response.statusText}`);
      }

      await fetchRecords();
    } catch (error) {
      console.error('Failed to undo delete:', error);
      alert('Failed to undo delete');
    }
  };

  const handleRefreshRecords = async () => {
    await fetchRecords();
    if (user?.role === 'admin') {
      await fetchVerificationRequests();
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
    <RecordsContext.Provider
      value={{
        records,
        verificationRequests,
        categories,
        handleVerify,
        handleCreateRecord,
        handleVerifyRequest,
        handleRejectRequest,
        handleDeleteRecord,
        handleUndoDelete,
        handleRefreshRecords,
      }}
    >
      <Routes>
        {user.role === 'admin' ? (
          <>
            <Route element={<AppLayout />}>
              <Route path="/admin/overview" element={<AdminOverview />} />
              <Route path="/admin/pending" element={<NewandPendingRequestsTab />} />
              <Route path="/admin/verified" element={<PreviousVerificationsTab />} />
              <Route path="/admin/resources" element={<AdminResources />} />
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
              <Route path="/student/resources" element={<StudentResources />} />
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
