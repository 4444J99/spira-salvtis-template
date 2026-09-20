#!/usr/bin/env node
/**
 * Build-time enumerator for the /library page.
 *
 * @astrojs/cloudflare v13 prerenders pages in workerd, which has no host
 * filesystem — so `library.astro` can't call `node:fs` at render time anymore.
 * This script runs in Node during `prebuild`, walks the catalog declared in
 * `src/lib/docs-library.ts`, and writes the file listing to
 * `src/data/library-manifest.json`, which the page imports as plain data.
 *
 * Imports the `.ts` catalog directly via Node's native type-stripping (Node ≥22.18).
 */
import {
  readdirSync,
  statSync,
  existsSync,
  writeFileSync,
  mkdirSync,
  readFileSync,
} from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join, basename, extname } from 'node:path';
import { LIBRARY } from '../src/lib/docs-library.ts';

const repoRoot = process.cwd();
const DEFAULT_EXTS = ['.md', '.html', '.pdf', '.json', '.txt'];
const MANIFEST_PATH = 'src/data/library-manifest.json';

function parseManifest(source) {
  try {
    return JSON.parse(source);
  } catch {
    return undefined;
  }
}

function loadPreviousFiles() {
  const manifests = [];

  try {
    manifests.push(
      execFileSync('git', ['show', `HEAD:${MANIFEST_PATH}`], {
        cwd: repoRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }),
    );
  } catch {
    // No committed manifest yet, or git is unavailable.
  }

  try {
    manifests.push(readFileSync(join(repoRoot, MANIFEST_PATH), 'utf8'));
  } catch {
    // No working-tree manifest yet.
  }

  const previous = new Map();
  for (const source of manifests) {
    const manifest = parseManifest(source);
    if (!manifest) continue;
    for (const entry of Object.values(manifest)) {
      for (const file of entry.files ?? []) {
        if (file?.relPath && !previous.has(file.relPath)) {
          previous.set(file.relPath, file);
        }
      }
    }
  }
  return previous;
}

const previousFiles = loadPreviousFiles();

function fileSha256(absPath) {
  return createHash('sha256').update(readFileSync(absPath)).digest('hex');
}

/**
 * Last-modified date for a path, sourced from git (committer date of the most
 * recent commit touching it). This is only the candidate date for new or changed
 * files; unchanged files preserve their prior manifest date so squash merges do
 * not rewrite dates for content that did not actually change.
 *
 * Filesystem mtime is NOT version-controlled — `git checkout` stamps every file
 * with the current wall-clock time. Falls back to fs mtime only for files not
 * yet committed (new/untracked) or when git is absent.
 */
function lastModifiedIso(relPath, st) {
  try {
    const out = execFileSync(
      'git',
      ['log', '-1', '--format=%cI', '--', relPath],
      { cwd: repoRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim();
    // Normalize to UTC 'Z' so dates sort chronologically by lexical compare
    // regardless of the committer's timezone (and match the prior fs-mtime format).
    if (out) return new Date(out).toISOString();
  } catch {
    // git unavailable or path untracked — fall through to fs mtime
  }
  return st.mtime.toISOString();
}

function stableModifiedIso(relPath, st, sha256, isDir = false) {
  const previous = previousFiles.get(relPath);
  if (!previous?.mtimeIso) return lastModifiedIso(relPath, st);

  if (isDir && previous.isDir) return previous.mtimeIso;

  if (
    !isDir &&
    previous.isDir === false &&
    previous.sizeBytes === st.size &&
    (!previous.sha256 || previous.sha256 === sha256)
  ) {
    return previous.mtimeIso;
  }

  return lastModifiedIso(relPath, st);
}

function discoverFiles(entry) {
  const absRoot = join(repoRoot, entry.path);
  if (!existsSync(absRoot)) return [];

  if (entry.kind === 'single-file') {
    const st = statSync(absRoot);
    const sha256 = fileSha256(absRoot);
    return [
      {
        name: basename(entry.path),
        relPath: entry.path,
        ext: extname(entry.path).toLowerCase(),
        sizeBytes: st.size,
        mtimeIso: stableModifiedIso(entry.path, st, sha256),
        sha256,
        isDir: false,
      },
    ];
  }

  const exts = entry.exts ?? DEFAULT_EXTS;
  const out = [];
  for (const child of readdirSync(absRoot)) {
    if (child.startsWith('.')) continue;
    const abs = join(absRoot, child);
    const relPath = join(entry.path, child);
    const st = statSync(abs);
    if (st.isDirectory()) {
      out.push({
        name: child,
        relPath,
        ext: '',
        sizeBytes: 0,
        mtimeIso: stableModifiedIso(relPath, st, undefined, true),
        isDir: true,
      });
      continue;
    }
    const ext = extname(child).toLowerCase();
    if (exts.length && !exts.includes(ext)) continue;
    const sha256 = fileSha256(abs);
    out.push({
      name: child,
      relPath,
      ext,
      sizeBytes: st.size,
      mtimeIso: stableModifiedIso(relPath, st, sha256),
      sha256,
      isDir: false,
    });
  }
  // Newest first; relPath tiebreaker makes order independent of readdir order.
  out.sort(
    (a, b) =>
      b.mtimeIso.localeCompare(a.mtimeIso) ||
      a.relPath.localeCompare(b.relPath),
  );
  return out;
}

const manifest = {};
for (const entry of LIBRARY) {
  const all = discoverFiles(entry);
  const max = entry.maxShown ?? 30;
  manifest[entry.slug] = {
    // exists guards the /library GitHub link render — a LIBRARY entry whose
    // path is gone (deleted/gitignored) must not produce a dead blob link.
    exists: existsSync(join(repoRoot, entry.path)),
    files: all.slice(0, max),
    total: all.length,
    shown: Math.min(max, all.length),
  };
}

mkdirSync('src/data', { recursive: true });
writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
console.log(
  `[prebuild] Generated src/data/library-manifest.json (${Object.keys(manifest).length} entries)`,
);
