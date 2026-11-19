'use strict';

const path = require('node:path');

const CODE_EXT = /\.(c|m)?(t|j)sx?$/;

// import x from '..' | import '..' | export .. from '..' | require('..') | import('..')
const IMPORT_RE =
  /(?:import|export)\s+(?:[^'"`;]*?\s+from\s+)?['"]([^'"]+)['"]|require\(\s*['"]([^'"]+)['"]\s*\)|import\(\s*['"]([^'"]+)['"]\s*\)/g;

/** Layer that owns a repo-relative path (longest matching prefix wins). */
function layerOf(relPath, layers) {
  let best = null;
  let bestLen = -1;
  for (const [name, prefixes] of Object.entries(layers || {})) {
    for (const prefix of prefixes || []) {
      const p = prefix.endsWith('/') ? prefix : `${prefix}/`;
      if ((relPath === prefix || relPath.startsWith(p)) && p.length > bestLen) {
        best = name;
        bestLen = p.length;
      }
    }
  }
  return best;
}

/** Every import specifier in a source file, with its 1-based line number. */
function extractImports(source) {
  const out = [];
  const lines = source.split(/\r?\n/);
  lines.forEach((line, i) => {
    if (/forge-ignore/.test(line)) return;
    IMPORT_RE.lastIndex = 0;
    let m;
    while ((m = IMPORT_RE.exec(line)) !== null) {
      const spec = m[1] || m[2] || m[3];
      if (spec) out.push({ spec, line: i + 1 });
    }
  });
  return out;
}

/** Repo-relative target of a specifier, or null for packages (react, zod, ...). */
function resolveSpecifier(spec, fileRel, aliases) {
  if (spec.startsWith('./') || spec.startsWith('../')) {
    return path.posix.normalize(path.posix.join(path.posix.dirname(fileRel), spec));
  }
  for (const [alias, target] of Object.entries(aliases || {})) {
    if (spec.startsWith(alias)) {
      return path.posix.normalize(target + spec.slice(alias.length));
    }
  }
  return null;
}

/**
 * Layer-boundary violations for one file.
 * config.forbidden: { ui: ['network', 'data'], ... } = "ui must not import network or data".
 */
function checkLayerImports({ fileRel, source, config }) {
  if (!CODE_EXT.test(fileRel)) return [];
  const from = layerOf(fileRel, config.layers);
  if (!from) return [];
  const banned = new Set(config.forbidden[from] || []);
  if (banned.size === 0) return [];

  const violations = [];
  for (const { spec, line } of extractImports(source)) {
    const target = resolveSpecifier(spec, fileRel, config.aliases);
    if (!target) continue;
    const to = layerOf(target, config.layers);
    if (to && to !== from && banned.has(to)) {
      violations.push({
        line,
        spec,
        from,
        to,
        message: `${fileRel}:${line} — "${from}" layer must not import "${to}" layer ("${spec}"). Route it through the allowed layer instead (see ARCHITECTURE.md).`,
      });
    }
  }
  return violations;
}

module.exports = { layerOf, extractImports, resolveSpecifier, checkLayerImports };
