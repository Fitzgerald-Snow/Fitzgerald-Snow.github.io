#!/usr/bin/env python3
"""Extract the author roster from a Zotero collection export.

Accepts whatever Zotero's "Export Collection..." dialog produces:
CSV, BibTeX (.bib), RIS (.ris), CSL JSON or Zotero API JSON (.json).

    python3 tools/zotero_authors.py neural-computation.csv
    python3 tools/zotero_authors.py neural-computation.bib -o authors.json

Writes a JSON payload holding the parsed items plus an author table
(canonical name, paper count, the papers each author appears on), which is
the input the academic-tree page consumes.
"""

import argparse
import csv
import json
import re
import sys
import unicodedata
from collections import OrderedDict
from pathlib import Path

# ---------------------------------------------------------------- name utils

LATEX_ACCENT = re.compile(r'\\[\'"`^~=.uvHtcdbk]\s*\{?([A-Za-z])\}?')
BRACES = re.compile(r'[{}]')
SUFFIXES = {"jr", "jr.", "sr", "sr.", "ii", "iii", "iv"}
PARTICLES = {"van", "von", "de", "del", "della", "der", "den", "di", "da",
             "du", "la", "le", "ter", "ten", "bin", "al", "el", "dos", "das"}


def clean(text):
    """Strip LaTeX cruft and collapse whitespace."""
    if not text:
        return ""
    text = LATEX_ACCENT.sub(r"\1", text)
    text = BRACES.sub("", text)
    text = text.replace("\\&", "&").replace("~", " ")
    return re.sub(r"\s+", " ", text).strip()


def split_name(raw):
    """Return (given, family) from any of the shapes Zotero emits."""
    name = clean(raw).strip(" ,")
    if not name:
        return "", ""
    if "," in name:
        # "Sejnowski, Terrence J." -- may carry a suffix: "Doe, John, Jr."
        parts = [p.strip() for p in name.split(",")]
        family = parts[0]
        given = parts[1] if len(parts) > 1 else ""
        if len(parts) > 2 and parts[-1].lower().rstrip(".") in {
                s.rstrip(".") for s in SUFFIXES}:
            family = f"{family} {parts[-1]}"
        return given, family
    # "Terrence J. Sejnowski" -- family is the tail, pulling in any particles.
    tokens = name.split()
    if len(tokens) == 1:
        return "", tokens[0]
    cut = len(tokens) - 1
    while cut > 1 and tokens[cut - 1].lower().strip(".") in PARTICLES:
        cut -= 1
    return " ".join(tokens[:cut]), " ".join(tokens[cut:])


def display_name(given, family):
    given, family = given.strip(), family.strip()
    return f"{given} {family}".strip() if given else family


def fold(text):
    """Accent- and case-insensitive form, for matching only."""
    stripped = "".join(c for c in unicodedata.normalize("NFKD", text)
                       if not unicodedata.combining(c))
    return re.sub(r"[^a-z ]", "", stripped.lower()).strip()


def match_key(given, family):
    """Group name variants: family name + first initial.

    Collapses "T. Sejnowski" / "Terrence J. Sejnowski" / "Terrence Sejnowski"
    onto one node, which is what a genealogy tree needs.
    """
    initial = fold(given)[:1] if given else ""
    return f"{fold(family)}|{initial}"


# ------------------------------------------------------------------- parsers

def parse_csv(text):
    rows = list(csv.DictReader(text.splitlines()))
    items = []
    for row in rows:
        row = {(k or "").strip(): (v or "") for k, v in row.items()}
        people = [p for p in re.split(r";", row.get("Author", "")) if p.strip()]
        items.append({
            "title": clean(row.get("Title", "")),
            "year": (re.search(r"\d{4}", row.get("Date", "")) or [""])[0]
                    if re.search(r"\d{4}", row.get("Date", "")) else "",
            "venue": clean(row.get("Publication", "")),
            "authors": [split_name(p) for p in people],
        })
    return items


def parse_bibtex(text):
    items = []
    for chunk in re.split(r"@\w+\s*\{", text)[1:]:
        def field(name):
            m = re.search(rf'\b{name}\s*=\s*(?:\{{(.*?)\}}|"(.*?)"|([^,\n}}]+))',
                          chunk, re.S | re.I)
            if not m:
                return ""
            return clean(m.group(1) or m.group(2) or m.group(3) or "")
        authors = [split_name(a) for a in re.split(r"\s+and\s+", field("author"),
                                                   flags=re.I) if a.strip()]
        items.append({
            "title": field("title"),
            "year": field("year"),
            "venue": field("journal") or field("booktitle"),
            "authors": authors,
        })
    return items


