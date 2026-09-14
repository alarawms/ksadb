import { cachedJson, STATS_TTL } from "../../_lib/cache";
import { Env, json } from "../../_lib/db";
import { classifyHuman } from "../_lib/human";

const SA = `s.country = 'SA'`;
const SAMPLES_RUNS = `JOIN samples s ON s.biosample_accession = r.biosample_accession`;
// for queries anchored at sample_terms (no ena_runs alias r in scope)
const TERMS_SAMPLES = `JOIN samples s ON s.biosample_accession = st.biosample_accession`;

const TOP = 5;

type Db = D1Database;

interface Lineage { genus: string | null; family: string | null; phylum: string | null }

const notFound = (type: string, id: string) =>
  json({ error: "not found", message: `${type} ${id} not found in Saudi scope.` }, 404);

// ---- study: header + run stats + top organisms/platforms ----

async function studyDetail(db: Db, acc: string) {
  const row = await db.prepare(
    `SELECT st.accession, st.title, st.abstract, sub.center_name AS submitter,
            MIN(r.submitted_date) AS date_min, MAX(r.submitted_date) AS date_max,
            COUNT(DISTINCT r.biosample_accession) AS samples, COUNT(*) AS runs,
            COALESCE(SUM(r.bytes), 0) AS bytes
     FROM studies st
     LEFT JOIN submitters sub ON sub.id = st.submitter_id
     JOIN ena_runs r ON r.study_accession = st.accession
     ${SAMPLES_RUNS}
     WHERE st.accession = ? AND ${SA}`
  ).bind(acc).first<{
    accession: string; title: string | null; abstract: string | null; submitter: string | null;
    date_min: string | null; date_max: string | null; samples: number; runs: number; bytes: number;
  }>();
  if (!row) return null;
  const { results: orgs } = await db.prepare(
    `SELECT s.organism AS name, COUNT(*) AS runs
     FROM ena_runs r ${SAMPLES_RUNS}
     WHERE r.study_accession = ? AND ${SA} AND s.organism IS NOT NULL
     GROUP BY s.organism ORDER BY runs DESC LIMIT ${TOP}`
  ).bind(acc).all<{ name: string; runs: number }>();
  const { results: plats } = await db.prepare(
    `SELECT DISTINCT r.platform AS name FROM ena_runs r ${SAMPLES_RUNS}
     WHERE r.study_accession = ? AND ${SA} AND r.platform IS NOT NULL LIMIT ${TOP}`
  ).bind(acc).all<{ name: string }>();
  return { ...row, bytes: Number(row.bytes), top_organisms: orgs, platforms: plats.map((p) => p.name) };
}

// ---- sample: sample row + lineage + primary study + run stats ----

async function sampleDetail(db: Db, acc: string) {
  const row = await db.prepare(
    `SELECT s.biosample_accession AS accession, s.organism, s.host, s.tissue,
            s.region, s.collection_date,
            t.genus, t.family, t.phylum,
            COUNT(*) AS runs, COALESCE(SUM(r.bytes), 0) AS bytes
     FROM samples s
     LEFT JOIN taxonomy t ON t.tax_id = s.tax_id
     JOIN ena_runs r ON r.biosample_accession = s.biosample_accession
     WHERE s.biosample_accession = ? AND ${SA}
     GROUP BY s.biosample_accession`
  ).bind(acc).first<{
    accession: string; organism: string | null; host: string | null; tissue: string | null;
    region: string | null; collection_date: string | null;
    genus: string | null; family: string | null; phylum: string | null;
    runs: number; bytes: number;
  }>();
  if (!row) return null;
  // primary study: the one carrying most of this sample's Saudi runs
  const study = await db.prepare(
    `SELECT r.study_accession AS accession, COUNT(*) AS runs
     FROM ena_runs r ${SAMPLES_RUNS}
     WHERE r.biosample_accession = ? AND ${SA}
     GROUP BY r.study_accession ORDER BY runs DESC LIMIT 1`
  ).bind(acc).first<{ accession: string }>();
  const { genus, family, phylum, ...rest } = row;
  return {
    ...rest,
    bytes: Number(rest.bytes),
    lineage: { genus, family, phylum } satisfies Lineage,
    study: study?.accession ?? null,
  };
}

