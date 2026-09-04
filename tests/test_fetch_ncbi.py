from sync.fetch import fetch_ncbi

ESEARCH_JSON = {
    "esearchresult": {"count": "2", "webenv": "W1", "querykey": "1"}
}

RUNINFO_CSV = (
    "Run,BioProject,BioSample,bases,spots,ReleaseDate,Platform,Model,"
    "LibraryStrategy,LibrarySource,ScientificName,CenterName,size_MB\n"
    "SRR100,PRJNA100,SAMN100,1000,10,2024-01-01 00:00:00,ILLUMINA,"
    "Illumina NovaSeq 6000,WGS,GENOMIC,Homo sapiens,KAUST,1.5\n"
    "SRR101,PRJNA100,SAMN101,2000,20,2024-02-01 00:00:00,ILLUMINA,"
    "Illumina NovaSeq 6000,AMPLICON,METAGENOMIC,soil metagenome,KAUST,2.5\n"
)


class FakeResponse:
    def __init__(self, *, json_data=None, text=""):
        self._json = json_data
        self.text = text

    def raise_for_status(self):
        return None

    def json(self):
        return self._json


class FakeHTTP:
    def __init__(self):
        self.calls = []

    def get(self, url, params=None, timeout=None):
        self.calls.append((url, params))
        if url.endswith("esearch.fcgi"):
            return FakeResponse(json_data=ESEARCH_JSON)
        if url.endswith("efetch.fcgi"):
            return FakeResponse(text=RUNINFO_CSV)
        raise AssertionError(f"unexpected URL: {url}")


def test_fetch_ncbi_maps_runinfo():
    rows = fetch_ncbi(http=FakeHTTP())
    assert len(rows) == 2
    row = rows[0]
    assert row["run_accession"] == "SRR100"
    assert row["bioproject_accession"] == "PRJNA100"
    assert row["total_bases"] == 1000
    assert row["platform"] == "ILLUMINA"
    assert row["instrument_model"] == "Illumina NovaSeq 6000"
    assert row["source"] == "NCBI"
    assert row["institution_name"] == "KAUST"
    assert row["is_saudi_submitter"] is True
    assert row["is_wgs"] is True
    assert rows[1]["is_wgs"] is False  # metagenome excluded
