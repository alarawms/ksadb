"use client";

import { NODE_COLORS, type DetailPayload, type GraphNode } from "./graph-layout";

export default function Inspector({ node, detail, onClose, onFocus, onOpen, onSearch }: {
  node: GraphNode;
  detail: DetailPayload | null;
  onClose: () => void;
  onFocus: (id: string) => void;
  onOpen: (link: string) => void;
  onSearch: (href: string) => void;
}) {
  const d: Record<string, unknown> = detail ?? {};
  const href = searchHref(node);

  return (
    <aside className="card w-full shrink-0 p-0 xl:w-80" aria-label="Node inspector">
      <header className="flex items-start gap-2 border-b p-3"
        style={{ borderColor: "var(--border)" }}>
        <div className="min-w-0 flex-1">
          <div className="break-words font-semibold">{node.label}</div>
          <span className="badge mt-1 inline-flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full"
              style={{ background: NODE_COLORS[node.type] }} />
            {node.type}
          </span>
        </div>
        <button className="btn shrink-0 px-2 py-1" aria-label="Close" onClick={onClose}>✕</button>
      </header>

      <div className="space-y-1.5 p-3 text-sm">
        {detail === null && <p className="text-dim">Loading detail…</p>}
        <Fields node={node} d={d} />
      </div>

      <footer className="flex flex-wrap gap-2 border-t p-3"
        style={{ borderColor: "var(--border)" }}>
        <button className="btn btn-accent" onClick={() => onFocus(node.id)}>Focus graph</button>
        <button className="btn" disabled={!node.link}
          onClick={() => node.link && onOpen(node.link)}>
          Open page
        </button>
        {href && <button className="btn" onClick={() => onSearch(href)}>View runs in search</button>}
      </footer>
    </aside>
  );
}

// "View runs in search" target per node type; term/taxon have no search facet.
function searchHref(node: GraphNode): string | null {
  const id = encodeURIComponent(node.id.slice(node.type.length + 1));
  switch (node.type) {
    case "sample": return `/search?q=${id}`;
    case "organism": return `/search?organism=${id}`;
    case "submitter": return `/search?submitter=${id}`;
    case "region": return `/search?region=${id}`;
    case "platform": return `/search?platform=${id}`;
    case "strategy": return `/search?strategy=${id}`;
    case "study": return `/search?study=${id}`;
    default: return null;
  }
}

// ---- defensive readers: the endpoint's type-specific keys arrive as unknown ----

const txt = (v: unknown): string => (typeof v === "string" && v ? v : "—");
const int = (v: unknown): number | null => (typeof v === "number" ? v : null);
const dash = (v: unknown): string => {
  const n = int(v);
  return n === null ? "—" : n.toLocaleString();
};
const runs = (v: unknown): string => {
  const n = int(v);
  return n === null ? "—" : `${n.toLocaleString()} runs`;
};
const range = (a: unknown, b: unknown): string => {
  const x = txt(a), y = txt(b);
  if (x === "—" && y === "—") return "—";
  return x === y ? x : `${x} → ${y}`;
};

function bytes(v: unknown): string {
  let n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return "—";
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let i = -1;
  do { n /= 1024; i++; } while (n >= 1024 && i < units.length - 1);
  return `${n >= 100 ? Math.round(n) : n.toFixed(1)} ${units[i]}`;
}

function lineageText(v: unknown): string {
  if (!v || typeof v !== "object") return "—";
  const l = v as Record<string, unknown>;
  const parts = [l.genus, l.family, l.phylum]
    .filter((x): x is string => typeof x === "string" && !!x);
  return parts.length ? parts.join(" › ") : "—";
}

interface TopItem { name?: unknown; accession?: unknown; runs?: unknown }

