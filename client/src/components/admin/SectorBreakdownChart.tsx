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

const HIGH_POINTS_COLORS: { [key: string]: string } = {
  IT: "#1e40af",
  ET: "#6d28d9",
  Core: "#065f46",
  FinTech: "#92400e",
};

export default function SectorBreakdownChart({
  students,
  trainingPointsMap = {},
}: SectorBreakdownChartProps) {
  // Outer ring data - by sector
  const outerData = useMemo(() => {
    if (!students || students.length === 0) return [];

    const sectors = ["IT", "ET", "Core", "FinTech"];
    
    return sectors
      .map((sector) => {
        const sectorStudents = students.filter((s) => s.sector === sector);
        const totalInSector = sectorStudents.length;
        
        const studentsWithHighPoints = sectorStudents.filter(
          (s) => (trainingPointsMap[s.email] || 0) > 20
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
      })
      .filter((item) => item.value > 0);
  }, [students, trainingPointsMap]);

  // Inner ring data - high points vs others for each sector
  const innerData = useMemo(() => {
    return outerData.flatMap((sector) => [
      {
        name: `${sector.name} (>60)`,
        value: sector.studentsWithHighPoints,
        sector: sector.name,
        type: "high",
      },
      {
        name: `${sector.name} (≤60)`,
        value: sector.value - sector.studentsWithHighPoints,
        sector: sector.name,
        type: "low",
      },
    ]);
  }, [outerData]);

  if (!students || students.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12 text-gray-500">
            No students to display
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalStudents = students.length;

  return (
    <div className="space-y-6">
      {/* Donut Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sector-wise Breakdown with Training Points Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {outerData.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              No sector data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                {/* Outer Ring - Sectors */}
                <Pie
                    data={outerData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => 
                        `${entry.name}: ${entry.percentage}% (${entry.value})`
                    }
                    outerRadius={120}
                    innerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                    >
                    {outerData.map((entry) => (
                        <Cell 
                        key={`outer-${entry.name}`} 
                        fill={SECTOR_COLORS[entry.name]}
                        />
                    ))}
                    </Pie>

                {/* Inner Ring - High Points vs Others */}
                <Pie
                  data={innerData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ value }) => value > 0 ? value : ""}
                  innerRadius={20}
                  outerRadius={75}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={1}
                >
                  {innerData.map((entry) => {
                    const color = entry.type === "high" 
                      ? HIGH_POINTS_COLORS[entry.sector]
                      : SECTOR_COLORS[entry.sector];
                    const opacity = entry.type === "high" ? 1 : 0.5;
                    return (
                      <Cell 
                        key={`inner-${entry.name}`} 
                        fill={color}
                        fillOpacity={opacity}
                      />
                    );
                  })}
                </Pie>

                <Tooltip 
                  formatter={(value) => `${value} students`}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          
          {/* Legend */}
          <div style={{ marginTop: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <h3 style={{ fontWeight: "600", marginBottom: "12px", fontSize: "0.875rem" }}>
                Sectors (Outer Ring)
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {Object.entries(SECTOR_COLORS).map(([sector, color]) => (
                  <div key={sector} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        backgroundColor: color,
                        borderRadius: "2px",
                      }}
                    />
                    <span style={{ fontSize: "0.875rem" }}>{sector}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 style={{ fontWeight: "600", marginBottom: "12px", fontSize: "0.875rem" }}>
                Training Points (Inner Ring)
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      backgroundColor: "#1e40af",
                      borderRadius: "2px",
                    }}
                  />
                  <span style={{ fontSize: "0.875rem" }}>{">"} 60 Points (Dark)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      backgroundColor: "#3b82f6",
                      borderRadius: "2px",
                      opacity: 0.5,
                    }}
                  />
                  <span style={{ fontSize: "0.875rem" }}>{"≤"} 60 Points (Light)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Statistics Table */}
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
                {outerData.map((sector) => (
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
                    {outerData.reduce((sum, s) => sum + s.studentsWithHighPoints, 0)}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {totalStudents > 0 
                      ? ((outerData.reduce((sum, s) => sum + s.studentsWithHighPoints, 0) / totalStudents) * 100).toFixed(1)
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