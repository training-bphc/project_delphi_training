import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Student } from "@/shared/types/index";

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
        <div className="text-xl font-bold text-indigo-600">
          {students?.length || 0} students
        </div>
      </div>

      {/* Table section */}
      <Card>
        <CardContent className="pt-6">
          {!students || students.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              No students found for Batch {selectedBatch}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="max-h-96 overflow-y-auto border rounded-lg">
                <Table>
                  <TableHeader className="sticky top-0 bg-white z-10">
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Roll Number</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Sector</TableHead>
                      <TableHead>CGPA</TableHead>
                      <TableHead>Start Year</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.student_id}>
                        <TableCell className="font-medium">
                          {student.student_name}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {student.roll_number}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {student.email}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getSectorColor(
                              student.sector,
                            )}`}
                          >
                            {student.sector}
                          </span>
                        </TableCell>
                        <TableCell>
                          {student.cgpa ? Number(student.cgpa).toFixed(2) : "N/A"}
                        </TableCell>
                        <TableCell>{student.start_year}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}