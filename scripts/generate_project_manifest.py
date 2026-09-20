#!/usr/bin/env python3
"""Generate a repo-wide annotated project manifest.

The manifest is intentionally deterministic: IDs are assigned from sorted
paths, annotations are extracted from local file content when readable, and
binary files get metadata-backed annotations instead of being skipped.
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import subprocess
import sys
import zipfile
from collections import Counter, defaultdict
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable
from xml.etree import ElementTree

REPO_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = REPO_ROOT / "docs" / "manifests"

EXCLUDED_DIRS = {
    ".astro",
    ".git",
    ".netlify",
    ".wrangler",
    "dist",
    "node_modules",
    "output",
}

EXCLUDED_RELATIVE_DIRS = {
    Path("docs/manifests"),
}

TEXT_EXTENSIONS = {
    ".astro",
    ".cjs",
    ".css",
    ".editorconfig",
    ".gitattributes",
    ".gitignore",
    ".html",
    ".js",
    ".json",
    ".jsonl",
    ".lhignore",
    ".log",
    ".md",
    ".mjs",
    ".pid",
    ".py",
    ".sh",
    ".toml",
    ".ts",
    ".txt",
    ".yaml",
    ".yml",
}


@dataclass(frozen=True)
class ManifestEntry:
    uid: str
    path: str
    title: str
    thread_id: str
    thread_title: str
    tags: list[str]
    annotation: str
    file_type: str
    size_bytes: int
    modified_utc: str
    sha256: str
    ingest_method: str


def iter_files(root: Path) -> Iterable[Path]:
    for current_root, dirs, files in os.walk(root):
        rel_root = Path(current_root).relative_to(root)
        if rel_root in EXCLUDED_RELATIVE_DIRS:
            dirs[:] = []
            continue
        dirs[:] = sorted(d for d in dirs if d not in EXCLUDED_DIRS)
        for filename in sorted(files):
            yield Path(current_root) / filename


def rel(path: Path) -> str:
    return path.relative_to(REPO_ROOT).as_posix()


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def collapse_whitespace(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def read_text(path: Path, limit_bytes: int = 200_000) -> tuple[str, str]:
    suffix = path.suffix.lower()
    if suffix in TEXT_EXTENSIONS or suffix == "":
        data = path.read_bytes()[:limit_bytes]
        if b"\0" in data:
            return "", "binary-metadata"
        return data.decode("utf-8", errors="replace"), "utf8-preview"
    if suffix == ".docx":
        return read_docx(path), "docx-xml-preview"
    if suffix == ".pdf":
        return read_pdf(path), "pdf-text-preview"
    return "", "binary-metadata"


def read_docx(path: Path) -> str:
    try:
        with zipfile.ZipFile(path) as archive:
            raw = archive.read("word/document.xml")
        root = ElementTree.fromstring(raw)
        ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
        paragraphs: list[str] = []
        for para in root.findall(".//w:p", ns):
            text = "".join(node.text or "" for node in para.findall(".//w:t", ns))
            if text.strip():
                paragraphs.append(text.strip())
        return "\n".join(paragraphs[:40])
    except (
        Exception
    ) as exc:  # noqa: BLE001 - manifest should record failures, not stop ingestion.
        return f"[DOCX extraction failed: {exc}]"


def read_pdf(path: Path) -> str:
    try:
        result = subprocess.run(
            ["pdftotext", "-l", "3", str(path), "-"],
            check=True,
            capture_output=True,
            text=True,
            timeout=20,
        )
        return result.stdout
    except (
        Exception
    ) as exc:  # noqa: BLE001 - manifest should record failures, not stop ingestion.
        return f"[PDF extraction failed: {exc}]"


def title_from_content(path: Path, text: str) -> str:
    for line in text.splitlines()[:80]:
        stripped = line.strip()
        if not stripped:
            continue
        if stripped.startswith("#"):
            return collapse_whitespace(stripped.lstrip("#").strip())
        if re.match(r"^(title|name):\s+", stripped, flags=re.IGNORECASE):
            return collapse_whitespace(stripped.split(":", 1)[1].strip().strip("\"'"))
    return title_from_path(path)


def title_from_path(path: Path) -> str:
    stem = path.stem if path.suffix else path.name
    stem = re.sub(r"^\d{4}-\d{2}-\d{2}[-_ ]*", "", stem)
    stem = re.sub(r"[_-]+", " ", stem)
    return collapse_whitespace(stem).title() or path.name


def annotation_for(path: Path, text: str, ingest_method: str) -> str:
    path_text = rel(path)
    if not text.strip():
        return f"Binary or opaque project artifact retained in the corpus at `{path_text}`; indexed by metadata, size, timestamp, and hash."

    lines = [collapse_whitespace(line) for line in text.splitlines()]
    meaningful = [
        line
        for line in lines
        if line
        and not line.startswith("---")
        and not line.startswith("```")
        and len(line) > 20
    ]
    sample = " ".join(meaningful[:3])
    sample = sample[:420].rstrip()
    if ingest_method.endswith("preview"):
        return f"Readable project artifact at `{path_text}`. Content signal: {sample}"
    return f"Project artifact at `{path_text}`. Content signal: {sample}"


def thread_for(path: Path) -> tuple[str, str]:
    parts = path.relative_to(REPO_ROOT).parts
    if not parts:
        return "TH-ROOT", "Repository Root"

    if parts[0] == ".claude":
        if len(parts) >= 3 and parts[1] == "sessions":
            return f"TH-CLAUDE-{slug(parts[2])}", f"Claude Session: {parts[2]}"
        if len(parts) >= 2:
            return f"TH-CLAUDE-{slug(parts[1])}", f"Claude {parts[1].title()}"

    if parts[0] == ".specstory":
        if len(parts) >= 3 and parts[1] == "debug":
            return (
                f"TH-SPECDEBUG-{slug(parts[2])}",
                f"Specstory Debug Thread: {parts[2]}",
            )
        if len(parts) >= 2:
            return f"TH-SPECSTORY-{slug(parts[1])}", f"Specstory {parts[1].title()}"

    if parts[0] == "docs":
        if len(parts) >= 3 and parts[1] == "archive" and parts[2] == "extracted":
            domain = parts[3] if len(parts) >= 4 else "root"
            return (
                f"TH-ARCHIVE-EXTRACTED-{slug(domain)}",
                f"Archive Extracted: {domain}",
            )
        if len(parts) >= 3 and parts[1] == "archive" and parts[2] == "source-bundle":
            domain = parts[3] if len(parts) >= 4 else "root"
            return (
                f"TH-ARCHIVE-SOURCE-{slug(domain)}",
                f"Archive Source Bundle: {domain}",
            )
        if len(parts) >= 2:
            return f"TH-DOCS-{slug(parts[1])}", f"Docs: {parts[1]}"

    if parts[0] == "src":
        area = parts[1] if len(parts) >= 2 else "root"
        return f"TH-SRC-{slug(area)}", f"Source: {area}"

    if parts[0].startswith(".") and len(parts) >= 2:
        return f"TH-{slug(parts[0])}-{slug(parts[1])}", f"{parts[0]}: {parts[1]}"

    if len(parts) >= 2:
        return f"TH-{slug(parts[0])}-{slug(parts[1])}", f"{parts[0]}: {parts[1]}"

    return f"TH-{slug(parts[0])}", f"Repository Root: {parts[0]}"


def slug(value: str) -> str:
    normalized = re.sub(r"[^A-Za-z0-9]+", "-", value).strip("-").upper()
    return normalized or "ROOT"


KEYWORD_TAGS = {
    "admin": "client:admin",
    "spiral": "topic:spiral",
    "gateway": "pillar:gateway",
    "gateway": "topic:gateway",
    "business": "pillar:vision",
    "vision": "pillar:vision",
    "system": "pillar:system",
    "structure": "pillar:structure",
    "foundation": "pillar:foundation",
    "citation": "topic:citations",
    "atom": "topic:atoms",
    "issue": "governance:issue",
    "irf": "governance:irf",
    "decision": "governance:decision",
    "handoff": "governance:handoff",
    "audit": "governance:audit",
    "plan": "governance:plan",
    "session": "governance:session",
    "spec": "governance:spec",
    "sop": "governance:sop",
    "source-bundle": "corpus:source-bundle",
    "extracted": "corpus:extracted",
}
KEYWORD_RE = re.compile("|".join(re.escape(k) for k in KEYWORD_TAGS))


def tags_for(path: Path, text: str, thread_title: str) -> list[str]:
    path_text = rel(path).lower()
    haystack = f"{path_text} {text[:5000].lower()} {thread_title.lower()}"
    tags: set[str] = set()

    suffix = path.suffix.lower().lstrip(".") or "no-extension"
    tags.add(f"type:{suffix}")

    top = path.relative_to(REPO_ROOT).parts[0]
    tags.add(f"area:{top}")

    for match in KEYWORD_RE.finditer(haystack):
        tags.add(KEYWORD_TAGS[match.group(0)])

    return sorted(tags)


def make_entries(files: list[Path], run_date: str) -> list[ManifestEntry]:
    entries: list[ManifestEntry] = []
    for index, path in enumerate(files, start=1):
        text, ingest_method = read_text(path)
        thread_id, thread_title = thread_for(path)
        stat = path.stat()
        entries.append(
            ManifestEntry(
                uid=f"SS-MAN-{run_date.replace('-', '')}-{index:04d}",
                path=rel(path),
                title=title_from_content(path, text),
                thread_id=thread_id,
                thread_title=thread_title,
                tags=tags_for(path, text, thread_title),
                annotation=annotation_for(path, text, ingest_method),
                file_type=path.suffix.lower() or "[none]",
                size_bytes=stat.st_size,
                modified_utc=datetime.fromtimestamp(
                    stat.st_mtime, timezone.utc
                ).isoformat(),
                sha256=sha256(path),
                ingest_method=ingest_method,
            )
        )
    return entries


def write_json(entries: list[ManifestEntry], json_path: Path) -> None:
    payload = [asdict(entry) for entry in entries]
    with json_path.open("w", encoding="utf-8") as fp:
        json.dump(payload, fp, indent=2, ensure_ascii=False)
        fp.write("\n")


def write_markdown(entries: list[ManifestEntry], md_path: Path, run_date: str) -> None:
    by_thread: dict[str, list[ManifestEntry]] = defaultdict(list)
    for entry in entries:
        by_thread[entry.thread_id].append(entry)

    ext_counts = Counter(entry.file_type for entry in entries)
    area_counts = Counter(
        Path(entry.path).parts[0] if len(Path(entry.path).parts) > 1 else "[root]"
        for entry in entries
    )

    lines: list[str] = [
        "# Project Manifest - Annotated Bibliography",
        "",
        # Generated artifact: content previews echo raw file text (bare URLs,
        # punctuated headings, pipe tables), which is not lintable prose.
        "<!-- markdownlint-disable -->",
        "",
        f"Generated: {run_date}",
        f"Repository: `{REPO_ROOT}`",
        f"Corpus size: {len(entries)} files",
        "",
        "## Scope",
        "",
        "This manifest inventories the live project corpus by file and by thread. It excludes generated dependency/build/cache directories: `.git`, `node_modules`, `dist`, `.astro`, `.netlify`, `.wrangler`, and `output`.",
        "",
        "Each entry includes a deterministic unique ID, thread assignment, title, tags, annotation, file metadata, and SHA-256 digest. Text-like files, Markdown, JSON, source files, DOCX, and PDFs were content-previewed where possible; opaque binaries were retained with metadata annotations.",
        "",
        "## Corpus Summary",
        "",
        "### By Area",
        "",
        "| Area | Files |",
        "|---|---:|",
    ]

    for area, count in sorted(area_counts.items()):
        lines.append(f"| `{area}` | {count} |")

    lines.extend(["", "### By File Type", "", "| Type | Files |", "|---|---:|"])
    for ext, count in sorted(ext_counts.items()):
        lines.append(f"| `{ext}` | {count} |")

    lines.extend(
        ["", "## Thread Index", "", "| Thread ID | Thread | Files |", "|---|---|---:|"]
    )
    for thread_id, thread_entries in sorted(
        by_thread.items(), key=lambda item: item[1][0].thread_title
    ):
        lines.append(
            f"| `{thread_id}` | {thread_entries[0].thread_title} | {len(thread_entries)} |"
        )

    lines.extend(["", "## Annotated Entries"])

    for thread_id, thread_entries in sorted(
        by_thread.items(), key=lambda item: item[1][0].thread_title
    ):
        thread_title = thread_entries[0].thread_title
        lines.extend(["", f"### {thread_title}", "", f"Thread ID: `{thread_id}`", ""])
        for entry in thread_entries:
            tag_text = ", ".join(f"`{tag}`" for tag in entry.tags)
            lines.extend(
                [
                    f"#### {entry.uid} - {entry.title}",
                    "",
                    f"- Path: `{entry.path}`",
                    f"- Tags: {tag_text}",
                    f"- Type: `{entry.file_type}`; Size: {entry.size_bytes} bytes; Modified UTC: `{entry.modified_utc}`",
                    f"- SHA-256: `{entry.sha256}`",
                    f"- Ingest: `{entry.ingest_method}`",
                    f"- Annotation: {entry.annotation}",
                    "",
                ]
            )

    md_path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


def main() -> int:
    run_date = os.environ.get("MANIFEST_DATE") or datetime.now().strftime("%Y-%m-%d")
    files = sorted(iter_files(REPO_ROOT), key=rel)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    entries = make_entries(files, run_date)
    md_path = OUTPUT_DIR / f"{run_date}-project-manifest-annotated-bibliography.md"
    json_path = OUTPUT_DIR / f"{run_date}-project-manifest-annotated-bibliography.json"
    write_markdown(entries, md_path, run_date)
    write_json(entries, json_path)

    print(f"Wrote {md_path.relative_to(REPO_ROOT)}")
    print(f"Wrote {json_path.relative_to(REPO_ROOT)}")
    print(f"Files indexed: {len(entries)}")
    print(f"Threads indexed: {len({entry.thread_id for entry in entries})}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