// ---- organism: aggregates + lineage + human classification ----

async function organismDetail(db: Db, name: string) {
  const agg = await db.prepare(
    `SELECT COUNT(DISTINCT r.study_accession) AS studies, COUNT(*) AS runs,
            MAX(s.tax_id) AS tax_id
     FROM ena_runs r ${SAMPLES_RUNS}
     WHERE s.organism = ? AND ${SA}`
  ).bind(name).first<{ studies: number; runs: number; tax_id: number | null }>();
  if (!agg || !agg.runs) return null;
  const { results: lineage } = await db.prepare(
    `SELECT t.genus, t.family, t.phylum
     FROM samples s JOIN taxonomy t ON t.tax_id = s.tax_id
     WHERE s.organism = ? AND ${SA} LIMIT 1`
  ).bind(name).all<{ genus: string | null; family: string | null; phylum: string | null }>();
  // tissue terms feed classifyHuman's human_associated rule, as in the graph focus
  const { results: tissue } = await db.prepare(
    `SELECT st.term_id FROM sample_terms st ${TERMS_SAMPLES}
     WHERE s.organism = ? AND ${SA} AND st.field = 'tissue'`
  ).bind(name).all<{ term_id: string }>();
  const lin = lineage[0];
  return {
    name,
    lineage: {
      genus: lin?.genus ?? null,
      family: lin?.family ?? null,
      phylum: lin?.phylum ?? null,
    } satisfies Lineage,
    human_class: classifyHuman(name, agg.tax_id, null, tissue.map((t) => t.term_id)),
    studies: agg.studies,
    runs: agg.runs,
  };
}

// ---- submitter: study/run aggregates + top organisms ----

async function submitterDetail(db: Db, name: string) {
  const agg = await db.prepare(
    `SELECT sub.center_name AS name, COUNT(DISTINCT st.accession) AS studies, COUNT(*) AS runs
     FROM ena_runs r ${SAMPLES_RUNS}
     JOIN studies st ON st.accession = r.study_accession
     JOIN submitters sub ON sub.id = st.submitter_id
     WHERE sub.center_name = ? AND ${SA}
     GROUP BY sub.center_name`
  ).bind(name).first<{ name: string; studies: number; runs: number }>();
  if (!agg) return null;
  const { results: orgs } = await db.prepare(
    `SELECT s.organism AS name, COUNT(*) AS runs
     FROM ena_runs r ${SAMPLES_RUNS}
     JOIN studies st ON st.accession = r.study_accession
     JOIN submitters sub ON sub.id = st.submitter_id
     WHERE sub.center_name = ? AND ${SA} AND s.organism IS NOT NULL
     GROUP BY s.organism ORDER BY runs DESC LIMIT ${TOP}`
  ).bind(name).all<{ name: string; runs: number }>();
  return { name: agg.name, studies: agg.studies, runs: agg.runs, top_organisms: orgs };
}

// ---- platform / strategy / region: runs + top studies ----

async function attributeDetail(db: Db, type: "platform" | "strategy" | "region", name: string) {
  const column = type === "platform" ? "r.platform" : type === "strategy" ? "r.library_strategy" : "s.region";
  const agg = await db.prepare(
    `SELECT ${column} AS name, COUNT(*) AS runs
     FROM ena_runs r ${SAMPLES_RUNS}
     WHERE ${column} = ? AND ${SA}
     GROUP BY ${column}`
  ).bind(name).first<{ name: string; runs: number }>();
  if (!agg) return null;
  const { results: studies } = await db.prepare(
    `SELECT r.study_accession AS accession, COUNT(*) AS runs
     FROM ena_runs r ${SAMPLES_RUNS}
     WHERE ${column} = ? AND ${SA}
     GROUP BY r.study_accession ORDER BY runs DESC LIMIT ${TOP}`
  ).bind(name).all<{ accession: string; runs: number }>();
  return { name: agg.name, runs: agg.runs, top_studies: studies };
}

