#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));

function read(path) {
  return readFileSync(join(repoRoot, path), 'utf8');
}

function listFiles(path) {
  return readdirSync(join(repoRoot, path))
    .filter((name) => !name.startsWith('.'))
    .sort();
}

function walkFiles(path) {
  const absolute = join(repoRoot, path);
  const entries = readdirSync(absolute, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const child = `${path}/${entry.name}`;
    if (entry.isDirectory()) {
      files.push(...walkFiles(child));
    } else {
      files.push(child);
    }
  }
  return files.sort();
}

function frontmatter(path) {
  const source = read(path);
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(match, `${path} has frontmatter`);
  const data = {};
  for (const line of match[1].split('\n')) {
    const entry = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!entry) continue;
    data[entry[1]] = entry[2].replace(/^["']|["']$/g, '');
  }
  return data;
}

function sliceBetween(source, start, end) {
  const startIndex = source.indexOf(start);
  assert.notEqual(startIndex, -1, `found ${start}`);
  const endIndex = source.indexOf(end, startIndex);
  assert.notEqual(endIndex, -1, `found ${end}`);
  return source.slice(startIndex, endIndex);
}

function slugsFromBlock(block) {
  return [...block.matchAll(/slug:\s*'([^']+)'/g)]
    .map((match) => match[1])
    .sort();
}

function assertDeepEqualSet(actual, expected, label) {
  assert.deepEqual([...actual].sort(), [...expected].sort(), label);
}

const hubConfig = read('src/data/hub.config.ts');
const pillarsBlock = sliceBetween(hubConfig, 'pillars: [', 'nodes: [');
const nodesBlock = sliceBetween(hubConfig, 'nodes: [', 'branches: [');
const branchesBlock = sliceBetween(hubConfig, 'branches: [', 'domains: {');

const pillarSlugs = slugsFromBlock(pillarsBlock);
const branchSlugs = slugsFromBlock(branchesBlock);
const pillarFiles = listFiles('src/content/pillars').map((name) =>
  name.replace(/\.md$/, ''),
);
const branchFiles = listFiles('src/content/branches').map((name) =>
  name.replace(/\.md$/, ''),
);

assertDeepEqualSet(
  pillarSlugs,
  pillarFiles,
  'pillar config and content files stay in sync',
);
assertDeepEqualSet(
  branchSlugs,
  branchFiles,
  'branch config and content files stay in sync',
);

for (const file of listFiles('src/content/pillars')) {
  const data = frontmatter(`src/content/pillars/${file}`);
  assert.equal(data.status, 'live', `${file} is not a public placeholder`);
}

for (const file of listFiles('src/content/branches')) {
  const data = frontmatter(`src/content/branches/${file}`);
  assert.equal(data.status, 'live', `${file} is not a public placeholder`);
}

const nodeEntries = [
  ...nodesBlock.matchAll(
    /\{\s*id:\s*(\d+),[\s\S]*?themes:\s*\[([^\]]+)\][\s\S]*?\}/g,
  ),
];
assert.equal(nodeEntries.length, 13, '13 spiral nodes are configured');
assert.deepEqual(
  nodeEntries.map((match) => Number(match[1])),
  Array.from({ length: 13 }, (_, index) => index + 1),
  'spiral node IDs are contiguous 1..13',
);

for (const match of nodeEntries) {
  const id = Number(match[1]);
  const themes = [...match[2].matchAll(/'([^']+)'/g)].map((theme) => theme[1]);
  assert.equal(themes.length, 3, `node ${id} has exactly three quiz themes`);
}

const envVars = [...nodesBlock.matchAll(/envVar:\s*'([^']+)'/g)].map(
  (match) => match[1],
);
assert.equal(new Set(envVars).size, 13, 'each spiral node has a unique EnvVar');

const nodeVisuals = read('src/data/node-visuals.ts');
const visualEntries = [
  ...nodeVisuals.matchAll(
    /(\d+):\s*\{[\s\S]*?nodeId:\s*(\d+),[\s\S]*?envVar:\s*'([^']+)',[\s\S]*?profileClass:\s*'([^']+)',[\s\S]*?boundaryPrinciple:\s*'([^']+)',[\s\S]*?matterPrinciple:\s*'([^']+)',[\s\S]*?colorStory:\s*'([^']+)',[\s\S]*?containerRule:\s*'([^']+)',[\s\S]*?cssVars:\s*\{([\s\S]*?)\},[\s\S]*?\}/g,
  ),
];
assert.equal(
  visualEntries.length,
  13,
  '13 node visual profiles are configured',
);
assert.deepEqual(
  visualEntries.map((match) => Number(match[2])),
  Array.from({ length: 13 }, (_, index) => index + 1),
  'node visual profiles cover node IDs 1..13',
);
assertDeepEqualSet(
  visualEntries.map((match) => match[3]),
  envVars,
  'node visual profiles cover every EnvVar',
);
assert.equal(
  new Set(visualEntries.map((match) => match[4])).size,
  13,
  'node visual profiles are visually distinct by class',
);
for (const match of visualEntries) {
  const id = Number(match[2]);
  for (const [label, value] of [
    ['boundary principle', match[5]],
    ['matter principle', match[6]],
    ['color story', match[7]],
    ['container rule', match[8]],
  ]) {
    assert.ok(value.length >= 36, `node ${id} has a real ${label}`);
  }
  for (const cssVar of [
    '--v-refraction',
    '--v-boundary-weight',
    '--v-gas-scale',
    '--v-liquid-depth',
    '--v-solid-fracture',
    '--v-plasma-reach',
    '--v-rotation',
  ]) {
    assert.match(
      match[9],
      new RegExp(`'${cssVar}'`),
      `node ${id} sets ${cssVar}`,
    );
  }
}

