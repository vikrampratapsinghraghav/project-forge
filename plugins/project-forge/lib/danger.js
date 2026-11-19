'use strict';

// Commands that can destroy work, leak data or bypass the safety net. Each is blocked with a reason.
const RULES = [
  {
    id: 'rm-root',
    re: /\brm\s+(?:-[a-zA-Z]*\s+)*-[a-zA-Z]*(?:rf|fr)[a-zA-Z]*\s+(?:--\s+)?(?:\/|~|\$HOME|\/\*|~\/\*?)(?:\s|$|;|&)/,
    reason: 'recursive delete of the filesystem root or home folder',
  },
  {
    id: 'force-push-protected',
    re: /\bgit\s+push\b(?=.*(?:\s--force(?:-with-lease)?\b|\s-f\b))(?=.*\b(?:main|master|production|prod)\b)/,
    reason: 'force-push to a protected branch (main/master/production)',
  },
  {
    id: 'force-push-plus-ref',
    re: /\bgit\s+push\b.*\s\+(?:main|master|production|prod)\b/,
    reason: 'force-push to a protected branch via +ref',
  },
  {
    id: 'pipe-to-shell',
    re: /\b(?:curl|wget)\b[^|;&]*\|\s*(?:sudo\s+)?(?:ba|z|da)?sh\b/,
    reason: 'piping a downloaded script straight into a shell',
  },
  {
    id: 'no-verify',
    re: /\bgit\s+(?:commit|push)\b.*\s--no-verify\b/,
    reason: 'skipping git hooks with --no-verify',
  },
  {
    id: 'chmod-777',
    re: /\bchmod\s+(?:-R\s+)?0?777\b/,
    reason: 'world-writable permissions (chmod 777)',
  },
  {
    id: 'cat-secrets',
    re: /\b(?:cat|less|more|head|tail|bat)\s+(?:[^|;&]*[\s/])?\.env(?:\.(?!example\b|sample\b|template\b)[\w.-]+)?(?:\s|$|;|&|\|)/,
    reason: 'printing a secrets file (.env) into the session',
  },
];

/** First matching dangerous pattern, or null. */
function findDanger(command) {
  if (typeof command !== 'string' || !command.trim()) return null;
  for (const rule of RULES) {
    if (rule.re.test(command)) return { id: rule.id, reason: rule.reason };
  }
  return null;
}

module.exports = { findDanger };
