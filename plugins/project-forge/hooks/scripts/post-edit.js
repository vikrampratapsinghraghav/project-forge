#!/usr/bin/env node
'use strict';
// PostToolUse (Write|Edit|MultiEdit): check layer boundaries + design tokens on the edited file.
// Exit 2 sends the findings to Claude so it fixes them. Outside forge projects: silent no-op.

const fs = require('node:fs');
const path = require('node:path');
const { readHookInput } = require('./read-input');
const { findForgeProject, toRel } = require('../../lib/config');
const { checkLayerImports } = require('../../lib/layers');
const { checkDesignTokens } = require('../../lib/design');

function main() {
  const input = readHookInput();
  const filePath = input && input.tool_input && input.tool_input.file_path;
  if (!filePath) return 0;

  const cwd = input.cwd || process.cwd();
  const absFile = path.resolve(cwd, filePath);
  const project = findForgeProject(path.dirname(absFile));
  if (!project || !fs.existsSync(absFile)) return 0;

  const fileRel = toRel(project.root, absFile);
  if (fileRel.startsWith('..') || fileRel.includes('node_modules/')) return 0;

  const source = fs.readFileSync(absFile, 'utf8');
  const problems = [
    ...checkLayerImports({ fileRel, source, config: project.config }),
    ...checkDesignTokens({ fileRel, source, design: project.config.design }),
  ];
  if (problems.length === 0) return 0;

  process.stderr.write(
    [
      `project-forge found ${problems.length} rule violation(s). Fix them before continuing:`,
      ...problems.map((p) => `- ${p.message}`),
    ].join('\n') + '\n',
  );
  return 2;
}

try {
  process.exitCode = main();
} catch (err) {
  // Never break the session because of a hook bug: report and continue.
  process.stderr.write(`project-forge post-edit hook error: ${err.message}\n`);
  process.exitCode = 1;
}
