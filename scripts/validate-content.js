#!/usr/bin/env node
/**
 * Validates the manifest and content files against the project's invariants.
 * Zero dependencies, matching the repo's no-build ethos. Run locally with:
 *   node scripts/validate-content.js
 * CI runs the same command on every pull request.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = path.join(ROOT, 'site');
const MANIFEST = path.join(SITE, 'data', 'manifest.json');
const CONTENT_DIR = path.join(SITE, 'content');

const errors = [];
const err = (m) => errors.push(m);

// 1. manifest.json must be valid JSON
let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
} catch (e) {
  console.error('✗ site/data/manifest.json is not valid JSON: ' + e.message);
  process.exit(1);
}

const badges = manifest.badges || {};
const features = manifest.features || {};

// 2. Walk the tree: collect file nodes, check badge / feature references resolve
const fileNodes = [];
const walk = (nodes) => {
  if (!Array.isArray(nodes)) return;
  for (const n of nodes) {
    if (n.type === 'separator') continue;
    if (n.type === 'file') fileNodes.push(n);
    if (n.badge && !badges[n.badge]) {
      err(`node "${n.path || n.name}" references unknown badge "${n.badge}"`);
    }
    if (n.feature && !features[n.feature]) {
      err(`node "${n.path || n.name}" references unknown feature "${n.feature}"`);
    }
    if (n.children) walk(n.children);
  }
};
walk(manifest.tree);

// 3. Every contentFile must exist on disk
for (const n of fileNodes) {
  if (n.contentFile) {
    const p = path.join(CONTENT_DIR, n.contentFile);
    if (!fs.existsSync(p)) {
      err(`contentFile not found: site/content/${n.contentFile} (node "${n.path}")`);
    }
  }
}

// 4. Content markdown must be free of em / en dashes.
// (LF line endings are enforced by .gitattributes, not checked here: a
// Windows working copy shows CRLF locally while committing LF, so a byte
// check would false-positive off-CI. Dashes are byte-stable across OSes.)
const DASH = /[—–]/; // em dash, en dash
const walkFiles = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const rel = path.relative(SITE, full).replace(/\\/g, '/');
      fs.readFileSync(full, 'utf8').split('\n').forEach((line, i) => {
        if (DASH.test(line)) err(`em/en dash in ${rel}:${i + 1} (use commas, colons, or periods)`);
      });
    }
  }
};
if (fs.existsSync(CONTENT_DIR)) walkFiles(CONTENT_DIR);

// 5. Every badge needs its token + tree class in sync (the "adding a badge" invariant)
const variablesCss = fs.readFileSync(path.join(SITE, 'css', 'variables.css'), 'utf8');
const componentsCss = fs.readFileSync(path.join(SITE, 'css', 'components.css'), 'utf8');
for (const id of Object.keys(badges)) {
  if (!variablesCss.includes(`--badge-${id}`)) {
    err(`badge "${id}" is missing its --badge-${id} token in css/variables.css`);
  }
  if (!componentsCss.includes(`.tree-badge--${id}`)) {
    err(`badge "${id}" is missing its .tree-badge--${id} rule in css/components.css`);
  }
}

// Report
if (errors.length) {
  console.error(`✗ ${errors.length} problem(s) found:`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log(`✓ content checks passed (${fileNodes.length} file nodes, ${Object.keys(badges).length} badges)`);