// ---- term: label + Saudi run/sample counts + top studies ----

async function termDetail(db: Db, termId: string) {
  // the ontology label rides along as a scalar subquery: ontology_terms is keyed
  // by (field, value_norm), so a plain join on term_id would multiply rows and
  // inflate the DISTINCT counts.
  const agg = await db.prepare(
    `SELECT COUNT(DISTINCT s.biosample_accession) AS samples,
            COUNT(DISTINCT r.run_accession) AS runs,
            (SELECT label FROM ontology_terms ot WHERE ot.term_id = st.term_id LIMIT 1) AS label
     FROM sample_terms st ${TERMS_SAMPLES}
     JOIN ena_runs r ON r.biosample_accession = s.biosample_accession
     WHERE st.term_id = ? AND ${SA}`
  ).bind(termId).first<{ samples: number; runs: number; label: string | null }>();
  if (!agg || !agg.runs) return null;
  const { results: studies } = await db.prepare(
    `SELECT r.study_accession AS accession, COUNT(DISTINCT r.run_accession) AS runs
     FROM sample_terms st ${TERMS_SAMPLES}
     JOIN ena_runs r ON r.biosample_accession = s.biosample_accession
     WHERE st.term_id = ? AND ${SA}
     GROUP BY r.study_accession ORDER BY runs DESC LIMIT ${TOP}`
  ).bind(termId).all<{ accession: string; runs: number }>();
  return { id: termId, label: agg.label ?? termId, runs: agg.runs, samples: agg.samples, top_studies: studies };
}

// ---- taxon: rank-scoped organism/run aggregates ----

async function taxonDetail(db: Db, id: string) {
  const m = /^(genus|family|phylum):(.+)$/.exec(id);
  if (!m) return null;
  const [, rank, value] = m;
  // rank is validated against the regex capture, so t.${rank} is a fixed column
  const agg = await db.prepare(
    `SELECT COUNT(DISTINCT s.organism) AS organisms, COUNT(*) AS runs
     FROM ena_runs r ${SAMPLES_RUNS}
     JOIN taxonomy t ON t.tax_id = s.tax_id
     WHERE t.${rank} = ? AND ${SA}`
  ).bind(value).first<{ organisms: number; runs: number }>();
  if (!agg || !agg.runs) return null;
  return { rank, name: value, organisms: agg.organisms, runs: agg.runs };
}

const TYPES = new Set(["study", "sample", "organism", "submitter", "platform", "strategy", "region", "term", "taxon"]);

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const m = /^([^:]+):([\s\S]+)$/.exec(url.searchParams.get("node") ?? "");
  const type = m?.[1];
  const id = m?.[2];
  if (!type || !id || !TYPES.has(type) || (type === "taxon" && !/^(genus|family|phylum):/.test(id))) {
    return json({ error: "invalid node" }, 400);
  }
  try {
    return await cachedJson(request, STATS_TTL, async () => {
      let payload: unknown = null;
      switch (type) {
        case "study": payload = await studyDetail(env.DB, id); break;
        case "sample": payload = await sampleDetail(env.DB, id); break;
        case "organism": payload = await organismDetail(env.DB, id); break;
        case "submitter": payload = await submitterDetail(env.DB, id); break;
        case "platform": case "strategy": case "region": payload = await attributeDetail(env.DB, type, id); break;
        case "term": payload = await termDetail(env.DB, id); break;
        default: payload = await taxonDetail(env.DB, id); break;
      }
      if (payload === null) return notFound(type, id);
      return json(payload);
    });
  } catch {
    return json(
      {
        error: "temporarily_unavailable",
        message:
          "Graph detail is temporarily unavailable (daily database quota). Retry in a few minutes.",
      },
      503
    );
  }
};