// name (runs) rows for top_organisms / top_studies; the parenthesized count
// keeps "N runs" reserved for the stats rows.
function TopList({ items, labelKey }: { items: unknown; labelKey: "name" | "accession" }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <Row label={labelKey === "name" ? "Top organisms" : "Top studies"} value="—" />;
  }
  return (
    <div>
      <div className="text-dim">{labelKey === "name" ? "Top organisms" : "Top studies"}</div>
      <ul className="mt-0.5 space-y-0.5">
        {(items as TopItem[]).map((it, i) => (
          <li key={i} className="flex items-baseline justify-between gap-2">
            <span className="break-all">{txt(it[labelKey])}</span>
            <span className="text-dim shrink-0">({dash(it.runs)})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Chips({ items, label }: { items: unknown; label: string }) {
  if (!Array.isArray(items) || items.length === 0) return <Row label={label} value="—" />;
  return (
    <div>
      <div className="text-dim">{label}</div>
      <div className="mt-0.5 flex flex-wrap gap-1">
        {items.map((p, i) => (
          <span key={i} className="badge">{txt(p)}</span>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-dim shrink-0">{label}</span>
      <span className="text-right break-words">{value}</span>
    </div>
  );
}

// ---- per-type field lists (keys mirror the Task 2 detail endpoint) ----

function Fields({ node, d }: { node: GraphNode; d: Record<string, unknown> }) {
  switch (node.type) {
    case "study":
      return (
        <>
          <Row label="Title" value={txt(d.title)} />
          <Row label="Submitter" value={txt(d.submitter)} />
          <Row label="Dates" value={range(d.date_min, d.date_max)} />
          <Row label="Samples" value={dash(d.samples)} />
          <Row label="Runs" value={runs(d.runs)} />
          <Row label="Bytes" value={bytes(d.bytes)} />
          {typeof d.abstract === "string" && d.abstract && (
            <p className="pt-1 text-[var(--text-dim)]">{d.abstract}</p>
          )}
          <TopList items={d.top_organisms} labelKey="name" />
          <Chips items={d.platforms} label="Platforms" />
        </>
      );
    case "sample":
      return (
        <>
          <Row label="Organism" value={txt(d.organism)} />
          <Row label="Lineage" value={lineageText(d.lineage)} />
          <Row label="Host" value={txt(d.host)} />
          <Row label="Tissue" value={txt(d.tissue)} />
          <Row label="Region" value={txt(d.region)} />
          <Row label="Collected" value={txt(d.collection_date)} />
          <Row label="Runs" value={runs(d.runs)} />
          <Row label="Bytes" value={bytes(d.bytes)} />
          <Row label="Study" value={txt(d.study)} />
        </>
      );
    case "organism":
      return (
        <>
          <Row label="Lineage" value={lineageText(d.lineage)} />
          <Row label="Human class" value={txt(d.human_class)} />
          <Row label="Studies" value={dash(d.studies)} />
          <Row label="Runs" value={runs(d.runs)} />
        </>
      );
    case "submitter":
      return (
        <>
          <Row label="Studies" value={dash(d.studies)} />
          <Row label="Runs" value={runs(d.runs)} />
          <TopList items={d.top_organisms} labelKey="name" />
        </>
      );
    case "platform": case "strategy": case "region":
      return (
        <>
          <Row label="Runs" value={runs(d.runs)} />
          <TopList items={d.top_studies} labelKey="accession" />
        </>
      );
    case "term":
      return (
        <>
          <Row label="Label" value={txt(d.label)} />
          <Row label="Runs" value={runs(d.runs)} />
          <Row label="Samples" value={dash(d.samples)} />
          <TopList items={d.top_studies} labelKey="accession" />
        </>
      );
    case "taxon":
      return (
        <>
          <Row label="Rank" value={txt(d.rank)} />
          <Row label="Name" value={txt(d.name)} />
          <Row label="Organisms" value={dash(d.organisms)} />
          <Row label="Runs" value={runs(d.runs)} />
        </>
      );
    default:
      return <Row label="Type" value={node.type} />;
  }
}
