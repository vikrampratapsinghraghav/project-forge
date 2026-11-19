#!/usr/bin/env node
'use strict';
// Structural checks for the marketplace: valid JSON, skills/agents have frontmatter, hook scripts exist.

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const PLUGIN = path.join(ROOT, 'plugins', 'project-forge');
const errors = [];

function readJson(rel) {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
  } catch (err) {
    errors.push(`${rel}: ${err.message}`);
    return null;
  }
}

function frontmatter(file) {
  const text = fs.readFileSync(file, 'utf8');
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const out = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) out[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return out;
}

const market = readJson('.claude-plugin/marketplace.json');
const plugin = readJson('plugins/project-forge/.claude-plugin/plugin.json');
const hooks = readJson('plugins/project-forge/hooks/hooks.json');
for (const rel of [
  'plugins/project-forge/templates/claude-settings.json',
  'plugins/project-forge/templates/presets/forge-config.web.json',
  'plugins/project-forge/templates/presets/forge-config.mobile.json',
]) readJson(rel);

if (market && plugin) {
  const entry = market.plugins.find((p) => p.name === plugin.name);
  if (!entry) errors.push('marketplace.json does not list the plugin by its plugin.json name');
  else if (!fs.existsSync(path.join(ROOT, entry.source))) errors.push(`plugin source missing: ${entry.source}`);
}

for (const dir of fs.readdirSync(path.join(PLUGIN, 'skills'))) {
  const file = path.join(PLUGIN, 'skills', dir, 'SKILL.md');
  const fm = fs.existsSync(file) ? frontmatter(file) : null;
  if (!fm || fm.name !== dir || !fm.description) errors.push(`skills/${dir}/SKILL.md needs frontmatter with name: ${dir} and a description`);
}

for (const f of fs.readdirSync(path.join(PLUGIN, 'agents'))) {
  const fm = frontmatter(path.join(PLUGIN, 'agents', f));
  if (!fm || !fm.name || !fm.description) errors.push(`agents/${f} needs name and description frontmatter`);
}

if (hooks) {
  for (const groups of Object.values(hooks.hooks || {})) {
    for (const g of groups) {
      for (const h of g.hooks) {
        const m = h.command.match(/\$\{CLAUDE_PLUGIN_ROOT\}\/([^"\s]+)/);
        if (!m || !fs.existsSync(path.join(PLUGIN, m[1]))) errors.push(`hook command target missing: ${h.command}`);
      }
    }
  }
}

if (errors.length) {
  console.error(`validate: ${errors.length} problem(s)\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log('validate: OK');
