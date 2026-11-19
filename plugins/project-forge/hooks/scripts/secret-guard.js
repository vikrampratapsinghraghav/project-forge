#!/usr/bin/env node
'use strict';
// PreToolUse (Write|Edit|MultiEdit): block writing secrets into source files.
// Applies everywhere (not only forge projects) — leaking a key is never project-specific.
// Real secrets belong in git-ignored .env files, read through the typed env module.

const path = require('node:path');
const { readHookInput } = require('./read-input');
const { findSecrets, isLocalSecretFile } = require('../../lib/secrets');

function newText(toolInput) {
  if (!toolInput) return '';
  if (typeof toolInput.content === 'string') return toolInput.content; // Write
  if (typeof toolInput.new_string === 'string') return toolInput.new_string; // Edit
  if (Array.isArray(toolInput.edits)) return toolInput.edits.map((e) => e.new_string || '').join('\n'); // MultiEdit
  return '';
}

function main() {
  const input = readHookInput();
  const toolInput = input.tool_input || {};
  const filePath = toolInput.file_path;
  if (!filePath) return 0;

  const rel = filePath.split(path.sep).join('/');
  if (isLocalSecretFile(rel)) return 0;

  const hits = findSecrets(newText(toolInput));
  if (hits.length === 0) return 0;

  process.stderr.write(
    [
      `project-forge blocked this edit: it would write ${hits.length} secret-looking value(s) into ${path.basename(filePath)}.`,
      ...hits.map((h) => `- line ${h.line} (in the new text): ${h.id}`),
      'Put the real value in a git-ignored .env file, document the variable name in .env.example, and read it through the typed env module.',
      'If this is a harmless placeholder or test fixture, use an obvious fake (e.g. "your-api-key") or add "forge-ignore" on that line.',
    ].join('\n') + '\n',
  );
  return 2;
}

try {
  process.exitCode = main();
} catch (err) {
  process.stderr.write(`project-forge secret-guard hook error: ${err.message}\n`);
  process.exitCode = 1;
}