def parse_ris(text):
    items, cur = [], None
    for line in text.splitlines():
        m = re.match(r"^([A-Z][A-Z0-9])\s+-\s?(.*)$", line)
        if not m:
            continue
        tag, val = m.group(1), m.group(2).strip()
        if tag == "TY":
            cur = {"title": "", "year": "", "venue": "", "authors": []}
            items.append(cur)
        elif cur is None:
            continue
        elif tag in ("AU", "A1"):
            cur["authors"].append(split_name(val))
        elif tag in ("TI", "T1") and not cur["title"]:
            cur["title"] = clean(val)
        elif tag in ("PY", "Y1") and not cur["year"]:
            found = re.search(r"\d{4}", val)
            cur["year"] = found.group(0) if found else ""
        elif tag in ("JO", "JF", "T2") and not cur["venue"]:
            cur["venue"] = clean(val)
    return items


def parse_json(text):
    data = json.loads(text)
    if isinstance(data, dict):
        data = data.get("items", [data])
    items = []
    for entry in data:
        entry = entry.get("data", entry)
        authors = []
        for c in entry.get("author", []) or entry.get("creators", []):
            if c.get("creatorType", "author") != "author":
                continue
            if "name" in c and not (c.get("family") or c.get("lastName")):
                authors.append(split_name(c["name"]))
            else:
                authors.append((c.get("given") or c.get("firstName") or "",
                                c.get("family") or c.get("lastName") or ""))
        date = entry.get("date") or entry.get("issued", {})
        if isinstance(date, dict):
            parts = date.get("date-parts") or [[""]]
            date = str(parts[0][0]) if parts and parts[0] else ""
        found = re.search(r"\d{4}", str(date))
        items.append({
            "title": clean(entry.get("title", "")),
            "year": found.group(0) if found else "",
            "venue": clean(entry.get("publicationTitle")
                           or entry.get("container-title") or ""),
            "authors": authors,
        })
    return items


def parse(path):
    text = Path(path).read_text(encoding="utf-8-sig", errors="replace")
    suffix = path.suffix.lower()
    if suffix == ".csv" or (suffix == "" and text.lstrip().startswith('"Key"')):
        return parse_csv(text)
    if suffix in (".bib", ".bibtex"):
        return parse_bibtex(text)
    if suffix == ".ris":
        return parse_ris(text)
    if suffix == ".json":
        return parse_json(text)
    # Fall back to sniffing the content.
    head = text.lstrip()[:400]
    if head.startswith(("[", "{")):
        return parse_json(text)
    if head.startswith("@"):
        return parse_bibtex(text)
    if re.match(r"^TY\s+-", head):
        return parse_ris(text)
    return parse_csv(text)


# ----------------------------------------------------------------- aggregate

def build(items):
    """Collapse author name variants and count papers per author."""
    authors = OrderedDict()
    papers = []
    for idx, item in enumerate(items):
        if not item["title"] and not item["authors"]:
            continue
        names = []
        for given, family in item["authors"]:
            if not family:
                continue
            key = match_key(given, family)
            shown = display_name(given, family)
            slot = authors.setdefault(
                key, {"name": shown, "variants": set(), "papers": []})
            slot["variants"].add(shown)
            # Keep the longest spelling as canonical -- most complete given name.
            if len(shown) > len(slot["name"]):
                slot["name"] = shown
            slot["papers"].append(idx)
            names.append(key)
        papers.append({**item, "authors": names,
                       "author_names": [display_name(g, f)
                                        for g, f in item["authors"]]})

    roster = [{
        "key": key,
        "name": v["name"],
        "count": len(v["papers"]),
        "papers": v["papers"],
        "variants": sorted(v["variants"]),
    } for key, v in authors.items()]
    roster.sort(key=lambda a: (-a["count"], a["name"].split()[-1]))
    return {"papers": papers, "authors": roster}


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("export", type=Path, help="Zotero export: .csv/.bib/.ris/.json")
    ap.add_argument("-o", "--out", type=Path, help="write JSON here")
    args = ap.parse_args()

    if not args.export.exists():
        sys.exit(f"no such file: {args.export}")

    result = build(parse(args.export))
    papers, authors = result["papers"], result["authors"]

    print(f"{len(papers)} papers, {len(authors)} distinct authors\n")
    for a in authors:
        variants = ""
        if len(a["variants"]) > 1:
            variants = "  [" + " / ".join(a["variants"]) + "]"
        print(f"{a['count']:3d}  {a['name']}{variants}")

    if args.out:
        args.out.write_text(json.dumps(result, ensure_ascii=False, indent=2),
                            encoding="utf-8")
        print(f"\nwrote {args.out}")


if __name__ == "__main__":
    main()
