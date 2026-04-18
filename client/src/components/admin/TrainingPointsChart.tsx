import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
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

interface ChartDataPoint {
  bracket: string;
  "Avg Training Points": number;
  studentCount: number;
}

interface PieDataPoint {
  name: string;
  value: number;
}

const CGPA_COLORS: { [key: string]: string } = {
  "0-4": "#ef4444",
  "4-5": "#f97316",
  "5-6": "#eab308",
  "6-7": "#84cc16",
  "7-8": "#22c55e",
  "8-9": "#06b6d4",
  "9-10": "#3b82f6",
};

export default function TrainingPointsChart({
  students,
  selectedSector,
}: TrainingPointsChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [pieData, setPieData] = useState<PieDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

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
        const barData = brackets.map((bracket) => {
          const studentsInBracket = sectorStudents.filter((s) => {
            const cgpa = Number(s.cgpa) || 0;
            return cgpa >= bracket.min && cgpa < bracket.max;
          });

          // Calculate actual average training points
          const totalPoints = studentsInBracket.reduce(
            (sum, s) => sum + (Number(s.trainingPoints) || 0),
            0
          );

          const avgTrainingPoints =
            studentsInBracket.length > 0
              ? totalPoints / studentsInBracket.length
              : 0;

          return {
            bracket: bracket.label,
            "Avg Training Points": Math.round(avgTrainingPoints * 100) / 100,
            studentCount: studentsInBracket.length,
          };
        });

        // Calculate CGPA breakdown for pie chart
        const pieChartData = brackets
          .map((bracket) => {
            const studentsInBracket = sectorStudents.filter((s) => {
              const cgpa = Number(s.cgpa) || 0;
              return cgpa >= bracket.min && cgpa < bracket.max;
            });

            return {
              name: `${bracket.label} (${studentsInBracket.length})`,
              value: studentsInBracket.length,
              bracket: bracket.label,
            };
          })
          .filter((item) => item.value > 0);

        setChartData(barData);
        setPieData(pieChartData);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [students, selectedSector]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>Training Points Analysis - {selectedSector}</h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            Loading chart data...
          </div>
        ) : chartData.every((d) => d.studentCount === 0) ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            No students found for this sector
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                Avg Training Points by CGPA Bracket
              </h3>
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
            </div>

            {/* Pie Chart */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                CGPA Distribution
              </h3>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name }) => name}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CGPA_COLORS[entry.bracket] || "#8884d8"}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} students`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  No data available
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}