from sync.institutions import is_saudi_institution, normalize_institution
from sync.normalize import finalize_row


def test_normalize_kaust_variants():
    assert normalize_institution("KAUST", None) == "KAUST"
    assert (
        normalize_institution("King Abdullah University of Science and Technology", None)
        == "KAUST"
    )
    assert (
        normalize_institution("Computational Bioscience Research Center", None) == "KAUST"
    )
    assert (
        normalize_institution("CBRC, Computational Bioscience Research Center, KA", None)
        == "KAUST"
    )


def test_normalize_iau():
    assert (
        normalize_institution("IAU CM", None)
        == "Imam Abdulrahman Bin Faisal University"
    )


def test_normalize_foreign_passthrough():
    assert normalize_institution("University of Konstanz", None) == "University of Konstanz"


def test_is_saudi():
    assert is_saudi_institution("KAUST") is True
    assert is_saudi_institution("University of Konstanz") is False


def test_finalize_row_flags():
    row = finalize_row(
        {
            "center_name": "KAUST",
            "organization_name": None,
            "library_strategy": "WGS",
            "library_source": "GENOMIC",
            "organism": "Homo sapiens",
            "published_dt": "2025-02-02 00:00:00",
        }
    )
    assert row["institution_name"] == "KAUST"
    assert row["is_saudi_submitter"] is True
    assert row["is_wgs"] is True
    assert row["is_pathogen"] is False
    assert row["year"] == 2025


def test_finalize_row_pathogen_and_metagenome_not_wgs():
    row = finalize_row(
        {
            "center_name": "X",
            "organization_name": None,
            "library_strategy": "WGS",
            "library_source": "METAGENOMIC",
            "organism": "soil metagenome",
            "published_dt": None,
        }
    )
    assert row["is_wgs"] is False
    assert row["year"] is None
    pathogen = finalize_row(
        {
            "center_name": "X",
            "organization_name": None,
            "library_strategy": "WGS",
            "library_source": "GENOMIC",
            "organism": "Staphylococcus aureus",
            "published_dt": None,
        }
    )
    assert pathogen["is_pathogen"] is True
