import { cachedJson, STATS_TTL } from "../_lib/cache";
import { Env, json } from "../_lib/db";
import { classifyHuman, HumanClass } from "./_lib/human";

type NodeType = "submitter" | "study" | "sample" | "organism" | "taxon"
  | "platform" | "strategy" | "region" | "publication" | "term";
interface GraphNode { id: string; type: NodeType; label: string; count?: number;
  human_class?: HumanClass; link?: string | null }
interface GraphEdge { source: string; target: string; kind: string; count?: number }
interface Graph { nodes: GraphNode[]; edges: GraphEdge[] }

const CAP = 50;
const SA = `s.country = 'SA'`;
const SAMPLES_RUNS = `JOIN samples s ON s.biosample_accession = r.biosample_accession`;
// for queries anchored at sample_terms (no ena_runs alias r in scope)
const TERMS_SAMPLES = `JOIN samples s ON s.biosample_accession = st.biosample_accession`;

type Db = D1Database;

function node(type: NodeType, key: string, label: string, extra?: Partial<GraphNode>): GraphNode {
  return { id: `${type}:${key}`, type, label, ...extra };
}

function addEdge(edges: GraphEdge[], source: string, target: string, kind: string, count?: number) {
  edges.push(count === undefined ? { source, target, kind } : { source, target, kind, count });
}

function linkFor(type: NodeType, key: string, label: string): string | null | undefined {
  switch (type) {
    case "submitter": return `/institution?name=${encodeURIComponent(label)}`;
    case "study": return `/study?id=${encodeURIComponent(key)}`;
    case "sample": return `/search?q=${encodeURIComponent(key)}`;
    case "organism": return `/search?organism=${encodeURIComponent(key)}`;
    case "platform": return `/search?platform=${encodeURIComponent(key)}`;
    case "strategy": return `/search?strategy=${encodeURIComponent(key)}`;
    case "region": return `/search?region=${encodeURIComponent(key)}`;
    default: return undefined;
  }
}

// ---- default hub: top Saudi submitters and their studies ----

async function hubSubmitter(db: Db): Promise<Graph> {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const submitters = await db.prepare(
    `SELECT sub.center_name AS name, COUNT(*) AS runs
     FROM ena_runs r ${SAMPLES_RUNS}
     JOIN studies st ON st.accession = r.study_accession
     JOIN submitters sub ON sub.id = st.submitter_id
     WHERE ${SA} GROUP BY sub.center_name ORDER BY runs DESC LIMIT 8`
  ).bind().all<{ name: string; runs: number }>();
  for (const sub of submitters.results) {
    const subId = `submitter:${sub.name}`;
    nodes.push(node("submitter", sub.name, sub.name, { count: sub.runs, link: linkFor("submitter", sub.name, sub.name) }));
    const studies = await db.prepare(
      `SELECT st.accession, st.title, COUNT(*) AS runs
       FROM studies st
       JOIN submitters sub ON sub.id = st.submitter_id
       JOIN ena_runs r ON r.study_accession = st.accession
       ${SAMPLES_RUNS}
       WHERE sub.center_name = ? AND ${SA}
       GROUP BY st.accession ORDER BY runs DESC LIMIT 10`
    ).bind(sub.name).all<{ accession: string; title: string | null; runs: number }>();
    for (const st of studies.results) {
      nodes.push(node("study", st.accession, st.title ?? st.accession, { count: st.runs, link: linkFor("study", st.accession, st.title ?? st.accession) }));
      addEdge(edges, subId, `study:${st.accession}`, "submitted", st.runs);
    }
  }
  return { nodes, edges };
}

// ---- shared run-attribute neighbors (platform / strategy / region) ----

async function runAttributeNodes(
  db: Db, scopeSql: string, scopeParam: string, self: GraphNode, edges: GraphEdge[], nodes: GraphNode[]
) {
  const attrs: { type: NodeType; sql: string }[] = [
    { type: "platform", sql: `SELECT r.platform AS name, COUNT(*) AS runs FROM ena_runs r ${SAMPLES_RUNS} WHERE ${scopeSql} AND ${SA} AND r.platform IS NOT NULL GROUP BY r.platform ORDER BY runs DESC LIMIT ${CAP}` },
    { type: "strategy", sql: `SELECT r.library_strategy AS name, COUNT(*) AS runs FROM ena_runs r ${SAMPLES_RUNS} WHERE ${scopeSql} AND ${SA} AND r.library_strategy IS NOT NULL GROUP BY r.library_strategy ORDER BY runs DESC LIMIT ${CAP}` },
    { type: "region", sql: `SELECT s.region AS name, COUNT(*) AS runs FROM ena_runs r ${SAMPLES_RUNS} WHERE ${scopeSql} AND ${SA} AND s.region IS NOT NULL GROUP BY s.region ORDER BY runs DESC LIMIT ${CAP}` },
  ];
  for (const { type, sql } of attrs) {
    const { results } = await db.prepare(sql).bind(scopeParam).all<{ name: string; runs: number }>();
    for (const row of results) {
      nodes.push(node(type as NodeType, row.name, row.name, { count: row.runs, link: linkFor(type as NodeType, row.name, row.name) }));
      addEdge(edges, self.id, `${type}:${row.name}`, type === "platform" ? "sequenced_with" : type === "strategy" ? "sequenced_as" : "located_in", row.runs);
    }
  }
}

