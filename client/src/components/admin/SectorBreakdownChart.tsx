import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
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
      {/* Donut Chart and Table Side by Side */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            <h2>Sector-wise Breakdown with Training Points Distribution</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-8">
            {/* Left side - Chart with Floating Legend */}
            <div className="relative">
              {outerData.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-gray-500">
                  No sector data available
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      {/* Outer Ring - Sectors */}
                      <Pie
                        data={outerData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) =>
                          `${entry.name}: ${entry.percentage}%`
                        }
                        outerRadius={100}
                        innerRadius={60}
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
                        label={({ value }) => (value > 0 ? value : "")}
                        innerRadius={20}
                        outerRadius={55}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={1}
                      >
                        {innerData.map((entry) => {
                          const color =
                            entry.type === "high"
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

                  {/* Floating Legend inside Chart Area */}
                  <div className="absolute bottom-4 left-4 bg-white bg-opacity-95 backdrop-blur-sm rounded-lg border border-gray-200 shadow-lg p-4 max-w-xs">
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-semibold text-xs text-gray-700 mb-2">
                          Sectors (Outer)
                        </h5>
                        <div className="flex flex-wrap gap-3">
                          {Object.entries(SECTOR_COLORS).map(
                            ([sector, color]) => (
                              <div key={sector} className="flex items-center gap-1.5">
                                <div
                                  style={{
                                    width: "10px",
                                    height: "10px",
                                    backgroundColor: color,
                                    borderRadius: "2px",
                                  }}
                                />
                                <span className="text-xs text-gray-600">
                                  {sector}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-3">
                        <h5 className="font-semibold text-xs text-gray-700 mb-2">
                          Training Points (Inner)
                        </h5>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <div
                              style={{
                                width: "10px",
                                height: "10px",
                                backgroundColor: "#1e40af",
                                borderRadius: "2px",
                              }}
                            />
                            <span className="text-xs text-gray-600">
                              &gt; 60 Points
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div
                              style={{
                                width: "10px",
                                height: "10px",
                                backgroundColor: "#3b82f6",
                                borderRadius: "2px",
                                opacity: 0.5,
                              }}
                            />
                            <span className="text-xs text-gray-600">
                              ≤ 60 Points
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right side - Table with Full Height */}
            <div style={{ height: "400px", overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: "0.5rem" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead
                  style={{
                    backgroundColor: "#f3f4f6",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                  }}
                >
                  <tr>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        fontWeight: "600",
                        borderBottom: "2px solid #e5e7eb",
                        fontSize: "0.875rem",
                      }}
                    >
                      Sector
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        fontWeight: "600",
                        borderBottom: "2px solid #e5e7eb",
                        fontSize: "0.875rem",
                      }}
                    >
                      Total
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        fontWeight: "600",
                        borderBottom: "2px solid #e5e7eb",
                        fontSize: "0.875rem",
                      }}
                    >
                      %
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        fontWeight: "600",
                        borderBottom: "2px solid #e5e7eb",
                        fontSize: "0.875rem",
                      }}
                    >
                      &gt; 60
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        fontWeight: "600",
                        borderBottom: "2px solid #e5e7eb",
                        fontSize: "0.875rem",
                      }}
                    >
                      High %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {outerData.map((sector) => (
                    <tr
                      key={sector.name}
                      style={{ borderBottom: "1px solid #e5e7eb" }}
                    >
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
                      <td style={{ padding: "12px", fontSize: "0.875rem" }}>
                        {sector.value}
                      </td>
                      <td style={{ padding: "12px", fontSize: "0.875rem" }}>
                        {sector.percentage}%
                      </td>
                      <td style={{ padding: "12px", fontSize: "0.875rem" }}>
                        {sector.studentsWithHighPoints}
                      </td>
                      <td style={{ padding: "12px", fontSize: "0.875rem" }}>
                        {sector.highPointsPercentage}%
                      </td>
                    </tr>
                  ))}
                  <tr style={{ backgroundColor: "#f9fafb", fontWeight: "600" }}>
                    <td style={{ padding: "12px", fontSize: "0.875rem" }}>
                      Total
                    </td>
                    <td style={{ padding: "12px", fontSize: "0.875rem" }}>
                      {totalStudents}
                    </td>
                    <td style={{ padding: "12px", fontSize: "0.875rem" }}>
                      100%
                    </td>
                    <td style={{ padding: "12px", fontSize: "0.875rem" }}>
                      {outerData.reduce((sum, s) => sum + s.studentsWithHighPoints, 0)}
                    </td>
                    <td style={{ padding: "12px", fontSize: "0.875rem" }}>
                      {totalStudents > 0
                        ? (
                            (outerData.reduce(
                              (sum, s) => sum + s.studentsWithHighPoints,
                              0
                            ) /
                              totalStudents) *
                            100
                          ).toFixed(1)
                        : "0"}
                      %
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}