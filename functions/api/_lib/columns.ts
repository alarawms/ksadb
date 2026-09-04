// RunOut field order must match v1 exactly (CSV export header compatibility).
export const RUN_FIELDS = [
  "run_accession", "bioproject_accession", "biosample_accession", "total_bases",
  "platform", "instrument_model", "library_strategy", "organism", "center_name",
  "institution_name", "geo_loc_name", "source", "year", "published_dt",
  "is_saudi_submitter", "is_pathogen", "is_wgs",
] as const;

export const RUN_COLUMNS = RUN_FIELDS.join(", ");

export const RECORD_FIELDS = [
  ...RUN_FIELDS, "total_spots", "file_size_mb", "organization_name",
] as const;

export const RECORD_COLUMNS = RECORD_FIELDS.join(", ");