// ---- study focus ----

async function focusStudy(db: Db, acc: string): Promise<Graph> {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const study = await db.prepare(
    `SELECT st.accession, st.title, COUNT(*) AS runs
     FROM studies st
     JOIN ena_runs r ON r.study_accession = st.accession
     ${SAMPLES_RUNS}
     WHERE st.accession = ? AND ${SA} GROUP BY st.accession`
  ).bind(acc).first<{ accession: string; title: string | null; runs: number }>();
  const label = study?.title ?? acc;
  const self = node("study", acc, label, { count: study?.runs, link: linkFor("study", acc, label) });
  nodes.push(self);

  const { results: samples } = await db.prepare(
    `SELECT s.biosample_accession AS accession, COUNT(*) AS n
     FROM samples s JOIN ena_runs r ON r.biosample_accession = s.biosample_accession
     WHERE r.study_accession = ? AND ${SA} GROUP BY s.biosample_accession LIMIT ${CAP}`
  ).bind(acc).all<{ accession: string; n: number }>();
  for (const row of samples) {
    nodes.push(node("sample", row.accession, row.accession, { count: row.n, link: linkFor("sample", row.accession, row.accession) }));
    addEdge(edges, self.id, `sample:${row.accession}`, "samples", row.n);
  }

  // tissue terms grouped per organism for human classification
  const { results: tissue } = await db.prepare(
    `SELECT s.organism AS organism, st.term_id
     FROM sample_terms st ${SAMPLES_RUNS}
     JOIN ena_runs r ON r.biosample_accession = s.biosample_accession
     WHERE r.study_accession = ? AND ${SA} AND st.field = 'tissue'`
  ).bind(acc).all<{ organism: string | null; term_id: string }>();
  const tissueByOrganism = new Map<string, string[]>();
  for (const row of tissue) {
    const key = row.organism ?? "";
    if (!tissueByOrganism.has(key)) tissueByOrganism.set(key, []);
    tissueByOrganism.get(key)!.push(row.term_id);
  }

  const { results: organisms } = await db.prepare(
    `SELECT s.organism AS name, s.tax_id AS tax_id, COUNT(*) AS n
     FROM samples s JOIN ena_runs r ON r.biosample_accession = s.biosample_accession
     WHERE r.study_accession = ? AND ${SA} AND s.organism IS NOT NULL
     GROUP BY s.organism, s.tax_id ORDER BY n DESC LIMIT ${CAP}`
  ).bind(acc).all<{ name: string; tax_id: number | null; n: number }>();
  for (const row of organisms) {
    const humanClass = classifyHuman(row.name, row.tax_id, null, tissueByOrganism.get(row.name) ?? []);
    nodes.push(node("organism", row.name, row.name, { count: row.n, human_class: humanClass, link: linkFor("organism", row.name, row.name) }));
    addEdge(edges, self.id, `organism:${row.name}`, "classifies", row.n);
  }

  await runAttributeNodes(db, "r.study_accession = ?", acc, self, edges, nodes);

  const { results: terms } = await db.prepare(
    `SELECT st.term_id, st.field, COUNT(*) AS n
     FROM sample_terms st ${SAMPLES_RUNS}
     JOIN ena_runs r ON r.biosample_accession = s.biosample_accession
     WHERE r.study_accession = ? AND ${SA} GROUP BY st.term_id, st.field LIMIT ${CAP}`
  ).bind(acc).all<{ term_id: string; field: string; n: number }>();
  for (const row of terms) {
    nodes.push(node("term", row.term_id, row.term_id, { count: row.n }));
    addEdge(edges, self.id, `term:${row.term_id}`, "annotated_with", row.n);
  }

  const pubId = `publication:none:${acc}`;
  nodes.push({ id: pubId, type: "publication", label: "No publication linked", link: null });
  addEdge(edges, self.id, pubId, "publishes");
  return { nodes, edges };
}

