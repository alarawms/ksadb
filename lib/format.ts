export function formatBases(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)} Gb`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)} Mb`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)} kb`;
  return `${n} bp`;
}

export function formatMb(mb: number | null | undefined): string {
  if (mb == null) return "—";
  if (mb >= 1000) return `${(mb / 1000).toFixed(1)} GB`;
  return `${mb.toFixed(1)} MB`;
}

// ENA reports fastq_bytes as a string of semicolon-delimited per-file sizes
// (e.g. "123;456"); coerce to a numeric total, 0 when absent/unparseable.
export function parseFastqBytes(s: string | null | undefined): number {
  if (!s) return 0;
  const parts = s.split(";").map(Number);
  return parts.every((n) => Number.isFinite(n))
    ? parts.reduce((a, b) => a + b, 0)
    : 0;
}

export function formatGb(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return "—";
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
  return `${(bytes / 1e6).toFixed(1)} MB`;
}
