#!/usr/bin/env node
/**
 * vacuum-gate.mjs — Content Vacuum Gate
 *
 * Constitutional Axiom #1: "N/A is a vacuum — never a resting state."
 *
 * Scans for empty config values and placeholder URLs. Each known vacuum
 * MUST have a named GitHub issue tracking it. The gate fails the build
 * when an UNTRACKED vacuum is detected — i.e. when the system encounters
 * an N/A that is not yet logged as work.
 *
 * Tracking source of truth: GitHub Issues (organvm-iii-ergon/sovereign-systems--spiral-template).
 * The `.config/board.config.json` file is project-board metadata only —
 * issues themselves live in the GH API, not in that JSON.
 *
 * Allow-list rather than live `gh` query: deterministic, no network on test,
 * and the allow-list is explicit context for every reader of the gate.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(fileURLToPath(import.meta.url));

/**
 * Each entry maps a vacuum-key (the field path) to the GH issue tracking it.
 * When a scan detects a vacuum whose key matches an entry here, it is TRACKED.
 * When a scan detects a vacuum NOT in this map, the gate fails.
 *
 * To resolve a tracked vacuum: populate the value AND remove the entry below.
 * To declare a new vacuum: add an entry with a real GH issue reference.
 */
const TRACKED_VACUUMS = {
  'gateway.config.ts → filterTiers.anespa.affiliateUrl':
    'GH#49 (admin pending — affiliate links)',
  'gateway.config.ts → filterTiers.k8.affiliateUrl':
    'GH#49 (admin pending — affiliate links)',
};

function read(path) {
  return readFileSync(join(repoRoot, '..', path), 'utf8');
}

const vacuums = [];

function flag(field, value) {
  const ref = TRACKED_VACUUMS[field];
  vacuums.push({ field, value, tracked: Boolean(ref), ref: ref ?? null });
}

// A value is a vacuum when it is absent or carries no content. Catches '',
// whitespace-only strings, null and undefined alike — alternative empty forms
// the prior `:\s*''` regex would have let pass.
function isEmpty(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

// Import the real data modules rather than regex-scanning the source. The
// configs keep zero runtime imports (type-only imports are erased), so plain
// Node runs the .ts files directly via type stripping — the same executable
// pattern test.mjs uses. Reading each object's own properties makes the gate
// invariant to field ordering inside the literals: reordering or restructuring
// a tier (e.g. moving price fields) cannot silently break detection the way the
// prior lazy whole-object regex could mis-attribute one tier's affiliateUrl to
// another tier's id.
const { config: hubModule } = await import(
  new URL('../src/data/hub.config.ts', import.meta.url)
);
const { hydrationConfig } = await import(
  new URL('../src/data/gateway.config.ts', import.meta.url)
);

// --- hub.config.ts: quizFormUrl ---
if (isEmpty(hubModule.ghl?.quizFormUrl)) {
  flag('hub.config.ts → ghl.quizFormUrl', "''");
}

// --- gateway.config.ts: empty affiliateUrl per filter tier ---
for (const tier of hydrationConfig.filterTiers) {
  if (isEmpty(tier.affiliateUrl)) {
    flag(`gateway.config.ts → filterTiers.${tier.id}.affiliateUrl`, "''");
  }
}

// --- content frontmatter: empty required fields ---
function checkContentVacuums(dir, requiredFields) {
  const files = readdirSync(join(repoRoot, '..', dir)).filter((f) =>
    f.endsWith('.md'),
  );
  for (const file of files) {
    const source = read(`${dir}/${file}`);
    const fm = source.match(/^---\n([\s\S]*?)\n---/);
    if (!fm) continue;
    for (const field of requiredFields) {
      // Capture the field's raw value (or note its absence) rather than testing
      // a single empty-shaped pattern. This catches every empty form — '', "",
      // mismatched/partial quotes, bare `field:`, and YAML nulls (`null`, `~`) —
      // that the prior `['"]?['"]?` regex would have skipped.
      const line = fm[1].match(new RegExp(`^${field}:\\s*(.*)$`, 'm'));
      if (!line) continue; // field absent — a separate schema concern, not a vacuum
      const raw = line[1].trim().replace(/^(['"])(.*)\1$/, '$2');
      if (isEmpty(raw) || raw === 'null' || raw === '~') {
        flag(`${dir}/${file} → ${field}`, 'empty');
      }
    }
  }
}

// Field names must match the content-collection schema (content.config.ts):
// pillars use `title`/`tagline`; branches use `title`/`hook`.
checkContentVacuums('src/content/pillars', ['title', 'tagline']);
checkContentVacuums('src/content/branches', ['title', 'hook']);

// --- Orphaned-tracker detection (fail-closed) ---
// A TRACKED_VACUUMS entry whose vacuum is no longer detected means the
// value was populated but its tracker was never removed. The resolution
// loop — populate value → remove entry → close issue — must move together;
// a stale tracker is itself a gate failure (otherwise the map drifts from
// reality silently).
const flaggedFields = new Set(vacuums.map((v) => v.field));
const orphanedTrackers = Object.keys(TRACKED_VACUUMS).filter(
  (key) => !flaggedFields.has(key),
);

// --- Report ---
console.log('\n=== Content Vacuum Gate ===\n');

for (const v of vacuums) {
  const status = v.tracked ? `TRACKED — ${v.ref}` : 'UNTRACKED';
  const icon = v.tracked ? '✓' : '✗';
  console.log(`${icon} ${v.field}: ${v.value} [${status}]`);
}

const untracked = vacuums.filter((v) => !v.tracked).length;

if (orphanedTrackers.length > 0) {
  console.error('');
  console.error(
    `✗ ${orphanedTrackers.length} stale TRACKED_VACUUMS entr${orphanedTrackers.length === 1 ? 'y' : 'ies'} — value populated but tracker not removed:`,
  );
  for (const key of orphanedTrackers) {
    console.error(`    ${key} → ${TRACKED_VACUUMS[key]}`);
  }
  console.error(
    '  Remove the entry from TRACKED_VACUUMS (and close its GH issue) now that the value is filled.',
  );
}

if (untracked > 0) {
  console.error('');
  console.error(`✗ ${untracked} untracked vacuum(s) found.`);
  console.error(
    '  File a GH issue with label "vacuum" and add an entry to TRACKED_VACUUMS in this file.',
  );
  console.error('  Axiom #1: N/A is a vacuum — never a resting state.\n');
}

if (untracked > 0 || orphanedTrackers.length > 0) {
  process.exit(1);
}

if (vacuums.length === 0) {
  console.log('✓ No content vacuums found.\n');
} else {
  console.log(
    `✓ All ${vacuums.length} vacuum(s) tracked in TRACKED_VACUUMS.\n`,
  );
}
process.exit(0);
