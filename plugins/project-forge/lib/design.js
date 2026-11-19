'use strict';

const RULES = [
  { id: 'hex-color', re: /(?<![\w&/])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g, what: 'raw hex colour' },
  { id: 'fn-color', re: /\b(?:rgba?|hsla?)\(/g, what: 'raw rgb()/hsl() colour' },
  { id: 'px-size', re: /(?<![\w.-])(?:[2-9]|[1-9]\d+)px\b/g, what: 'raw px size' },
];

/** Should this repo-relative file be checked for design-token usage? */
function isDesignChecked(fileRel, design) {
  if (!design) return false;
  if (design.tokensFiles.some((t) => fileRel === t)) return false;
  if (design.ignore.some((part) => fileRel.includes(part))) return false;
  if (!design.extensions.some((ext) => fileRel.endsWith(ext))) return false;
  return design.checkDirs.some((dir) => {
    const d = dir.endsWith('/') ? dir : `${dir}/`;
    return fileRel.startsWith(d);
  });
}

/** Hard-coded colours / sizes that should come from design tokens. */
function findRawValues(source) {
  const found = [];
  source.split(/\r?\n/).forEach((line, i) => {
    if (/forge-ignore/.test(line)) return;
    const trimmed = line.trim();
    if (trimmed.startsWith('import ') || trimmed.startsWith('//') || trimmed.startsWith('*')) return;
    for (const rule of RULES) {
      rule.re.lastIndex = 0;
      let m;
      while ((m = rule.re.exec(line)) !== null) {
        found.push({ line: i + 1, value: m[0].replace(/\($/, '()'), rule: rule.id, what: rule.what });
      }
    }
  });
  return found;
}

function checkDesignTokens({ fileRel, source, design }) {
  if (!isDesignChecked(fileRel, design)) return [];
  return findRawValues(source).map((v) => ({
    ...v,
    message: `${fileRel}:${v.line} — ${v.what} "${v.value}". Use a design token instead (see DESIGN.md). Add "forge-ignore" on the line only if it is truly intentional.`,
  }));
}

module.exports = { isDesignChecked, findRawValues, checkDesignTokens };
