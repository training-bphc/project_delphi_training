import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/auth";
import { toast } from "sonner";
import BulkUploadStudents from "@/components/admin/BulkUploadStudents";
import BatchStudentsList from "@/components/admin/BatchStudentsList";
import { fetchStudentsByBatch } from "@/lib/api/studentApi";
import type { StudentsByBatch } from "@/lib/api/studentApi";
import "./Overview.css";

function Overview() {
  const { token } = useAuth();
  const [studentsByBatch, setStudentsByBatch] = useState<StudentsByBatch>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token) {
      loadStudents();
    }
  }, [token]);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      const data = await fetchStudentsByBatch(token!);
      setStudentsByBatch(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load students",
      );
      setStudentsByBatch({});
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadComplete = () => {
    loadStudents();
  };

    return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Overview</h1>
            {/* <p className="text-indigo-100">Manage students and training points</p> */}
          </div>
          <BulkUploadStudents token={token!} onUploadComplete={handleUploadComplete} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <BatchStudentsList
          studentsByBatch={studentsByBatch}
          isLoading={isLoading}
        />
      </div>
    </main>
  );
}

export default Overview;