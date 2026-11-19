#!/usr/bin/env node
'use strict';
// PreToolUse (Bash): before any `git commit`, run the project's verify command
// (lint + typecheck + tests). Exit 2 blocks the commit and shows the failure to Claude.

const { spawnSync } = require('node:child_process');
const { readHookInput } = require('./read-input');
const { findForgeProject } = require('../../lib/config');

// git [global options, incl. "-C <path>" / "-c <key=value>"] commit
const COMMIT_RE = /(^|[\s;&|(])git\s+(?:-[Cc]\s+\S+\s+|--?[\w-]+(?:=\S+)?\s+)*commit\b/;

function isCommitCommand(command) {
  if (typeof command !== 'string') return false;
  if (/--help\b|--dry-run\b/.test(command)) return false;
  return COMMIT_RE.test(command);
}

function tail(text, lines) {
  return String(text || '').split(/\r?\n/).slice(-lines).join('\n');
}

function main() {
  const input = readHookInput();
  const command = input && input.tool_input && input.tool_input.command;
  if (!isCommitCommand(command)) return 0;

  const project = findForgeProject(input.cwd || process.cwd());
  if (!project) return 0;

  const { verifyCommand, verifyTimeoutSec } = project.config;
  if (!verifyCommand) {
    process.stderr.write(
      'project-forge: commit blocked — .forge/config.json has no "verifyCommand". Add one (e.g. "pnpm verify") so every commit is checked.\n',
    );
    return 2;
  }

  const result = spawnSync(verifyCommand, {
    cwd: project.root,
    shell: true,
    encoding: 'utf8',
    timeout: verifyTimeoutSec * 1000,
    env: { ...process.env, CI: process.env.CI || '1', FORCE_COLOR: '0' },
  });

  if (result.status === 0) return 0;

  const reason = result.error && result.error.code === 'ETIMEDOUT'
    ? `timed out after ${verifyTimeoutSec}s`
    : `exited with code ${result.status}`;
  process.stderr.write(
    [
      `project-forge: commit blocked — "${verifyCommand}" ${reason}.`,
      'Fix the failures below, then commit again. Do not skip, delete or weaken tests to make this pass.',
      '--- output (last 60 lines) ---',
      tail(`${result.stdout || ''}\n${result.stderr || ''}`, 60),
    ].join('\n') + '\n',
  );
  return 2;
}

if (require.main === module) {
  try {
    process.exitCode = main();
  } catch (err) {
    process.stderr.write(`project-forge pre-commit hook error: ${err.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = { isCommitCommand };
