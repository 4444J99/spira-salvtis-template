#!/usr/bin/env node
/**
 * Extract per-branch HTML from the built site for admin's GHL paste workflow.
 *
 * Reads dist/water/{slug}/index.html (Astro production output) for each branch,
 * pulls the <main>...</main> region, inlines the body styles, and writes one
 * standalone .html file per branch into docs/admin/2026-05-16-branch-html-exports/.
 *
 * Trigger: 2026-05-16 admin voice-note request — "if you have the HTML codes
 * that's how I built my landing pages... I can pull it and plug it in" on GHL.
 *
 * Re-run any time the source branch content changes: `node scripts/extract-branch-html.mjs`.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();
const DIST = resolve(ROOT, 'dist/water');
const OUT = resolve(ROOT, 'docs/admin/2026-05-16-branch-html-exports');

// Derive the branch list from the single source of truth rather than
// re-declaring slugs + labels here (drift risk — the prior hardcoded list had
// already diverged from the canonical names). hub.config.ts keeps zero runtime
// imports, so plain Node runs the .ts directly via type stripping — the same
// executable pattern test.mjs and vacuum-gate.mjs use. `visible` defaults true
// when omitted, matching the Branch type's documented default.
const { config } = await import(
  new URL('../src/data/hub.config.ts', import.meta.url)
);
const BRANCHES = config.branches
  .slice()
  .sort((a, b) => a.order - b.order)
  .map((branch) => ({
    slug: branch.slug,
    label: branch.name,
    visible: branch.visible ?? true,
  }));

function extractHeroAndContent(html) {
  // Hero: the <h1> title and the italic subtext live in the first <section> with
  // class containing 'min-h-[60vh]' (the standard branch hero).
  const heroMatch = html.match(
    /<h1[^>]*>([\s\S]*?)<\/h1>[\s\S]*?<p[^>]*italic[^>]*>([\s\S]*?)<\/p>/i,
  );
  const heroTitle = heroMatch ? heroMatch[1].replace(/\s+/g, ' ').trim() : '';
  const heroSubtitle = heroMatch
    ? heroMatch[2].replace(/\s+/g, ' ').trim()
    : '';

  // Body: the rendered Markdown lives inside <div class="branch-content ...">
  const bodyMatch = html.match(
    /<div[^>]*class="[^"]*branch-content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/i,
  );
  const body = bodyMatch ? bodyMatch[1].trim() : null;
  return { heroTitle, heroSubtitle, body };
}

function extractTitle(html) {
  const t = html.match(/<title>([^<]+)<\/title>/i);
  return t ? t[1].replace(/\s*\|.*$/, '').trim() : 'Branch';
}

function inlineWrap(title, hero, body, label, slug) {
  return `<!--
  Branch export: ${label} (${title})
  Source slug: ${slug}
  Source file: src/content/branches/${slug}.md → built via Astro → content extracted
  Generated: ${new Date().toISOString()} by scripts/extract-branch-html.mjs

  USAGE IN GHL:
  Paste everything below into a GHL "Custom HTML" content block. The wrapping
  <div> provides a dark background + white text so this looks the same as on
  the spiral site; remove the inline styles if your GHL theme already supplies
  them, or restyle as needed.

  Tailwind/utility classes in the extracted content are not styled in GHL by
  default — visual differences are expected. The text + headings + lists +
  citations (superscript numbers) all carry over cleanly as semantic HTML.

  Re-generate any time the .md source changes:
    npm run build && node scripts/extract-branch-html.mjs
-->
<div style="background:#0d1b2a;color:#e8e6e1;padding:48px 24px;font-family:'Inter',system-ui,sans-serif;line-height:1.8;">
  <div style="max-width:640px;margin:0 auto;">
    <h1 style="font-size:48px;font-weight:300;line-height:1.1;margin:0 0 24px;color:#ffffff;">${hero.heroTitle || label}</h1>
    ${hero.heroSubtitle ? `<p style="font-style:italic;color:rgba(255,255,255,0.6);font-size:20px;line-height:1.6;margin:0 0 48px;">${hero.heroSubtitle}</p>` : ''}
    <div style="font-size:16px;line-height:1.9;">
      ${body || '<p>(content extraction failed — see source .md)</p>'}
    </div>
  </div>
</div>
`;
}

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

let made = 0;
for (const b of BRANCHES) {
  const src = resolve(DIST, b.slug, 'index.html');
  if (!existsSync(src)) {
    console.warn(`skip ${b.slug}: missing ${src}`);
    continue;
  }
  const html = readFileSync(src, 'utf8');
  const hero = extractHeroAndContent(html);
  if (!hero.body) {
    console.warn(`skip ${b.slug}: no .branch-content block found`);
    continue;
  }
  const title = extractTitle(html);
  const out = resolve(OUT, `${b.slug}.html`);
  writeFileSync(out, inlineWrap(title, hero, hero.body, b.label, b.slug));
  console.log(
    `ok ${b.slug} → ${out} (${hero.body.length} bytes content, ${b.visible ? 'visible-on-spiral' : 'hidden-on-spiral'})`,
  );
  made++;
}

console.log(`\nwrote ${made}/${BRANCHES.length} branch HTML files to ${OUT}`);
