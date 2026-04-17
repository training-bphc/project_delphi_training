import "./TrainingPoints.css";
import { useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { useAuth } from "../../contexts/auth";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  Record,
  VerificationRequest,
  TrainingCategory,
} from "@/shared/types";
import StudentCategoryPopup from "@/components/training-points/StudentCategoryPopup";

interface StudentTrainingPointsRow {
  bitsId: string;
  name: string;
  email: string;
  totalPoints: number;
  pendingCount: number;
  lastUpdated: string;
  categoryPoints: Array<{ category: string; points: number }>;
}

function TrainingPoints() {
  const { token } = useAuth();
  const [records, setRecords] = useState<Record[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<
    VerificationRequest[]
  >([]);
  const [categories, setCategories] = useState<TrainingCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch all data on mount
  useEffect(() => {
    fetchRecords();
    fetchVerificationRequests();
    fetchCategories();
  }, [token]);

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/records", {
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
      console.error("Failed to fetch records:", error);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVerificationRequests = async () => {
    try {
      const response = await fetch("/api/verification-requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch verification requests: ${response.statusText}`,
        );
      }

      const data = await response.json();
      const requestsPayload: VerificationRequest[] = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.requests)
          ? data.requests
          : [];

      setVerificationRequests(requestsPayload);
    } catch (error) {
      console.error("Failed to fetch verification requests:", error);
      setVerificationRequests([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories", {
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
      console.error("Failed to fetch categories:", error);
      setCategories([]);
    }
  };

  const studentRows = useMemo<StudentTrainingPointsRow[]>(() => {
    const pendingByEmail = new Map<string, number>();
    verificationRequests.forEach((request: VerificationRequest) => {
      if (request.status === "Pending" && request.student_email) {
        const key = request.student_email.toLowerCase();
        pendingByEmail.set(key, (pendingByEmail.get(key) || 0) + 1);
      }
    });

    const grouped = new Map<string, StudentTrainingPointsRow>();

    records.forEach((record: Record) => {
      const key = `${record.email_id.toLowerCase()}|${record.bits_id}`;
      const existing: StudentTrainingPointsRow = grouped.get(key) || {
        bitsId: record.bits_id,
        name: record.name,
        email: record.email_id,
        totalPoints: 0,
        pendingCount: 0,
        lastUpdated: record.date,
        categoryPoints: [] as Array<{ category: string; points: number }>,
      };

      const normalizedDate = new Date(record.date).getTime();
      const existingDate = new Date(existing.lastUpdated).getTime();
      if (!Number.isNaN(normalizedDate) && normalizedDate > existingDate) {
        existing.lastUpdated = record.date;
      }

      if (record.verification_status === "Verified") {
        existing.totalPoints += record.points || 0;
        const categoryItem = existing.categoryPoints.find(
          (cat) => cat.category === record.category,
        );
        if (categoryItem) {
          categoryItem.points += record.points || 0;
        } else {
          existing.categoryPoints.push({
            category: record.category,
            points: record.points || 0,
          });
        }
      }

      existing.pendingCount =
        pendingByEmail.get(record.email_id.toLowerCase()) || 0;
      grouped.set(key, existing);
    });

    return [...grouped.values()].sort(
      (a, b) =>
        b.pendingCount - a.pendingCount || b.totalPoints - a.totalPoints,
    );
  }, [verificationRequests, records]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="trainingPointsContent">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h1 className="trainingPointsHeading">Training Points</h1>
        <Button
          className="addTrainingPointsButton"
          onClick={() => navigate("/admin/add-training-points")}
        >
          + Add Training Points
        </Button>
      </div>

      <section className="studentTrainingPointsSection">
        <div className="studentTrainingPointsHeaderRow">
          <h2>Student Progress Summary</h2>
          <span>{studentRows.length} students</span>
        </div>

        <Table className="studentTrainingPointsTable">
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>BITS ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Total Points</TableHead>
              <TableHead>Pending Requests</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Category Breakdown</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {studentRows.map((student) => (
              <TableRow key={`${student.email}-${student.bitsId}`}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.bitsId}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.totalPoints}</TableCell>
                <TableCell>{student.pendingCount}</TableCell>
                <TableCell>{student.lastUpdated}</TableCell>
                <TableCell>
                  <StudentCategoryPopup
                    studentName={student.name}
                    categoryPoints={student.categoryPoints}
                    allCategories={categories}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </main>
  );
}

export default TrainingPoints;
