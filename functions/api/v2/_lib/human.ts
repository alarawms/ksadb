export type HumanClass = "human" | "human_associated" | "other";

// v1 approximation of "anatomy under human body systems" — a small fixed set
// of UBERON ids the enrichment can link from sample tissue values. Extending
// this to a real UBERON subtree walk is a later workstream.
const HUMAN_ANATOMY_TERMS = new Set([
  "UBERON:0000059", // intestine
  "UBERON:0001007", // digestive system
  "UBERON:0002097", // skin of body
  "UBERON:0000167", // tongue / oral cavity region
  "UBERON:0001004", // respiratory system
  "UBERON:0003838", // blood
]);

export function classifyHuman(
  organism: string | null,
  taxId: number | null,
  host: string | null,
  tissueTerms: string[] = []
): HumanClass {
  const org = (organism ?? "").trim();
  if (taxId === 9606 || /^homo sapiens$/i.test(org)) return "human";
  if (/human\b.*(metagenome|microbiome|virome)/i.test(org)) return "human_associated";
  const h = (host ?? "").trim();
  if (/^homo sapiens$/i.test(h) || /\bhuman\b/i.test(h)) return "human_associated";
  if (tissueTerms.some((t) => HUMAN_ANATOMY_TERMS.has(t))) return "human_associated";
  return "other";
}
