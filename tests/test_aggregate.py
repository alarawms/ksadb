from sync.aggregate import AGGREGATES


def test_known_aggregates():
    assert set(AGGREGATES) >= {"summary", "by-month", "by-country", "by-organism",
                               "by-submitter", "by-platform", "by-strategy", "by-region"}
    assert "GROUP BY" in AGGREGATES["by-country"]
    # summary must not GROUP BY
    assert "GROUP BY" not in AGGREGATES["summary"]


def test_all_aggregates_are_saudi_scoped():
    """Dashboard aggregates power the Saudi-scope portal: every aggregate must
    restrict to samples.country = 'SA' (the store deliberately holds all GCC
    rows; read paths must never leak them)."""
    for name, sql in AGGREGATES.items():
        assert "JOIN samples s" in sql, f"{name}: missing samples join"
        assert "s.country = 'SA'" in sql, f"{name}: missing Saudi filter"
