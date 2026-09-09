"use client";

import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

import type { TimeseriesPoint, TopRow, V2MonthPoint, V2TopRow } from "@/lib/api";

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

export function V2TrendChart({ data }: { data: V2MonthPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="month" stroke="var(--border)" tick={TICK} />
        <YAxis yAxisId="left" stroke="var(--border)" tick={TICK} />
        <YAxis yAxisId="right" orientation="right" stroke="var(--border)" tick={TICK}
          tickFormatter={(v: number) => `${(v / 1e9).toFixed(0)}G`} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Line yAxisId="left" type="monotone" dataKey="runs" stroke="var(--accent)" name="Runs" />
        <Line yAxisId="right" type="monotone" dataKey="bytes" stroke="var(--danger)"
          name="Bytes" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function V2TopBarChart({ data, title, limit = 20 }: { data: V2TopRow[]; title: string; limit?: number }) {
  return (
    <div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <ResponsiveContainer width="100%" height={420}>
        <BarChart data={data.slice(0, limit)} layout="vertical" margin={{ left: 160 }}>
          <CartesianGrid {...GRID} />
          <XAxis type="number" stroke="var(--border)" tick={TICK} />
          <YAxis type="category" dataKey="name" width={150}
            tick={{ fontSize: 11, fill: "var(--text-dim)" }} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Bar dataKey="runs" fill="var(--accent)" name="Runs" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const PIE_COLORS = ["var(--accent)", "#f5a524", "#e5484d", "#30a46c", "#8e4ec6", "#0090ff"];

export function V2PieChart({ data, title }: { data: V2TopRow[]; title: string }) {
  return (
    <div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} dataKey="runs" nameKey="name" outerRadius={110} stroke="var(--surface)">
            {data.map((row, i) => (
              <Cell key={row.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
