import type { CollectionItem } from "./collection";

const ftpUrl = (f: string) => (f.startsWith("ftp.") ? `https://${f}` : f);

function withFastq(items: CollectionItem[]): { items: CollectionItem[]; skipped: number } {
  const ok = items.filter((i) => i.fastq_ftp);
  return { items: ok, skipped: items.length - ok.length };
}

export function toCurlScript(items: CollectionItem[]): string {
  const { items: ok, skipped } = withFastq(items);
  const lines = ["#!/usr/bin/env bash", "set -euo pipefail", ""];
  if (skipped) lines.push(`# skipped ${skipped} item(s) without fastq_ftp`);
  const md5s: string[] = [];
  for (const i of ok) {
    const files = i.fastq_ftp!.split(";");
    const md5 = (i.fastq_md5 ?? "").split(";");
    files.forEach((f, n) => {
      lines.push(`curl -O ${ftpUrl(f)}`);
      if (md5[n]) md5s.push(`${md5[n]}  ${f.split("/").pop()}`);
    });
  }
  if (md5s.length) {
    lines.push("", "cat > checksums.md5 <<'EOF'", ...md5s, "EOF",
      "md5sum -c checksums.md5");
  }
  return lines.join("\n") + "\n";
}

export function toSraToolsScript(items: CollectionItem[]): string {
  const accs = items.map((i) => i.accession).join(" ");
  return [
    "#!/usr/bin/env bash", "set -euo pipefail", "",
    `prefetch ${accs}`, `fasterq-dump --split-files --gzip ${accs}`, "",
  ].join("\n");
}

export function toSamplesheet(items: CollectionItem[]): string {
  const { items: ok, skipped } = withFastq(items);
  const lines = ["sample,fastq_1,fastq_2"];
  if (skipped) lines.push(`# skipped ${skipped} item(s) without fastq_ftp`);
  for (const i of ok) {
    const files = i.fastq_ftp!.split(";").map(ftpUrl);
    lines.push([i.accession, files[0] ?? "", files[1] ?? ""].join(","));
  }
  return lines.join("\n") + "\n";
}

export function toManifest(items: CollectionItem[]): string {
  return JSON.stringify({ created: new Date().toISOString(), items }, null, 2);
}
