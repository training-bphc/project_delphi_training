import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TrainingPointsChart from "./TrainingPointsChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Student } from "@/shared/types/index";
import SectorBreakdownChart from "./SectorBreakdownChart";

interface BatchStudentsListProps {
  studentsByBatch: { [batch: number]: Student[] };
  isLoading: boolean;
}

export default function BatchStudentsList({
  studentsByBatch,
  isLoading,
}: BatchStudentsListProps) {
  const batches = useMemo(() => {
    return Object.keys(studentsByBatch)
      .map(Number)
      .sort((a, b) => b - a);
  }, [studentsByBatch]);

  const currentYear = new Date().getFullYear();
  const allBatches = useMemo(() => {
    const years = [];
    for (let year = 2012; year <= currentYear + 5; year++) {
      years.push(year);
    }
    return years.sort((a, b) => b - a);
  }, []);

  const [selectedBatch, setSelectedBatch] = useState<string>("2027");
  const [selectedSector, setSelectedSector] = useState<string>("IT");

  const students = selectedBatch
    ? studentsByBatch[parseInt(selectedBatch)]
    : [];

  const getSectorColor = (sector: string) => {
    const colors: { [key: string]: string } = {
      IT: "bg-blue-100 text-blue-800",
      ET: "bg-purple-100 text-purple-800",
      Core: "bg-green-100 text-green-800",
      FinTech: "bg-amber-100 text-amber-800",
    };
    return colors[sector] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8 text-gray-500">
            Loading students...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top section with batch selector and count */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            Select Batch:
          </label>
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {allBatches.map((batch) => (
              <option key={batch} value={batch.toString()}>
                Batch {batch}
              </option>
            ))}
          </select>
        </div>
         <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Select Sector:
            </label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="IT">IT</option>
              <option value="ET">ET</option>
              <option value="Core">Core</option>
              <option value="FinTech">FinTech</option>
            </select>
          </div>
        <div className="text-xl font-bold text-indigo-600">
          {students?.length || 0} students
        </div>
      </div>

      {/* Table section with scrolling */}
      <Card>
        {students && students.length > 0 && (
          <TrainingPointsChart 
            students={students} 
            selectedSector={selectedSector}
          />
        )}
        <CardContent className="pt-6">
          {!students || students.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              No students found for Batch {selectedBatch}
            </div>
          ) : (
            <div style={{ maxHeight: "500px", overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: "0.5rem" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ position: "sticky", top: 0, backgroundColor: "white", zIndex: 10 }}>
                  <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Name</th>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Roll Number</th>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Email</th>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Sector</th>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>CGPA</th>
                    <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Start Year</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.student_id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "12px", fontWeight: "500" }}>
                        {student.student_name}
                      </td>
                      <td style={{ padding: "12px", fontFamily: "monospace", fontSize: "0.875rem" }}>
                        {student.roll_number}
                      </td>
                      <td style={{ padding: "12px", fontSize: "0.875rem", color: "#4b5563" }}>
                        {student.email}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 8px",
                            borderRadius: "9999px",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                          }}
                          className={getSectorColor(student.sector)}
                        >
                          {student.sector}
                        </span>
                      </td>
                      <td style={{ padding: "12px" }}>
                        {student.cgpa ? Number(student.cgpa).toFixed(2) : "N/A"}
                      </td>
                      <td style={{ padding: "12px" }}>{student.start_year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <SectorBreakdownChart 
        students={students} 
        trainingPointsMap={{}}
      />
    </div>
  );
}