from sync.fetch import fetch_ena, pull_rows

ENA_TSV = (
    "run_accession\tstudy_accession\tsecondary_sample_accession\tbase_count\t"
    "read_count\tfirst_public\tinstrument_platform\tinstrument_model\t"
    "library_strategy\tlibrary_source\tscientific_name\tcenter_name\n"
    "ERR200\tPRJEB200\tSAMEA200\t3000\t30\t2025-02-02\tOXFORD_NANOPORE\t"
    "PromethION\tWGS\tGENOMIC\tStaphylococcus aureus\tIAU CM\n"
    "SRRDUP\tPRJNA100\tSAMN100\t9999\t99\t2024-01-01\tILLUMINA\t"
    "NovaSeq\tWGS\tGENOMIC\tHomo sapiens\tForeign Center\n"
)


class FakeResponse:
    def __init__(self, *, text="", json_data=None):
        self.text = text
        self._json = json_data

    def raise_for_status(self):
        return None

    def json(self):
        return self._json


class FakeHTTP:
    """Serves ENA TSV for the portal and a minimal NCBI flow that overlaps ERR200."""

    def get(self, url, params=None, timeout=None):
        if url.endswith("esearch.fcgi"):
            return FakeResponse(
                json_data={"esearchresult": {"count": "0", "webenv": "W", "querykey": "1"}}
            )
        if url.endswith("efetch.fcgi"):
            return FakeResponse(text="Run,BioProject,BioSample,bases,spots,ReleaseDate,"
                                     "Platform,Model,LibraryStrategy,LibrarySource,"
                                     "ScientificName,CenterName,size_MB\n"
                                     "SRRDUP,PRJNA100,SAMN100,111,11,2024-01-01 00:00:00,"
                                     "ILLUMINA,NovaSeq,WGS,GENOMIC,Homo sapiens,KAUST,1.0\n")
        if "ebi.ac.uk" in url:
            return FakeResponse(text=ENA_TSV)
        raise AssertionError(f"unexpected URL: {url}")


def test_fetch_ena_maps_portal_tsv():
    rows = fetch_ena(http=FakeHTTP())
    assert len(rows) == 2
    row = rows[0]
    assert row["run_accession"] == "ERR200"
    assert row["total_bases"] == 3000
    assert row["source"] == "ENA"
    assert row["file_size_mb"] is None
    assert row["institution_name"] == "Imam Abdulrahman Bin Faisal University"
    assert row["is_pathogen"] is True


def test_pull_rows_prefers_ncbi_on_overlap():
    rows = pull_rows(http=FakeHTTP())
    assert len(rows) == 2
    dup = next(r for r in rows if r["run_accession"] == "SRRDUP")
    assert dup["source"] == "NCBI"  # NCBI record wins
    assert dup["institution_name"] == "KAUST"
    assert any(r["run_accession"] == "ERR200" for r in rows)
