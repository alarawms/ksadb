# tests/test_star.py
from sync.star import GCC, normalize_country, row_to_entities

def test_normalize_country_slice():
    assert normalize_country("Saudi Arabia") == ("SA", "GCC")
    assert normalize_country("Saudi Arabia: Jeddah") == ("SA", "GCC")
    assert normalize_country("Yemen") == ("YE", "MENA")
    assert normalize_country("not a country") == (None, None)
    assert normalize_country(None) == (None, None)

ROW = {
    "run_accession": "ERR100", "study_accession": "PRJEB100",
    "sample_accession": "SAMEA100", "secondary_sample_accession": "SAMN100",
    "study_title": "Camel metagenomes", "experiment_title": "exp",
    "sample_title": "camel gut", "sample_description": "desc",
    "scientific_name": "Camelus dromedarius", "tax_id": "9838",
    "library_strategy": "WGS", "library_source": "METAGENOMIC",
    "instrument_platform": "ILLUMINA", "instrument_model": "NovaSeq 6000",
    "center_name": "KAUST", "first_public": "2025-01-01",
    "country": "Saudi Arabia", "collection_date": "2024-06-01",
    "location": "24.7 46.7", "host": "Camelus dromedarius", "tissue": "gut",
    "fastq_ftp": "ftp.example/ERR100.fastq", "fastq_md5": "abc",
    "fastq_bytes": "12345", "read_count": "100", "base_count": "10000",
}

def test_row_to_entities_prefers_secondary_accession():
    e = row_to_entities(ROW)
    assert e["sample"]["biosample_accession"] == "SAMN100"
    assert e["sample"]["country"] == "SA" and e["sample"]["region"] == "GCC"
    assert e["sample"]["tax_id"] == 9838
    assert e["run"]["bytes"] == 10000 and e["run"]["spots"] == 100
    assert e["run"]["biosample_accession"] == "SAMN100"
    assert e["study"]["title"] == "Camel metagenomes"
    assert e["submitter"]["center_name"] == "KAUST"
    # Abstract = study title + sample description joined (ENA has no abstract field)
    assert "Camel metagenomes" in e["study"]["abstract"]

def test_row_to_entities_falls_back_to_sample_accession():
    row = dict(ROW, secondary_sample_accession="")
    assert row_to_entities(row)["sample"]["biosample_accession"] == "SAMEA100"
