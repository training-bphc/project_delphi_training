import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Student } from "@/shared/types/index";

interface TrainingPointsChartProps {
  students: Student[];
  selectedSector: string;
}

export default function TrainingPointsChart({
  students,
  selectedSector,
}: TrainingPointsChartProps) {
  const chartData = useMemo(() => {
    // Define CGPA brackets
    const brackets = [
      { min: 0, max: 4, label: "0-4" },
      { min: 4, max: 5, label: "4-5" },
      { min: 5, max: 6, label: "5-6" },
      { min: 6, max: 7, label: "6-7" },
      { min: 7, max: 8, label: "7-8" },
      { min: 8, max: 9, label: "8-9" },
      { min: 9, max: 10, label: "9-10" },
    ];

    // Filter students by sector
    const sectorStudents = students.filter(
      (s) => s.sector === selectedSector
    );

    // Calculate average training points per bracket
    const data = brackets.map((bracket) => {
      const studentsInBracket = sectorStudents.filter(
        (s) => {
          const cgpa = Number(s.cgpa) || 0;
          return cgpa >= bracket.min && cgpa < bracket.max;
        }
      );

      // For now, we'll use a placeholder calculation
      // In a real scenario, you'd fetch training points from the database
      const avgTrainingPoints = studentsInBracket.length * 5; // Placeholder

      return {
        bracket: bracket.label,
        "Avg Training Points": avgTrainingPoints,
        studentCount: studentsInBracket.length,
      };
    });

    return data;
  }, [students, selectedSector]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Points by CGPA Bracket - {selectedSector}</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.every((d) => d.studentCount === 0) ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            No students found for this sector
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bracket" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Avg Training Points" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}