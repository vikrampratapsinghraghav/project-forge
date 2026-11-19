#!/usr/bin/env node
'use strict';
// PreToolUse (Bash): block destructive or safety-bypassing commands, in every project.

const { readHookInput } = require('./read-input');
const { findDanger } = require('../../lib/danger');

function main() {
  const input = readHookInput();
  const command = input.tool_input && input.tool_input.command;
  const hit = findDanger(command);
  if (!hit) return 0;

  process.stderr.write(
    [
      `project-forge blocked this command: ${hit.reason} [${hit.id}].`,
      'Find a safer way to reach the goal. If the user really needs this, explain the risk and let them run it themselves.',
    ].join('\n') + '\n',
  );
  return 2;
}

try {
  process.exitCode = main();
} catch (err) {
  process.stderr.write(`project-forge danger-guard hook error: ${err.message}\n`);
  process.exitCode = 1;
}
