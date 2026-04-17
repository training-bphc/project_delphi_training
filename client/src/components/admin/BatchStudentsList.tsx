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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  // Generate batch range from 2012 to 5 years from now
  const currentYear = new Date().getFullYear();
  const allBatches = useMemo(() => {
    const years = [];
    for (let year = 2012; year <= currentYear + 5; year++) {
      years.push(year);
    }
    return years.sort((a, b) => b - a); // Descending order
  }, []);

  const [selectedBatch, setSelectedBatch] = useState<string>(
    batches.length > 0 ? batches[0].toString() : allBatches[0].toString()
  );

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
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center gap-4">
          <div>
            <CardTitle>Students by Batch</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Select Batch:
            </label>
            <Select value={selectedBatch} onValueChange={setSelectedBatch}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select a batch" />
              </SelectTrigger>
              <SelectContent>
                {allBatches.map((batch) => (
                  <SelectItem key={batch} value={batch.toString()}>
                    Batch {batch}
                    {studentsByBatch[batch] ? ` (${studentsByBatch[batch].length})` : " (0)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="text-sm text-gray-600 mt-4">
          <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full">
            {students?.length || 0} students in Batch {selectedBatch}
          </span>
        </div>
      </CardHeader>

      <CardContent>
        {!students || students.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            No students found for Batch {selectedBatch}
          </div>
        ) : (
          <div className="overflow-x-auto">
                  <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allBatches.map((batch) => {
            const count = studentsByBatch[batch]?.length || 0;
            return (
              <Card key={batch} className="border-2">
                <CardHeader>
                  <CardTitle className="text-center text-2xl">
                    Batch {batch}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-indigo-600 mb-2">
                      {count}
                    </p>
                    <p className="text-gray-600">
                      {count === 1 ? "student" : "students"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
          </div>
        )}
      </CardContent>
    </Card>
  );
}