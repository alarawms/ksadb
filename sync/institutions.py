"""Keyword-based canonicalization of submitter center names (reused logic
from notebooks/saudi-seqdb-report/generate_combined_notebook.py).

The dict order mirrors the notebook's if/elif chain: the first keyword
match wins. Two entries that predate the port and have no notebook
equivalent (KACST, Saudi Genome Program) are kept at the end.
"""

SAUDI_INSTITUTION_KEYWORDS: dict[str, tuple[str, ...]] = {
    "KAUST": (
        "kaust",
        "king abdullah university of science and technology",
        "k.a.u.s.t",
        "computational bioscience research center",
    ),
    "King Saud University": ("king saud university", "ksu ", "saud university"),
    "King Abdulaziz University": (
        "king abdulaziz university",
        "kau ",
        "abdulaziz university",
    ),
    "King Faisal University": ("king faisal university", "kfu ", "faisal university"),
    "Imam Abdulrahman Bin Faisal University": (
        "imam abdulrahman",
        "dammam university",
        "iau ",
        "imam university",
    ),
    "Taif University": ("taif university", "taif"),
    "Qassim University": ("qassim university", "qassim", "qu "),
    "Majmaah University": ("majmaah university", "majmaah"),
    "KFUPM": ("king fahd university", "kfupm"),
    "Princess Nourah University": ("princess nourah", "nourah university", "pnu"),
    "King Khalid University": ("king khalid university", "kku"),
    "Umm Al-Qura University": ("umm al-qura", "umm al qura", "uqu"),
    "Taibah University": ("taibah university", "taibah"),
    "Jouf University": ("jouf university", "jouf", "al jouf"),
    "University of Tabuk": ("tabuk university", "tabuk"),
    "Northern Border University": ("northern border university", "nbu"),
    "University of Hail": ("hail university", "university of hail"),
    "Bisha University": ("bisha university", "bisha"),
    "Najran University": ("najran university", "najran"),
    "Jazan University": ("jazan university", "jazan"),
    "KSAU-HS": ("king saud bin abdulaziz", "ksau-hs"),
    "Alfaisal University": ("alfaisal university", "alfaisal"),
    "Effat University": ("effat university", "effat"),
    "Dar Al-Hekma University": ("dar al hekma", "dar al-hekma"),
    "KAIMRC": ("king abdullah international medical", "kaimrc"),
    "Saudi Ministry of Health": ("ministry of health", "moh ", "saudi ministry"),
    "King Faisal Specialist Hospital": (
        "king faisal specialist",
        "kfshtc",
        "kfsrh",
        "kfshrc",
    ),
    # Kept from the pre-port KSADB mapping (no notebook equivalent).
    "King Abdulaziz City for Science and Technology": (
        "kacst",
        "king abdulaziz city for science",
    ),
    "Saudi Genome Program": ("saudi genome",),
}


def normalize_institution(center_name, organization_name) -> str | None:
    text = f"{center_name or ''} {organization_name or ''}".lower()
    for canonical, keywords in SAUDI_INSTITUTION_KEYWORDS.items():
        if any(k in text for k in keywords):
            return canonical
    raw = (center_name or "").strip()
    return raw or None


def is_saudi_institution(name: str | None) -> bool:
    return name in SAUDI_INSTITUTION_KEYWORDS
