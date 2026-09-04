"use client";

import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";

import type { TimeseriesPoint, TopRow } from "@/lib/api";

export function TrendChart({ data }: { data: TimeseriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="runs" stroke="#4682b4" name="Runs" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function TopBarChart({ data, title }: { data: TopRow[]; title: string }) {
  return (
    <div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data.slice(0, 10)} layout="vertical" margin={{ left: 120 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="runs" fill="#4682b4" name="Runs" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
