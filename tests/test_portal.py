import pytest
from sync.portal import PORTAL_FIELDS, COUNTRIES, PortalError, fetch_country


class FakeResponse:
    """Serves paginated JSON; the first `fail_first` requests raise on status."""

    def __init__(self, pages, fail_first=0):
        self.pages = pages
        self.calls = 0
        self.fail_first = fail_first

    def raise_for_status(self):
        self.calls += 1  # every attempt consumes a call, failed or not
        if self.calls <= self.fail_first:
            raise RuntimeError("503")

    def json(self):
        idx = self.calls - 1 - self.fail_first
        if idx >= len(self.pages):
            return []  # exhausted — signals end of pagination
        return self.pages[idx]


class FakeHttp:
    """Records requested offsets and serves one shared FakeResponse."""

    def __init__(self, pages, fail_first=0):
        self.response = FakeResponse(pages, fail_first=fail_first)
        self.offsets = []

    def get(self, url, params=None, headers=None, timeout=None):
        self.offsets.append(params["offset"])
        return self.response


def test_fetch_country_paginates_and_retries():
    pages = [[{"run_accession": "ERR1"}], [{"run_accession": "ERR2"}]]
    http = FakeHttp(pages, fail_first=1)   # first page request fails once
    rows = fetch_country("Saudi Arabia", http=http, page_size=1)
    assert [r["run_accession"] for r in rows] == ["ERR1", "ERR2"]


def test_fetch_country_gives_up_after_six_failures():
    http = FakeHttp([], fail_first=99)
    with pytest.raises(PortalError):
        fetch_country("Saudi Arabia", http=http)