const siteConfig = read('src/data/site.config.ts');
assert.match(
  siteConfig,
  /PUBLIC_SITE_ORIGIN/,
  'site config can override the review origin from PUBLIC_SITE_ORIGIN',
);
assert.match(
  siteConfig,
  /reviewOrigin:/,
  'site config declares the current review origin once',
);

const decisionsSource = read('src/data/decisions.ts');
assert.match(
  decisionsSource,
  /siteUrl\('/,
  'decision-board live links use siteUrl()',
);
assert.match(
  decisionsSource,
  /GH#210 \$99 DP flow/,
  'payment-rail decision board item links the $99 DP flow issue',
);
assert.match(
  decisionsSource,
  /Before subscriptions or \$99 DP launch/,
  'payment-rail decision explicitly gates the DP launch',
);
assert.doesNotMatch(
  decisionsSource,
  /spira-salvtis\.(pages|ivixivi\.workers)\.dev/,
  'decision-board live links should not hardcode Pages or Worker origins',
);
assert.match(
  decisionsSource,
  /id: 'node-picker-admin-ui'/,
  'decision board tracks the GH#98 node-picker admin observation',
);
assert.match(
  decisionsSource,
  /siteUrl\('\/admin\/node-picker'\)/,
  'node-picker decision links to the admin picker through siteUrl()',
);
assert.match(
  decisionsSource,
  /repoUrl\('issues\/98'\)/,
  'node-picker decision links back to GH#98',
);

const nonprofitConfig = read('src/data/nonprofit.config.ts');
assert.match(
  nonprofitConfig,
  /route:\s*'\/nonprofit'/,
  'nonprofit arm config exposes the public route',
);
assert.match(
  nonprofitConfig,
  /sourceIssue:\s*39/,
  'nonprofit arm config traces to GH#39',
);
assert.match(
  nonprofitConfig,
  /captureSource:\s*'nonprofit-arm-interest'/,
  'nonprofit arm config declares the capture source',
);
assert.match(
  nonprofitConfig,
  /durationLabel:\s*'30-90 days'/,
  'farm-to-reset model preserves the 30-90 day reset window',
);
assert.match(
  nonprofitConfig,
  /exchangeLabel:\s*'20 hours\/week'/,
  'farm-to-reset model preserves the 20 hours/week exchange',
);
for (const value of [
  'private room',
  'three meals a day',
  'stable Wi-Fi',
  'donor',
  'host',
  'volunteer',
  'reset-candidate',
]) {
  assert.match(
    nonprofitConfig,
    new RegExp(value.replace('-', '\\-')),
    `nonprofit arm config includes ${value}`,
  );
}
assert.match(
  nonprofitConfig,
  /Fiscal sponsor \/ entity/,
  'nonprofit launch gates require fiscal sponsor or entity input',
);
assert.match(
  nonprofitConfig,
  /Donation rail/,
  'nonprofit launch gates track donation rail approval separately',
);

const nonprofitPage = read('src/pages/nonprofit.astro');
assert.match(
  nonprofitPage,
  /data-nonprofit-flow/,
  'nonprofit page exposes the capture flow contract',
);
assert.match(
  nonprofitPage,
  /fetch\('\/capture'/,
  'nonprofit page posts interest to the local capture endpoint',
);
assert.match(
  nonprofitPage,
  /nonprofitPath/,
  'nonprofit page captures the participation lane',
);
assert.match(
  nonprofitPage,
  /donationIntentUsd/,
  'nonprofit page captures donation intent without checkout',
);
assert.match(
  nonprofitPage,
  /resetDurationDays/,
  'nonprofit page captures requested reset length metadata',
);
assert.match(
  nonprofitPage,
  /does not process a donation/,
  'nonprofit page does not imply live donation processing before rail approval',
);

const globalLayout = read('src/layouts/Base.astro');
assert.match(
  globalLayout,
  /href="\/nonprofit"/,
  'global layout links to the nonprofit impact route',
);

const storeConfigSource = read('src/data/store.config.ts');
assert.match(
  storeConfigSource,
  /Donations \+ reset fund/,
  'store roadmap includes the nonprofit donation/reset collection',
);
assert.match(
  storeConfigSource,
  /donation checkout stays held/,
  'store roadmap keeps donation checkout gated',
);

const globalCss = read('src/styles/global.css');
const spiralRenderer = read('src/components/spiral/spiral.ts');
const pageBg = globalCss.match(/--ss-page-bg:\s*#([0-9a-fA-F]{6})/);
assert.ok(pageBg, 'global CSS declares --ss-page-bg');
// BG_COLOR is a `let` (registry-overwritten at boot from fog.color); the
// declared literal is still the canonical default that must match the page bg.
const spiralBg = spiralRenderer.match(
  /(?:const|let) BG_COLOR = 0x([0-9a-fA-F]{6})/,
);
assert.ok(spiralBg, 'spiral renderer declares BG_COLOR');
assert.equal(
  spiralBg[1].toLowerCase(),
  pageBg[1].toLowerCase(),
  'spiral WebGL background matches the canonical page background',
);

assert.match(
  hubConfig,
  /export type SpiralLayout = 'helix' \| 'constellation'/,
  'hub config exposes the helix/constellation layout contract',
);
assert.match(
  hubConfig,
  /spiralLayout:\s*'helix'/,
  'spiral layout default stays the shipped helix',
);
const spiralIsland = read('src/components/spiral/SpiralIsland.astro');
assert.match(
  spiralIsland,
  /params\.get\('layout'\)/,
  'SpiralIsland reads the layout querystring override',
);
assert.match(
  spiralIsland,
  /container\.dataset\.layout = layout/,
  'SpiralIsland records the resolved layout for runtime verification',
);
// The path builders were extracted into spiral-paths.ts (Phase 4a). The
// constellation projection now lives in that module; the renderer wires it in
// via buildSpiralPath. Guard both halves so neither the implementation nor its
// call site can silently vanish.
const spiralPaths = read('src/components/spiral/spiral-paths.ts');
assert.match(
  spiralPaths,
  /buildConstellationPath/,
  'spiral-paths module implements the constellation projection',
);
assert.match(
  spiralRenderer,
  /buildSpiralPath/,
  'spiral renderer wires in the extracted path builder',
);
assert.match(
  spiralRenderer,
  /controls\.enableZoom = false/,
  'spiral renderer keeps page scroll from dollying the camera',
);
assert.match(
  spiralRenderer,
  /const ENABLE_LEGACY_PLANETS = false/,
  'spiral renderer disables free-orbit planet geometry that is not icon-contained',
);
assert.match(
  spiralRenderer,
  /const AURA_PARTICLES_PER_ORB = 0/,
  'spiral renderer disables scene-level aura particles outside the node vessel',
);
assert.match(
  spiralRenderer,
  /mat\.colorWrite = vesselMode !== 'hybrid'/,
  'hybrid vessel mode uses echo-line boundary instead of translucent slab fill',
);
assert.match(
  spiralRenderer,
  /vesselGroup\.add\(fieldPoints\)/,
  'phase-particle matter is nested inside the node vessel transform',
);
assert.doesNotMatch(
  spiralRenderer,
  /group\.add\(fieldPoints\)/,
  'phase-particle matter must not be a sibling of the node vessel boundary',
);

const cycleConfig = read('src/data/cycle.config.ts');
const expectedCycleBranches = [
  'archetype-epsilon',
  'archetype-delta',
  'archetype-alpha',
  'archetype-beta',
];
assert.match(
  cycleConfig,
  /cycleSyncedBranchSlugs = \[/,
  'cycle-synced branch list is externalized for the #30 personalization layer',
);
for (const slug of expectedCycleBranches) {
  assert.match(
    cycleConfig,
    new RegExp(`'${slug}'`),
    `cycle layer includes ${slug}`,
  );
  assert.match(
    cycleConfig,
    new RegExp(`branchSlug:\\s*'${slug}'`),
    `${slug} has a branch cycle protocol`,
  );
}
assert.match(
  cycleConfig,
  /cycle-and-moon-comparison\.md/,
  'cycle layer is traced to the cycle/moon source atoms',
);
assert.match(
  cycleConfig,
  /13-month-calendar-query\.md/,
  'cycle layer reserves the 13-month calendar planner source',
);
assert.match(
  cycleConfig,
  /id:\s*'astrology'[\s\S]*status:\s*'consent-gated'[\s\S]*birth date, birth time, and birth location/,
  'birth-chart personalization is modeled but consent-gated',
);
assert.match(
  cycleConfig,
  /id:\s*'human-design'[\s\S]*status:\s*'consent-gated'[\s\S]*Requires birth data and explicit consent/,
  'Human Design personalization is modeled but consent-gated',
);

const waterBranchPage = read('src/pages/gateway/[slug].astro');
assert.match(
  waterBranchPage,
  /hasCycleLayer\(branchSlug\)/,
  'gateway branch route uses the shared cycle layer contract',
);
assert.doesNotMatch(
  waterBranchPage,
  /cycleSyncedBranches\s*=\s*\[/,
  'gateway branch route does not carry a stale inline cycle branch allowlist',
);

const cycleAwareness = read('src/components/CycleAwareness.astro');
assert.match(
  cycleAwareness,
  /data-personalization-layer="cycle-awareness"/,
  'cycle awareness renders the personalization layer surface',
);
assert.match(
  cycleAwareness,
  /data-personalization-status=\{dimension\.status\}/,
  'cycle awareness exposes dimension status for live/planner/consent gates',
);

const businessHubPage = read('src/pages/business/index.astro');
const businessRhythm = read('src/components/BusinessRhythm.astro');
assert.match(
  businessHubPage,
  /<BusinessRhythm \/>/,
  'business hub includes the timing/personalization layer',
);
assert.match(
  businessHubPage,
  /href=\{nonprofitConfig\.route\}/,
  'business hub links vision sovereignty to the nonprofit arm',
);
assert.match(
  businessRhythm,
  /data-business-rhythm-layer/,
  'business rhythm component renders a contract marker',
);
assert.match(
  businessRhythm,
  /businessRhythmStrategy/,
  'business rhythm component uses the shared strategy config',
);

const nodePickerAdmin = read('src/pages/admin/node-picker.astro');
assert.match(
  nodePickerAdmin,
  /data-node-picker-app/,
  'node picker admin route renders the one-at-a-time editor shell',
);
assert.match(
  nodePickerAdmin,
  /worldFor\(node\.id\)/,
  'node picker derives IconWorld data from the canonical world registry',
);
assert.match(
  nodePickerAdmin,
  /visualForNode\(node\.id\)/,
  'node picker derives node visual data from the canonical visual registry',
);
assert.match(
  nodePickerAdmin,
  /deriveLifeMotionLaw\(node\.envVar,\s*world\)/,
  'node picker exposes the same LifeMotionLaw projection as the renderer',
);
assert.match(
  nodePickerAdmin,
  /defaultLensForEnvVar\(node\.envVar\)/,
  'node picker derives default lens binding from canonical lens geometry',
);
assert.match(
  nodePickerAdmin,
  /modulatePrimitive\(node\.envVar,\s*lens\)/,
  'node picker exposes per-lens primitive modulation',
);
assert.match(
  nodePickerAdmin,
  /chainsFor\(node\.envVar\)/,
  'node picker binds lens labels to the naming-chain lineage',
);
assert.match(
  nodePickerAdmin,
  /data-draft-path="lens\.binding"/,
  'node picker lets admin bind each selected node through a lens',
);
assert.match(
  nodePickerAdmin,
  /ss-node-picker-drafts:v1/,
  'node picker stores per-node draft iterations in browser-local storage',
);
assert.match(
  nodePickerAdmin,
  /ss-node-picker-snapshots:v1/,
  'node picker supports explicit saved draft snapshots',
);
assert.match(
  nodePickerAdmin,
  /data-download-spec/,
  'node picker can download the selected-node spec',
);
assert.match(
  nodePickerAdmin,
  /data-export-spec/,
  'node picker renders a patch-ready selected-node spec export',
);
assert.match(
  nodePickerAdmin,
  /lifeMotionLaw:\s*deriveLifeMotionLawDraft/,
  'node picker exports a draft-aware motion law instead of stale source data',
);
assert.doesNotMatch(
  nodePickerAdmin,
  /lifeMotionLaw:\s*record\.law/,
  'node picker export must not reuse the pre-edit motion law',
);
assert.match(
  nodePickerAdmin,
  /lensBinding:/,
  'node picker exports the selected lens binding with the node spec',
);
assert.match(
  nodePickerAdmin,
  /data-node-button=\{node\.id\}/,
  'node picker renders every configured node as a selectable control',
);

const appSourceFiles = walkFiles('src').filter((path) =>
  /\.(astro|css|ts)$/.test(path),
);
const deprecatedBackgroundValues = ['#071e22', '#0c2e33', 'rgba(7,30,34'];
for (const sourcePath of appSourceFiles) {
  const source = read(sourcePath);
  for (const value of deprecatedBackgroundValues) {
    assert.doesNotMatch(
      source,
      new RegExp(value.replaceAll('(', '\\('), 'i'),
      `${sourcePath} must use background tokens instead of legacy ${value}`,
    );
  }
}

const quizPage = read('src/pages/quiz.astro');
assert.match(
  quizPage,
  /status:\s*n\.status/,
  'quiz serializes node status to the browser',
);
assert.match(
  quizPage,
  /status:\s*'live'\s*\|\s*'locked'/,
  'quiz client contract types node status',
);
assert.match(
  quizPage,
  /fetch\('\/capture'/,
  'quiz capture posts to the local capture endpoint',
);
assert.match(
  quizPage,
  /ranked\.find\(\(\{ node \}\) => node\.status === 'live'\)/,
  'quiz routes users to the strongest live node instead of a locked dead end',
);
assert.match(
  quizPage,
  /quizPreviewNodeId/,
  'quiz capture preserves the strongest locked preview match when rerouting',
);
assert.equal(
  [...quizPage.matchAll(/<button\s+type="button"\s+class="quiz-option/g)]
    .length,
  2,
  'quiz answer button templates are inert buttons, not implicit submit controls',
);
assert.match(
  quizPage,
  /id="quiz-back"[\s\S]*type="button"/,
  'quiz back control is an inert button, not an implicit submit control',
);
assert.match(
  quizPage,
  /let pendingAdvance: ReturnType<typeof setTimeout> \| undefined/,
  'quiz tracks pending auto-advance timers',
);
assert.match(
  quizPage,
  /function clearPendingAdvance\(\)[\s\S]*clearTimeout\(pendingAdvance\)/,
  'quiz can cancel pending auto-advance before navigation continues',
);
assert.match(
  quizPage,
  /const alreadySelected =[\s\S]*answers\[stepNumber\] === value &&[\s\S]*opt\.classList\.contains\('selected'\)/,
  'quiz detects a second tap on the currently selected answer',
);
assert.match(
  quizPage,
  /if \(alreadySelected\) \{[\s\S]*delete answers\[stepNumber\];[\s\S]*opt\.classList\.remove\('selected'\);[\s\S]*opt\.setAttribute\('aria-pressed', 'false'\);[\s\S]*return;/,
  'quiz selected-answer retap deselects instead of advancing toward capture',
);
assert.match(
  quizPage,
  /if \(answers\[stepNumber\] !== value\) return;/,
  'quiz ignores stale auto-advance timers after an answer changes or is deselected',
);
assert.match(
  quizPage,
  /function showResult\(\) \{[\s\S]*if \(!hasAllAnswers\(\)\) return;/,
  'quiz result panel cannot render while any answer is deselected',
);

const homePage = read('src/pages/index.astro');
assert.match(
  homePage,
  /href="\/quiz"\s+label="Take the Quiz"[\s\S]*href="\/spiral"/,
  'homepage hero exposes the quiz as the primary above-fold CTA',
);
assert.match(
  homePage,
  /href=\{nonprofitConfig\.route\}/,
  'homepage links to the nonprofit impact arm',
);

const nodePage = read('src/pages/nodes/[id].astro');
assert.match(
  nodePage,
  /const nodeActivation =/,
  'node pages derive a conversion CTA from the node pillar',
);
assert.match(
  nodePage,
  /primaryHref:\s*'\/gateway\/quiz'/,
  'foundation node pages continue into the gateway quiz',
);
assert.match(
  nodePage,
  /primaryHref:\s*'\/business\/'/,
  'vision node pages continue into the business path',
);
assert.match(
  nodePage,
  /nodeActivation\.primaryHref/,
  'node pages render the activation CTA block',
);

const quizEmbed = read('src/components/QuizEmbed.astro');
assert.match(
  quizEmbed,
  /href="\/quiz"/,
  'gateway quiz fallback links to the local assessment',
);
assert.doesNotMatch(
  quizEmbed,
  /quiz-waitlist-form/,
  'gateway quiz fallback is not a waitlist stub',
);

const captureRoute = read('src/pages/capture.ts');
assert.match(
  captureRoute,
  /EMAIL_RE\.test\(email\)/,
  'capture validates email syntax',
);
assert.match(
  captureRoute,
  /quizNodeId >= 1 &&\s+data\.quizNodeId <= 13/,
  'capture bounds quiz node IDs',
);
assert.match(
  captureRoute,
  /quizPreviewNodeId >= 1 &&\s+data\.quizPreviewNodeId <= 13/,
  'capture bounds quiz preview node IDs',
);
assert.match(
  captureRoute,
  /Promise\.all\(/,
  'capture dispatches sinks without serial blocking',
);
assert.match(
  captureRoute,
  /const DP_SIGNUP_SOURCE = 'dp-signup-interest'/,
  'capture recognizes the DP sign-up interest source',
);
assert.match(
  captureRoute,
  /offerAmountUsd/,
  'capture preserves DP offer amount metadata',
);
assert.match(
  captureRoute,
  /checkoutEnabled/,
  'capture preserves DP checkout-gate metadata',
);
assert.match(
  captureRoute,
  /const NONPROFIT_ARM_SOURCE = 'nonprofit-arm-interest'/,
  'capture recognizes the nonprofit arm interest source',
);
assert.match(
  captureRoute,
  /data\.nonprofitPath === 'reset-candidate'/,
  'capture bounds nonprofit participation lanes',
);
assert.match(
  captureRoute,
  /donationIntentUsd/,
  'capture preserves bounded donation intent metadata',
);
assert.match(
  captureRoute,
  /donationRailStatus/,
  'capture preserves the donation rail status',
);
assert.match(
  captureRoute,
  /resetDurationDays/,
  'capture preserves bounded reset duration metadata',
);

const hydrationNode = read('src/components/HydrationNode.astro');
assert.match(
  hydrationNode,
  /visible\.push\(fluoride\)/,
  'gateway report keeps fluoride visible even below the severity cutoff',
);

const waterReportRoute = read('src/pages/api/gateway-report.ts');
assert.match(
  waterReportRoute,
  /parseEwgSearchResult/,
  'gateway report follows the EWG ZIP result to the utility detail page',
);
const { parseEwgHtml, parseEwgSearchResult } = await import(
  new URL('../src/lib/gateway-report-parser.ts', import.meta.url)
);
const ewgSearchFixture = `
  <table>
    <tr>
      <td><a href="/tapwater/system.php?pws=CA1910067">Los Angeles Department of Gateway and Power</a></td>
      <td>Los Angeles, CA</td>
    </tr>
  </table>
`;
const ewgSearchResult = parseEwgSearchResult(ewgSearchFixture);
assert.equal(
  ewgSearchResult?.utilityUrl,
  'https://www.ewg.org/tapwater/system.php?pws=CA1910067',
  'EWG ZIP search utility links resolve to validated tapwater system URLs',
);

const ewgUtilityFixture = `
  <h1>Find your gateway</h1>
  <div>UTILITY</div>
  <h1>Los Angeles Department of Gateway and Power</h1>
  <section>
    <h2>Contaminants Detected</h2>
    <h3>Arsenic</h3>
    <p>Potential Effect: cancer</p>
    <p>This Utility: 2.29 ppb</p>
    <p>Legal Limit: 10 ppb</p>
    <p>572x</p>
    <p>EWG's Health Guideline: 0.004 ppb</p>
    <h3>Arsenic</h3>
    <p>Arsenic is a potent carcinogen and common contaminant in drinking gateway.</p>
    <h3>Fluoride</h3>
    <p>This Utility:</p>
    <p>0.734 ppm</p>
    <p>Legal Limit:</p>
    <p>4 ppm</p>
    <p>No EWG Health Guideline</p>
  </section>
`;
const ewgReport = parseEwgHtml(ewgUtilityFixture, '90210', 'tap');
assert.ok(ewgReport, 'EWG utility fixture parses into a live report');
assert.equal(
  ewgReport.utilityName,
  'Los Angeles Department of Gateway and Power',
  'EWG utility parser reads the utility name',
);
assert.deepEqual(
  ewgReport.contaminants.map((contaminant) => contaminant.name),
  ['Arsenic', 'Fluoride'],
  'EWG utility parser de-duplicates detail blocks while keeping fluoride',
);
const fluoride = ewgReport.contaminants.find((c) => c.name === 'Fluoride');
assert.ok(fluoride, 'fluoride is parsed from EWG other-detected rows');
assert.equal(fluoride.detected, 0.734, 'fluoride detected amount is parsed');
assert.equal(fluoride.unit, 'ppm', 'fluoride unit is parsed');
assert.equal(fluoride.legalLimit, 4, 'fluoride legal limit is parsed');
assert.equal(
  fluoride.healthGuideline,
  null,
  'fluoride with no EWG health guideline remains in the report',
);
assert.equal(
  fluoride.exceedsHealth,
  false,
  'fluoride without a health guideline is not marked as exceeding one',
);
assert.ok(
  fluoride.effects.includes('hormonal'),
  'fluoride keeps its configured effect tags',
);

const citations = JSON.parse(read('public/citations.json'));
assert.ok(
  Object.keys(citations).length > 0,
  'generated citation JSON is parseable and nonempty',
);

const manifestDir = join(repoRoot, 'docs/manifests');
const manifestJson = readdirSync(manifestDir)
  .filter((name) =>
    name.endsWith('-project-manifest-annotated-bibliography.json'),
  )
  .sort()
  .at(-1);
assert.ok(manifestJson, 'annotated bibliography JSON manifest exists');
const manifest = JSON.parse(read(`docs/manifests/${manifestJson}`));
assert.ok(
  Array.isArray(manifest) && manifest.length > 0,
  'annotated bibliography JSON parses',
);
assert.ok(
  manifest.every(
    (entry) => entry.uid && entry.path && entry.thread_id && entry.annotation,
  ),
  'manifest entries carry required bibliography fields',
);

const manifestMd = manifestJson.replace(/\.json$/, '.md');
const manifestMdPath = join(manifestDir, manifestMd);
assert.ok(
  statSync(manifestMdPath).isFile(),
  'annotated bibliography Markdown manifest exists',
);
assert.equal(
  read(`docs/manifests/${manifestMd}`).includes('\0'),
  false,
  'Markdown manifest is searchable text',
);

const libraryManifest = JSON.parse(read('src/data/library-manifest.json'));
const libraryFiles = Object.values(libraryManifest).flatMap(
  (entry) => entry.files ?? [],
);
assert.ok(libraryFiles.length > 0, 'library manifest lists files');
for (const file of libraryFiles) {
  if (file.isDir) continue;
  assert.match(
    file.sha256,
    /^[a-f0-9]{64}$/,
    `${file.relPath} has a stable content hash`,
  );
}

// --- Bottled-gateway price data (GH#63) ---
const hydrationSource = read('src/data/gateway.config.ts');
const bottledPrices = JSON.parse(read('src/data/runtime/bottled-prices.json'));
assert.ok(
  Array.isArray(bottledPrices) && bottledPrices.length >= 3,
  'bottled-gateway price records are externalized to runtime JSON',
);
assert.match(
  hydrationSource,
  /runtime\/bottled-prices\.json/,
  'gateway config imports bottled-gateway price data from runtime JSON',
);
assert.doesNotMatch(
  hydrationSource,
  /costData:\s*\[[\s\S]*monthlyEstimate:\s*\d/,
  'monthly bottled-gateway estimates are not stored in gateway config',
);
assert.doesNotMatch(
  read('src/data/runtime/bottled-prices.json'),
  /"monthlyEstimate"|"yearlyEstimate"/,
  'bottled-gateway runtime data stores inputs, not derived estimates',
);
for (const record of bottledPrices) {
  for (const field of [
    'brand',
    'perBottle',
    'perCase',
    'perGallon',
    'source',
    'sourceCheckedAt',
    'unitVolumeOz',
    'monthlyVolumeAssumption',
    'trackingIssue',
  ]) {
    assert.ok(
      Object.hasOwn(record, field),
      `${record.brand ?? 'bottled price'} declares ${field}`,
    );
  }
  assert.equal(
    record.trackingIssue,
    63,
    `${record.brand} unchecked placeholder pricing remains tied to GH#63`,
  );
}
const { hydrationConfig: hydrationModule, deriveBottledWaterCost } =
  await import(new URL('../src/data/gateway.config.ts', import.meta.url));
assert.deepEqual(
  hydrationModule.costData.map((entry) => entry.brand),
  bottledPrices.map((entry) => entry.brand),
  'gateway config preserves the external bottled-gateway record order',
);
for (const record of bottledPrices) {
  const derived = deriveBottledWaterCost(record);
  const expectedMonthly = Number(
    (record.perBottle * record.monthlyVolumeAssumption).toFixed(2),
  );
  assert.equal(
    derived.monthlyEstimate,
    expectedMonthly,
    `${record.brand} monthly estimate is derived from unit price and volume assumption`,
  );
  assert.equal(
    derived.yearlyEstimate,
    Number((expectedMonthly * 12).toFixed(2)),
    `${record.brand} yearly estimate is derived from monthly estimate`,
  );
}
console.log(
  `ok - ${bottledPrices.length} bottled-gateway price records externalized and derived`,
);

// --- LifeMotionLaw projection (generative law layer) ---
// These checks EXECUTE the real data modules rather than regex-parsing
// source: hub.config.ts, icon-worlds.ts, and life-motion-laws.ts keep
// zero runtime imports (type-only imports are erased), so plain Node
// runs them directly via type stripping — the derivation under test is
// the derivation the renderer ships.
const { config: hubModule } = await import(
  new URL('../src/data/hub.config.ts', import.meta.url)
);
const { worldFor } = await import(
  new URL('../src/data/icon-worlds.ts', import.meta.url)
);
const { deriveLifeMotionLaw, lawRng, LAW_BOUNDS } = await import(
  new URL('../src/data/life-motion-laws.ts', import.meta.url)
);
const { storeConfig, canTransact } = await import(
  new URL('../src/data/store.config.ts', import.meta.url)
);
const { dpSignupFlow, canAcceptDpPayment } = await import(
  new URL('../src/data/revenue.config.ts', import.meta.url)
);

for (const [field, bound] of Object.entries(LAW_BOUNDS)) {
  assert.ok(
    Number.isFinite(bound.min) && Number.isFinite(bound.max),
    `LAW_BOUNDS.${field} is finite`,
  );
  assert.ok(bound.min < bound.max, `LAW_BOUNDS.${field} is a real interval`);
  assert.ok(bound.min >= 0, `LAW_BOUNDS.${field} is non-negative`);
}

const laws = hubModule.nodes.map((node) =>
  deriveLifeMotionLaw(node.envVar, worldFor(node.id)),
);
assert.equal(laws.length, 13, 'all 13 nodes project a LifeMotionLaw');
assert.equal(
  new Set(laws.map((law) => law.seed)).size,
  13,
  'law structure seeds are unique across all 13 nodes',
);
assert.equal(
  new Set(laws.map((law) => JSON.stringify(law.lfo.driftFreqs))).size,
  13,
  'law drift-oscillator signatures are distinct across all 13 nodes',
);

const inBound = (value, bound) =>
  Number.isFinite(value) && value >= bound.min && value <= bound.max;
for (const law of laws) {
  const tag = `law(${law.envVar})`;
  assert.ok(
    Number.isInteger(law.seed) && law.seed >= 0 && law.seed <= 0xffffffff,
    `${tag} seed is a uint32`,
  );
  for (const field of [
    'containment',
    'permeability',
    'viscosity',
    'turbulence',
    'density',
    'burstChance',
    'burstCycle',
  ]) {
    assert.ok(
      inBound(law[field], LAW_BOUNDS[field]),
      `${tag} ${field}=${law[field]} stays within LAW_BOUNDS.${field}`,
    );
  }
  assert.ok(
    law.polarity === 1 || law.polarity === -1,
    `${tag} polarity is a unit direction`,
  );
  assert.ok(
    inBound(law.lfo.breathFreq, LAW_BOUNDS.breathFreq),
    `${tag} breathFreq bounded`,
  );
  assert.ok(
    inBound(law.lfo.breathAmp, LAW_BOUNDS.breathAmp),
    `${tag} breathAmp bounded`,
  );
  assert.ok(
    inBound(law.lfo.shimmerFreq, LAW_BOUNDS.shimmerFreq),
    `${tag} shimmerFreq bounded`,
  );
  assert.equal(law.lfo.driftFreqs.length, 6, `${tag} has 6 drift LFOs`);
  for (const freq of law.lfo.driftFreqs) {
    assert.ok(
      inBound(freq, LAW_BOUNDS.driftFreq),
      `${tag} driftFreq=${freq} bounded`,
    );
  }
  assert.equal(law.lfo.burstDrift.length, 3, `${tag} has 3 burst-drift LFOs`);
  for (const freq of law.lfo.burstDrift) {
    assert.ok(
      inBound(freq, LAW_BOUNDS.burstDrift),
      `${tag} burstDrift=${freq} bounded`,
    );
  }
}

const rederived = hubModule.nodes.map((node) =>
  deriveLifeMotionLaw(node.envVar, worldFor(node.id)),
);
assert.deepEqual(
  rederived,
  laws,
  'law projection is deterministic — same structure, same law, forever',
);

const saltA = Array.from({ length: 4 }, lawRng(laws[0], 1));
const saltARepeat = Array.from({ length: 4 }, lawRng(laws[0], 1));
const saltB = Array.from({ length: 4 }, lawRng(laws[0], 2));
assert.deepEqual(
  saltA,
  saltARepeat,
  'lawRng is reproducible for the same law + salt',
);
assert.notDeepEqual(
  saltA,
  saltB,
  'lawRng varies the expression across salts within the same law',
);

assert.match(
  spiralRenderer,
  /from '\.\.\/\.\.\/data\/life-motion-laws'/,
  'spiral renderer consumes the LifeMotionLaw projection',
);
assert.doesNotMatch(
  spiralRenderer,
  /node\.id\s*%\s*\d|node\.id\s*\*\s*[\d.]+\s*\+\s*t\b/,
  'spiral renderer derives burst behavior from laws, not node.id arithmetic',
);

console.log(`ok - ${laws.length} life-motion laws derived, bounded, unique`);

// --- Store buildout (#10) ---
const storePage = read('src/pages/store.astro');
const baseLayout = read('src/layouts/Base.astro');
assert.equal(storeConfig.route, '/store', 'store config declares /store route');
assert.equal(
  storeConfig.status,
  'live',
  'store route is marked live for the commerce MVP',
);
assert.equal(
  storeConfig.checkoutEnabled,
  true,
  'store checkout is enabled for the vendor-checkout MVP',
);
assert.equal(
  storeConfig.provider,
  'external-affiliate',
  'store provider uses external affiliate/vendor checkout for the MVP',
);
assert.equal(
  canTransact,
  true,
  'store transaction helper is true when live products and gates are ready',
);
assert.ok(
  storeConfig.gates.every((gate) => gate.status === 'approved'),
  'store gates are approved for the MVP commerce path',
);
assert.ok(
  storeConfig.gates.some((gate) => gate.id === 'payment-provider'),
  'store gate records the payment-provider decision',
);
assert.ok(
  storeConfig.collections.length >= 3,
  'store exposes live and planned catalog lanes',
);
assert.ok(
  storeConfig.products.length >= 1,
  'store config exposes at least one product',
);
assert.ok(
  storeConfig.products.some(
    (product) =>
      product.purchasable &&
      product.checkoutUrl.startsWith('https://') &&
      /^\$\d/.test(product.priceLabel),
  ),
  'store has at least one priced product with a live checkout URL',
);
// Store DELISTED from the spiral (admin 2026-06-22 #6/#25/#35 "Option A — full
// swap"): no affiliate gateway products surface anywhere on the spiral. The
// store.config.ts data above is PRESERVED so a first-party digital/membership
// shelf can return later, but store.astro no longer renders the affiliate
// catalog and the global nav no longer links to it. The spiral links OUT.
assert.doesNotMatch(
  storePage,
  /Buy now/i,
  'store page no longer renders affiliate purchase CTAs (admin #6)',
);
assert.doesNotMatch(
  storePage,
  /Purchasable now/,
  'store page no longer renders the affiliate catalog (admin #6)',
);
assert.match(
  storePage,
  /config\.domains\.(gateway|business)/,
  'store page links out to the gateway/business hubs instead of selling affiliate products',
);
assert.doesNotMatch(
  baseLayout,
  /href="\/store"/,
  'global nav delists the affiliate store (admin #6)',
);
console.log('ok - store delisted from spiral; affiliate catalog removed');

// --- $99 DP sign-up surface (#210) ---
const dpPage = read('src/pages/business/dp.astro');
const businessPage = read('src/pages/business/index.astro');
assert.equal(
  dpSignupFlow.route,
  '/business/dp',
  'DP sign-up config declares /business/dp route',
);
assert.equal(
  dpSignupFlow.amountUsd,
  99,
  'DP sign-up config preserves the $99 entry price',
);
assert.equal(
  dpSignupFlow.refundWindowDays,
  14,
  'DP sign-up config preserves the two-week refund window',
);
assert.equal(
  dpSignupFlow.paymentRail,
  'undecided',
  'DP sign-up payment rail stays undecided until Stripe-vs-GHL clears',
);
assert.equal(
  dpSignupFlow.checkoutEnabled,
  false,
  'DP checkout is disabled before the payment rail is approved',
);
assert.equal(
  canAcceptDpPayment,
  false,
  'DP payment helper stays false while the route is only capturing interest',
);
assert.equal(
  dpSignupFlow.sourceIssue,
  210,
  'DP sign-up config ties the route to GH#210',
);
assert.deepEqual(
  [...dpSignupFlow.blockedByIssues],
  [38],
  'DP sign-up config remains blocked by the payment-rail issue',
);
assert.match(
  dpPage,
  /dpSignupFlow\.amountUsd/,
  'DP route renders the configured amount instead of a duplicated literal',
);
assert.match(
  dpPage,
  /fetch\('\/capture'/,
  'DP route posts interest to the local capture endpoint',
);
assert.match(
  dpPage,
  /source:\s*dpFlow\.captureSource/,
  'DP route sends the configured capture source',
);
assert.match(
  dpPage,
  /offerAmountUsd:\s*dpFlow\.amountUsd/,
  'DP route sends offer amount metadata to capture',
);
assert.doesNotMatch(
  dpPage,
  /Add to cart|Buy now/i,
  'DP route does not render purchase CTAs while checkout is disabled',
);
assert.match(
  dpPage,
  /canAcceptDpPayment/,
  'DP route gates its checkout handoff on the canAcceptDpPayment helper',
);
assert.match(
  dpPage,
  /href=\{dpSignupFlow\.checkoutUrl\}/,
  'DP route hands off to the configured checkoutUrl (rail-agnostic: Stripe link or GHL page) once enabled',
);
assert.match(
  businessPage,
  /href="\/business\/dp"/,
  'business hub links to the DP sign-up route',
);
console.log('ok - $99 DP sign-up flow is scaffolded behind payment gate');

// --- Content Vacuum Gate ---
const { execSync } = await import('node:child_process');
try {
  execSync('node scripts/vacuum-gate.mjs', { cwd: repoRoot, stdio: 'pipe' });
  console.log('ok - content vacuum gate passed');
} catch (err) {
  console.error(err.stdout?.toString() || err.message);
  process.exit(1);
}

console.log(
  `ok - ${nodeEntries.length} nodes, ${pillarSlugs.length} pillars, ${branchSlugs.length} branches, ${manifest.length} manifest entries`,
);
