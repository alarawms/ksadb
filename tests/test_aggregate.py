from sync.aggregate import AGGREGATES


def test_known_aggregates():
    assert set(AGGREGATES) >= {"summary", "by-month", "by-country", "by-organism",
                               "by-submitter", "by-platform", "by-strategy", "by-region"}
    assert "GROUP BY" in AGGREGATES["by-country"]
    # summary must not GROUP BY
    assert "GROUP BY" not in AGGREGATES["summary"]
