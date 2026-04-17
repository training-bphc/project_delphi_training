import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Student } from "@/shared/types/index";

interface SectorBreakdownChartProps {
  students: Student[];
  trainingPointsMap?: { [email: string]: number };
}

const SECTOR_COLORS: { [key: string]: string } = {
  IT: "#3b82f6",
  ET: "#a855f7",
  Core: "#10b981",
  FinTech: "#f59e0b",
};

export default function SectorBreakdownChart({
  students,
  trainingPointsMap = {},
}: SectorBreakdownChartProps) {
  const sectorData = useMemo(() => {
    const sectors = ["IT", "ET", "Core", "FinTech"];
    
    const data = sectors.map((sector) => {
      const sectorStudents = students.filter((s) => s.sector === sector);
      const totalInSector = sectorStudents.length;
      
      const studentsWithHighPoints = sectorStudents.filter(
        (s) => (trainingPointsMap[s.email] || 0) > 60
      ).length;

      const percentage = students.length > 0 
        ? ((totalInSector / students.length) * 100).toFixed(1)
        : "0";

      const highPointsPercentage = totalInSector > 0
        ? ((studentsWithHighPoints / totalInSector) * 100).toFixed(1)
        : "0";

      return {
        name: sector,
        value: totalInSector,
        percentage: parseFloat(percentage),
        studentsWithHighPoints,
        highPointsPercentage: parseFloat(highPointsPercentage),
      };
    });

    return data;
  }, [students, trainingPointsMap]);

  const totalStudents = students.length;

  return (
    <div className="space-y-6">
      {/* Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sector-wise Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name }) => name}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {sectorData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={SECTOR_COLORS[entry.name]} />
                    ))}
                </Pie>
                <Tooltip 
                    formatter={(value: number, name: string) => {
                    const percentage = ((value / students.length) * 100).toFixed(1);
                    return [`${value} students (${percentage}%)`, name];
                    }}
                />
                <Legend />
                </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sector Statistics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Sector Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ backgroundColor: "#f3f4f6" }}>
                <tr>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", borderBottom: "2px solid #e5e7eb" }}>
                    Sector
                  </th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", borderBottom: "2px solid #e5e7eb" }}>
                    Total Students
                  </th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", borderBottom: "2px solid #e5e7eb" }}>
                    Percentage
                  </th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", borderBottom: "2px solid #e5e7eb" }}>
                    Students &gt; 60 Points
                  </th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", borderBottom: "2px solid #e5e7eb" }}>
                    High Points Percentage
                  </th>
                </tr>
              </thead>
              <tbody>
                {sectorData.map((sector) => (
                  <tr key={sector.name} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "12px", fontWeight: "500" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 12px",
                          borderRadius: "9999px",
                          backgroundColor: SECTOR_COLORS[sector.name],
                          color: "white",
                          fontWeight: "600",
                          fontSize: "0.875rem",
                        }}
                      >
                        {sector.name}
                      </span>
                    </td>
                    <td style={{ padding: "12px" }}>
                      {sector.value}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {sector.percentage}%
                    </td>
                    <td style={{ padding: "12px" }}>
                      {sector.studentsWithHighPoints}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {sector.highPointsPercentage}%
                    </td>
                  </tr>
                ))}
                <tr style={{ backgroundColor: "#f9fafb", fontWeight: "600" }}>
                  <td style={{ padding: "12px" }}>Total</td>
                  <td style={{ padding: "12px" }}>{totalStudents}</td>
                  <td style={{ padding: "12px" }}>100%</td>
                  <td style={{ padding: "12px" }}>
                    {sectorData.reduce((sum, s) => sum + s.studentsWithHighPoints, 0)}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {totalStudents > 0 
                      ? ((sectorData.reduce((sum, s) => sum + s.studentsWithHighPoints, 0) / totalStudents) * 100).toFixed(1)
                      : "0"}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}