// ---- sample focus ----

async function focusSample(db: Db, acc: string): Promise<Graph> {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const sample = await db.prepare(
    `SELECT s.biosample_accession AS accession, s.organism, s.tax_id, s.host
     FROM samples s WHERE s.biosample_accession = ? AND ${SA}`
  ).bind(acc).first<{ accession: string; organism: string | null; tax_id: number | null; host: string | null }>();
  const self = node("sample", acc, acc, { link: linkFor("sample", acc, acc) });
  nodes.push(self);

  const { results: tissue } = await db.prepare(
    `SELECT st.term_id FROM sample_terms st ${TERMS_SAMPLES}
     WHERE s.biosample_accession = ? AND ${SA} AND st.field = 'tissue'`
  ).bind(acc).all<{ term_id: string }>();

  if (sample?.organism) {
    const humanClass = classifyHuman(sample.organism, sample.tax_id, sample.host, tissue.map((t) => t.term_id));
    nodes.push(node("organism", sample.organism, sample.organism, { human_class: humanClass, link: linkFor("organism", sample.organism, sample.organism) }));
    addEdge(edges, self.id, `organism:${sample.organism}`, "classifies");
  }

  const { results: studies } = await db.prepare(
    `SELECT r.study_accession AS accession, COUNT(*) AS runs
     FROM ena_runs r ${SAMPLES_RUNS}
     WHERE r.biosample_accession = ? AND ${SA} GROUP BY r.study_accession LIMIT ${CAP}`
  ).bind(acc).all<{ accession: string; runs: number }>();
  for (const row of studies) {
    nodes.push(node("study", row.accession, row.accession, { count: row.runs, link: linkFor("study", row.accession, row.accession) }));
    addEdge(edges, self.id, `study:${row.accession}`, "samples", row.runs);
  }

  await runAttributeNodes(db, "r.biosample_accession = ?", acc, self, edges, nodes);

  const { results: terms } = await db.prepare(
    `SELECT st.term_id, st.field, COUNT(*) AS n
     FROM sample_terms st ${TERMS_SAMPLES}
     WHERE s.biosample_accession = ? AND ${SA} GROUP BY st.term_id, st.field LIMIT ${CAP}`
  ).bind(acc).all<{ term_id: string; field: string; n: number }>();
  for (const row of terms) {
    nodes.push(node("term", row.term_id, row.term_id, { count: row.n }));
    addEdge(edges, self.id, `term:${row.term_id}`, "annotated_with", row.n);
  }
  return { nodes, edges };
}

// ---- organism focus ----

async function focusOrganism(db: Db, name: string): Promise<Graph> {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const self = node("organism", name, name, { link: linkFor("organism", name, name) });
  nodes.push(self);
  const { results: studies } = await db.prepare(
    `SELECT st.accession, st.title, COUNT(*) AS runs
     FROM studies st
     JOIN ena_runs r ON r.study_accession = st.accession
     ${SAMPLES_RUNS}
     WHERE s.organism = ? AND ${SA} GROUP BY st.accession ORDER BY runs DESC LIMIT ${CAP}`
  ).bind(name).all<{ accession: string; title: string | null; runs: number }>();
  for (const row of studies) {
    nodes.push(node("study", row.accession, row.title ?? row.accession, { count: row.runs, link: linkFor("study", row.accession, row.title ?? row.accession) }));
    addEdge(edges, self.id, `study:${row.accession}`, "studies", row.runs);
  }
  const { results: samples } = await db.prepare(
    `SELECT s.biosample_accession AS accession, COUNT(*) AS n
     FROM samples s JOIN ena_runs r ON r.biosample_accession = s.biosample_accession
     WHERE s.organism = ? AND ${SA} GROUP BY s.biosample_accession LIMIT ${CAP}`
  ).bind(name).all<{ accession: string; n: number }>();
  for (const row of samples) {
    nodes.push(node("sample", row.accession, row.accession, { count: row.n, link: linkFor("sample", row.accession, row.accession) }));
    addEdge(edges, self.id, `sample:${row.accession}`, "samples", row.n);
  }
  return { nodes, edges };
}

// ---- platform / strategy / region focus ----

