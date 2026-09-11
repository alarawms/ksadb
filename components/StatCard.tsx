export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card" style={{ borderTop: "2px solid var(--accent)" }}>
      <div className="text-sm text-dim">{label}</div>
      <div className="text-3xl font-semibold tabular-nums">{value}</div>
      {hint && <div className="mt-1 text-xs text-[var(--text-dim)]">{hint}</div>}
    </div>
  );
}
