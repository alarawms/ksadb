export const API = process.env.API_URL ?? "http://localhost:8000";
export const PUBLIC_API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API}/api${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API ${path} -> ${res.status}`);
  return res.json();
}

export interface RunItem {
  run_accession: string;
  bioproject_accession: string | null;
  biosample_accession: string | null;
  total_bases: number | null;
  platform: string | null;
  instrument_model: string | null;
  library_strategy: string | null;
  organism: string | null;
  center_name: string | null;
  institution_name: string | null;
  geo_loc_name: string | null;
  source: string;
  year: number | null;
  published_dt: string | null;
  is_saudi_submitter: boolean;
  is_pathogen: boolean;
  is_wgs: boolean;
}

export interface SearchResponse {
  total: number;
  page: number;
  page_size: number;
  items: RunItem[];
}

export interface StatsSummary {
  total_runs: number;
  unique_bioprojects: number;
  unique_biosamples: number;
  total_bases: number;
  date_min: string | null;
  date_max: string | null;
}

export interface TimeseriesPoint { year: number; runs: number; total_bases: number; }
export interface TopRow { name: string; runs: number; total_bases: number; }

export interface RecordOut extends RunItem {
  total_spots: number | null;
  file_size_mb: number | null;
  organization_name: string | null;
  ncbi_url: string;
  ena_url: string;
}

export interface ProjectOut {
  bioproject_accession: string;
  title: string | null;
  institution_name: string | null;
  runs_count: number;
  total_bases: number;
  runs: RunItem[];
}

export interface InstitutionOut {
  name: string;
  is_saudi: boolean;
  runs: number;
  total_bases: number;
  unique_bioprojects: number;
}
