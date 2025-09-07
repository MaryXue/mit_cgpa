"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Student {
  Name: string;
  Branch: string;
  Semester: string;
  CGPA: number;
}

export default function Statistics({ data }: { data: Student[] }) {
  if (!data || data.length === 0) {
    return (
      <Card className="bg-gray-900 border border-cyan-500">
        <CardHeader>
          <CardTitle className="text-cyan-400">Statistics</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-400">No data available</CardContent>
      </Card>
    );
  }

  const avgCGPA =
    data.reduce((sum, row) => sum + (Number(row.CGPA) || 0), 0) / data.length;

  const branchCounts = Object.entries(
    data.reduce((acc: Record<string, number>, row) => {
      acc[row.Branch] = (acc[row.Branch] || 0) + 1;
      return acc;
    }, {})
  ).map(([branch, count]) => ({ branch, count }));

  return (
    <Card className="bg-gray-900 border border-cyan-500 shadow-xl mt-6">
      <CardHeader>
        <CardTitle className="text-cyan-400">Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-300">
          <span className="text-cyan-400">Total Students:</span> {data.length}
        </p>
        <p className="text-gray-300">
          <span className="text-cyan-400">Average CGPA:</span>{" "}
          {avgCGPA.toFixed(2)}
        </p>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={branchCounts}>
              <XAxis dataKey="branch" stroke="#22d3ee" />
              <YAxis stroke="#22d3ee" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  borderColor: "#22d3ee",
                }}
                labelStyle={{ color: "#22d3ee" }}
              />
              <Bar dataKey="count" fill="#22d3ee" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
