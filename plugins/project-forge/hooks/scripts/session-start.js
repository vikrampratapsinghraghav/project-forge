#!/usr/bin/env node
'use strict';
// SessionStart: in a forge project, remind Claude of the rules (stdout is added to context).

const fs = require('node:fs');
const path = require('node:path');
const { readHookInput } = require('./read-input');
const { findForgeProject } = require('../../lib/config');

function main() {
  const input = readHookInput();
  const project = findForgeProject(input.cwd || process.cwd());
  if (!project) return 0;

  const has = (f) => fs.existsSync(path.join(project.root, f));
  const docs = ['CLAUDE.md', 'ARCHITECTURE.md', 'DESIGN.md'].filter(has);
  const missing = ['CLAUDE.md', 'ARCHITECTURE.md', 'DESIGN.md'].filter((f) => !has(f));

  const lines = [
    'project-forge is active in this repository.',
    `Rules live in: ${docs.join(', ') || '(none found)'}. Follow them for every change.`,
    'Enforced automatically:',
    '- Writing secrets into files and dangerous shell commands (rm -rf /, force-push to main, curl | sh, --no-verify) are blocked.',
    '- Layer boundaries and design tokens are checked after every file edit.',
    '- Commits are blocked if they would include secrets or an un-ignored .env file.',
    `- Every git commit runs "${project.config.verifyCommand || '(verifyCommand not set)'}" and is blocked if it fails.`,
    '- When a turn leaves files changed, verify runs before the turn ends; fix any failure before finishing.',
    'Working agreement: plan before non-trivial changes, search for existing code before creating new code, write tests with every logic change, never weaken tests to pass, and run /update-rules when a new decision is made.',
  ];
  if (missing.length) {
    lines.push(`Missing docs: ${missing.join(', ')}. Offer to create them with /new-project (adopt mode).`);
  }
  process.stdout.write(lines.join('\n') + '\n');
  return 0;
}

try {
  process.exitCode = main();
} catch (err) {
  process.stderr.write(`project-forge session-start hook error: ${err.message}\n`);
  process.exitCode = 0;
}
