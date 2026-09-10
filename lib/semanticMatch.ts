// lib/semanticMatch.ts
// Display helpers for typed semantic matches from POST /api/v2/semantic.
export interface SemanticMatch {
  type: "study" | "sample" | "run";
  accession: string;
  title: string | null;
  label?: string | null;
  organism?: string | null;
  submitter: string | null;
  runs: number;
  score: number;
}

export function semanticBadge(type: SemanticMatch["type"]): string {
  return type === "study" ? "Study" : type === "sample" ? "Sample" : "Run";
}

export function semanticTitle(m: SemanticMatch): string {
  return m.title ?? m.label ?? m.accession;
}
