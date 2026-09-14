export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`/api${path}`, { cache: "no-store" });
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
  library_source: string | null;
  ncbi_url: string;
  ena_url: string;
}

export interface FacetsResponse {
  platforms: { name: string; runs: number }[];
}

export interface InstitutionListItem {
  name: string;
  is_saudi: boolean;
  runs: number;
}

export interface InstitutionListResponse {
  items: InstitutionListItem[];
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

export interface SaudiSplitSide { runs: number; total_bases: number; }
export interface SaudiSplit { saudi: SaudiSplitSide | null; non_saudi: SaudiSplitSide | null; }

export interface PathogensResponse {
  top: TopRow[];
  by_year: TimeseriesPoint[];
}

export interface HumanStats {
  total_runs: number;
  total_bases: number;
  by_year: TimeseriesPoint[];
  top_institutions: TopRow[];
}

export interface SampleOut {
  biosample_accession: string;
  projects: string[];
  runs: RunItem[];
}

export interface SampleListItem {
  accession: string;
  runs: number;
  projects: number;
}

export interface SampleListResponse {
  items: SampleListItem[];
}

export interface V2Run {
  run_accession: string;
  study_accession: string;
  biosample_accession: string | null;
  bytes: number | null;
  spots: number | null;
  platform: string | null;
  instrument_model: string | null;
  library_strategy: string | null;
  submitted_date: string | null;
  fastq_ftp: string | null;
  fastq_bytes: string | null;
  organism: string | null;
  country: string | null;
  region: string | null;
  host: string | null;
  submitter: string | null;
  study_title: string | null;
}

export interface V2SearchResponse {
  total: number;
  page: number;
  page_size: number;
  items: V2Run[];
}

export interface V2FacetsResponse {
  countries: { name: string; runs: number }[];
  platforms: { name: string; runs: number }[];
  strategies: { name: string; runs: number }[];
  submitters: { name: string; runs: number }[];
  organisms: { name: string; runs: number }[];
}

export interface V2StudyDetail {
  accession: string;
  title: string | null;
  abstract: string | null;
  submitter: string | null;
  submitted_date: string | null;
  runs: V2Run[];
}

// Shapes of the R2 aggregate JSON files served by /api/v2/stats/[aggregate].
export interface V2StatsSummary {
  runs: number;
  studies: number;
  samples: number;
  bytes: number;
  date_min: string | null;
  date_max: string | null;
}

export interface V2MonthPoint { month: string; runs: number; bytes: number; }

// by-country/by-submitter rows carry extra columns (bytes/studies); the
// by-organism/by-platform/by-strategy rows only have { name, runs }.
export interface V2TopRow { name: string; runs: number; bytes?: number; studies?: number; }
