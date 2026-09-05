"use client";

import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";

import type { TimeseriesPoint, TopRow } from "@/lib/api";

const GRID = { strokeDasharray: "3 3", stroke: "var(--border)" } as const;
const TICK = { fill: "var(--text-dim)", fontSize: 12 } as const;
const TOOLTIP_STYLE = {
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--text)",
  fontSize: 12,
} as const;

export function TrendChart({ data }: { data: TimeseriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="year" stroke="var(--border)" tick={TICK} />
        <YAxis stroke="var(--border)" tick={TICK} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Line type="monotone" dataKey="runs" stroke="var(--accent)" name="Runs" />
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
          <CartesianGrid {...GRID} />
          <XAxis type="number" stroke="var(--border)" tick={TICK} />
          <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: "var(--text-dim)" }} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Bar dataKey="runs" fill="var(--accent)" name="Runs" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
