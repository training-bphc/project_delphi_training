import { useMemo } from "react";
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

  const totalStudents = useMemo(() => {
    return Object.values(studentsByBatch).reduce(
      (sum, students) => sum + students.length,
      0,
    );
  }, [studentsByBatch]);

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

  if (batches.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8 text-gray-500">
            No students found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Students by Graduating Batch</h2>
        <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
          {totalStudents} total students
        </span>
      </div>

      {batches.map((batch) => {
        const students = studentsByBatch[batch];
        const sectorCounts: { [key: string]: number } = {};

        students.forEach((student) => {
          sectorCounts[student.sector] =
            (sectorCounts[student.sector] || 0) + 1;
        });

        return (
          <Card key={batch}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>Batch {batch}</CardTitle>
                <div className="flex gap-3 text-sm">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    {students.length} students
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-600 mt-2">
                {Object.entries(sectorCounts)
                  .map(([sector, count]) => `${sector}: ${count}`)
                  .join(" • ")}
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
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
                          {student.cgpa?.toFixed(2) ?? "N/A"}
                        </TableCell>
                        <TableCell>{student.start_year}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}