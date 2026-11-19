#!/usr/bin/env node
'use strict';
// Stop: before Claude ends a turn that left the working tree changed, run the project's
// verify command. Exit 2 shows the failure to Claude so it fixes it before finishing.
// A passing state is remembered, so Q&A turns and repeated stops don't re-run verify.

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { readHookInput } = require('./read-input');
const { findForgeProject } = require('../../lib/config');
const { runVerify } = require('../../lib/verify');

function git(root, args) {
  const r = spawnSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return r.status === 0 ? r.stdout : null;
}

/** Fingerprint of everything uncommitted, or null when the tree is clean or not a git repo. */
function treeFingerprint(root) {
  const status = git(root, ['status', '--porcelain', '-uall']);
  if (!status || !status.trim()) return null;
  const hash = crypto.createHash('sha256').update(status);
  hash.update(git(root, ['diff', 'HEAD', '--no-color']) ?? git(root, ['diff', '--no-color']) ?? '');
  for (const f of (git(root, ['ls-files', '--others', '--exclude-standard']) || '').split('\n').filter(Boolean)) {
    try {
      const st = fs.statSync(path.join(root, f));
      hash.update(`${f}:${st.size}:${st.mtimeMs}\n`);
    } catch {
      /* removed meanwhile: skip */
    }
  }
  return hash.digest('hex');
}

function main() {
  const input = readHookInput();
  // Already retried once after a failed gate: let Claude stop instead of looping.
  if (input.stop_hook_active) return 0;

  const project = findForgeProject(input.cwd || process.cwd());
  if (!project || !project.config.verifyOnStop || !project.config.verifyCommand) return 0;

  const fingerprint = treeFingerprint(project.root);
  if (!fingerprint) return 0;

  const markerRel = (git(project.root, ['rev-parse', '--git-path', 'project-forge-verified']) || '').trim();
  const marker = markerRel && path.resolve(project.root, markerRel);
  if (marker && fs.existsSync(marker) && fs.readFileSync(marker, 'utf8') === fingerprint) return 0;

  const result = runVerify(project);
  if (result.ok) {
    if (marker) fs.writeFileSync(marker, fingerprint);
    return 0;
  }

  process.stderr.write(
    [
      `project-forge: "${project.config.verifyCommand}" ${result.reason}. Fix this before finishing the turn.`,
      'Do not skip, delete or weaken tests to make it pass.',
      '--- output (last 60 lines) ---',
      result.output,
    ].join('\n') + '\n',
  );
  return 2;
}

try {
  process.exitCode = main();
} catch (err) {
  process.stderr.write(`project-forge stop hook error: ${err.message}\n`);
  process.exitCode = 0;
}
