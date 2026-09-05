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
