#!/usr/bin/env node
'use strict';
// PreToolUse (Bash): before any `git commit`, run the project's verify command
// (lint + typecheck + tests). Exit 2 blocks the commit and shows the failure to Claude.

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { readHookInput } = require('./read-input');
const { findForgeProject } = require('../../lib/config');
const { findSecrets, isLocalSecretFile } = require('../../lib/secrets');

function git(root, args) {
  const r = spawnSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return r.status === 0 ? r.stdout : null;
}

/**
 * Secrets and .env files that this commit could include. The commit command may also stage
 * files (`git add -A && git commit`), so check everything not ignored, not only the index.
 */
function findCommitRisks(root) {
  const risks = [];
  const candidates = (git(root, ['ls-files', '--cached', '--others', '--exclude-standard']) || '')
    .split('\n')
    .filter(Boolean);
  for (const f of candidates) {
    if (isLocalSecretFile(f)) risks.push(`${f} — secrets file is not git-ignored. Add it to .gitignore (and untrack it with "git rm --cached ${f}").`);
  }

  // Added lines in tracked files (staged + unstaged).
  const diff = git(root, ['diff', 'HEAD', '-U0', '--no-color']) ?? git(root, ['diff', '--cached', '-U0', '--no-color']) ?? '';
  let current = null;
  const added = new Map();
  for (const line of diff.split('\n')) {
    if (line.startsWith('+++ b/')) current = line.slice(6);
    else if (line.startsWith('+') && !line.startsWith('+++') && current) {
      added.set(current, `${added.get(current) || ''}${line.slice(1)}\n`);
    }
  }
  // New untracked files are fully "added".
  for (const f of (git(root, ['ls-files', '--others', '--exclude-standard']) || '').split('\n').filter(Boolean)) {
    const abs = path.join(root, f);
    try {
      if (fs.statSync(abs).size < 1024 * 1024) added.set(f, fs.readFileSync(abs, 'utf8'));
    } catch {
      /* unreadable or removed: skip */
    }
  }
  for (const [file, text] of added) {
    if (isLocalSecretFile(file)) continue;
    for (const hit of findSecrets(text)) risks.push(`${file} — ${hit.id} in the changes`);
  }
  return risks;
}

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

  const risks = findCommitRisks(project.root);
  if (risks.length) {
    process.stderr.write(
      [
        'project-forge: commit blocked — possible secrets would be committed:',
        ...risks.slice(0, 20).map((r) => `- ${r}`),
        'Move real values to a git-ignored .env file and read them through the typed env module. If a value was already pushed anywhere, rotate it.',
      ].join('\n') + '\n',
    );
    return 2;
  }

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

module.exports = { isCommitCommand, findCommitRisks };
