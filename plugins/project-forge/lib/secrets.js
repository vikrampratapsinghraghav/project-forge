'use strict';

// High-signal secret formats. Kept specific on purpose: false positives train people to ignore the guard.
const PATTERNS = [
  { id: 'private-key', re: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP |ENCRYPTED )?PRIVATE KEY-----/ },
  { id: 'aws-access-key', re: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/ },
  { id: 'github-token', re: /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{40,})\b/ },
  { id: 'anthropic-key', re: /\bsk-ant-[A-Za-z0-9_-]{20,}/ },
  { id: 'openai-key', re: /\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{32,}/ },
  { id: 'stripe-live-key', re: /\b(?:sk|rk)_live_[A-Za-z0-9]{20,}/ },
  { id: 'slack-token', re: /\bxox[abprs]-[A-Za-z0-9-]{10,}/ },
  { id: 'google-api-key', re: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  {
    id: 'hardcoded-credential',
    re: /\b(?:api[_-]?key|secret[_-]?key|client[_-]?secret|access[_-]?token|auth[_-]?token|password|passwd)\b["']?\s*[:=]\s*["'`]([^"'`\s]{16,})["'`]/i,
    valueGroup: 1,
  },
];

const PLACEHOLDER = /^(?:x+|\*+|your[-_].*|<.*>|\$\{.*\}|changeme|example.*|placeholder.*|dummy.*|test[-_].*|fake[-_].*|redacted)$/i;

// Files that are meant to hold real secrets locally and are git-ignored by the templates.
const LOCAL_SECRET_FILE = /(^|\/)\.env(\.(?!example$|sample$|template$)[\w.-]+)?$/;

function isLocalSecretFile(fileRel) {
  return LOCAL_SECRET_FILE.test(fileRel);
}

/** Secret-looking values in text. Returns [{ line, id }] — never echoes the secret itself. */
function findSecrets(text) {
  const found = [];
  String(text || '')
    .split(/\r?\n/)
    .forEach((line, i) => {
      if (/forge-ignore/.test(line) || /process\.env|import\.meta\.env|Deno\.env/.test(line)) return;
      for (const p of PATTERNS) {
        const m = line.match(p.re);
        if (!m) continue;
        if (p.valueGroup && PLACEHOLDER.test(m[p.valueGroup])) continue;
        found.push({ line: i + 1, id: p.id });
        break;
      }
    });
  return found;
}

module.exports = { findSecrets, isLocalSecretFile };