async function focusSimple(db: Db, type: "platform" | "strategy" | "region", name: string): Promise<Graph> {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const self = node(type, name, name, { link: linkFor(type, name, name) });
  nodes.push(self);
  const column = type === "platform" ? "r.platform" : type === "strategy" ? "r.library_strategy" : "s.region";
  const { results: studies } = await db.prepare(
    `SELECT r.study_accession AS accession, COUNT(*) AS runs
     FROM ena_runs r ${SAMPLES_RUNS}
     WHERE ${column} = ? AND ${SA} GROUP BY r.study_accession ORDER BY runs DESC LIMIT ${CAP}`
  ).bind(name).all<{ accession: string; runs: number }>();
  for (const row of studies) {
    nodes.push(node("study", row.accession, row.accession, { count: row.runs, link: linkFor("study", row.accession, row.accession) }));
    addEdge(edges, self.id, `study:${row.accession}`, "studies", row.runs);
  }
  return { nodes, edges };
}

// ---- term focus ----

async function focusTerm(db: Db, termId: string): Promise<Graph> {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const self = node("term", termId, termId);
  nodes.push(self);
  const { results: samples } = await db.prepare(
    `SELECT s.biosample_accession AS accession, COUNT(*) AS n
     FROM sample_terms st ${TERMS_SAMPLES}
     WHERE st.term_id = ? AND ${SA} GROUP BY s.biosample_accession LIMIT ${CAP}`
  ).bind(termId).all<{ accession: string; n: number }>();
  for (const row of samples) {
    nodes.push(node("sample", row.accession, row.accession, { count: row.n, link: linkFor("sample", row.accession, row.accession) }));
    addEdge(edges, self.id, `sample:${row.accession}`, "annotated_with", row.n);
  }
  const { results: studies } = await db.prepare(
    `SELECT r.study_accession AS accession, COUNT(*) AS runs
     FROM sample_terms st ${TERMS_SAMPLES}
     JOIN ena_runs r ON r.biosample_accession = s.biosample_accession
     WHERE st.term_id = ? AND ${SA} GROUP BY r.study_accession LIMIT ${CAP}`
  ).bind(termId).all<{ accession: string; runs: number }>();
  for (const row of studies) {
    nodes.push(node("study", row.accession, row.accession, { count: row.runs, link: linkFor("study", row.accession, row.accession) }));
    addEdge(edges, self.id, `study:${row.accession}`, "studies", row.runs);
  }
  return { nodes, edges };
}

// ---- submitter focus ----

async function focusSubmitter(db: Db, name: string): Promise<Graph> {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const self = node("submitter", name, name, { link: linkFor("submitter", name, name) });
  nodes.push(self);
  const { results: studies } = await db.prepare(
    `SELECT st.accession, st.title, COUNT(*) AS runs
     FROM studies st
     JOIN submitters sub ON sub.id = st.submitter_id
     JOIN ena_runs r ON r.study_accession = st.accession
     ${SAMPLES_RUNS}
     WHERE sub.center_name = ? AND ${SA} GROUP BY st.accession ORDER BY runs DESC LIMIT ${CAP}`
  ).bind(name).all<{ accession: string; title: string | null; runs: number }>();
  for (const row of studies) {
    nodes.push(node("study", row.accession, row.title ?? row.accession, { count: row.runs, link: linkFor("study", row.accession, row.title ?? row.accession) }));
    addEdge(edges, self.id, `study:${row.accession}`, "submitted", row.runs);
  }
  return { nodes, edges };
}

const FOCUS_TYPES = new Set(["submitter", "study", "sample", "organism", "platform", "strategy", "region", "term"]);

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const focus = url.searchParams.get("focus");
  if (!focus) {
    try {
      return await cachedJson(request, STATS_TTL, async () => json(await hubSubmitter(env.DB)));
    } catch {
      return json(
        {
          error: "temporarily_unavailable",
          message:
            "Graph is temporarily unavailable (daily database quota). Retry in a few minutes.",
        },
        503
      );
    }
  }
  const m = /^([^:]+):([\s\S]+)$/.exec(focus);
  const type = m?.[1];
  const id = m?.[2];
  if (!type || !id || !FOCUS_TYPES.has(type)) {
    return json({ error: "invalid focus" }, 400);
  }
  try {
    return await cachedJson(request, STATS_TTL, async () => {
      let graph: Graph;
      switch (type) {
        case "submitter": graph = await focusSubmitter(env.DB, id); break;
        case "study": graph = await focusStudy(env.DB, id); break;
        case "sample": graph = await focusSample(env.DB, id); break;
        case "organism": graph = await focusOrganism(env.DB, id); break;
        case "platform": case "strategy": case "region": graph = await focusSimple(env.DB, type, id); break;
        default: graph = await focusTerm(env.DB, id); break;
      }
      return json(graph);
    });
  } catch {
    return json(
      {
        error: "temporarily_unavailable",
        message:
          "Graph is temporarily unavailable (daily database quota). Retry in a few minutes.",
      },
      503
    );
  }
};
