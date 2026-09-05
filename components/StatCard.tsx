export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card">
      <div className="text-sm text-dim">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
