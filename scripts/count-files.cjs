#!/usr/bin/env node
/**
 * File Counting Script
 * Outputs code file counts for project metrics
 * Run: node scripts/count-files.js
 */

const fs = require('fs');
const path = require('path');

const IGNORE_DIRS = ['node_modules', 'dist', '.git', '.astro', 'coverage'];
const CODE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.astro', '.css', '.md'];

function walkDir(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (IGNORE_DIRS.includes(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walkDir(fullPath, files);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (CODE_EXTENSIONS.includes(ext) || entry.name === 'package.json') {
        files.push(fullPath);
      }
    }
  }

  return files;
}

const srcFiles = walkDir('src');
const configFiles = [
  'astro.config.mjs',
  'tsconfig.json',
  'package.json',
].filter((f) => fs.existsSync(f));
const testFiles = walkDir('tests').length;

const output = {
  code_files: srcFiles.length + configFiles.length,
  test_files: testFiles,
  repos_with_tests: testFiles > 0 ? 1 : 0,
  timestamp: new Date().toISOString(),
};

console.log(JSON.stringify(output, null, 2));
