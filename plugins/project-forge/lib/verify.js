'use strict';

const { spawnSync } = require('node:child_process');

function tail(text, lines) {
  return String(text || '').split(/\r?\n/).slice(-lines).join('\n');
}

/**
 * Run the project's verify command. Returns { ok, reason, output } where output is the
 * last 60 lines of stdout + stderr, ready to show to Claude.
 */
function runVerify(project) {
  const { verifyCommand, verifyTimeoutSec } = project.config;
  const result = spawnSync(verifyCommand, {
    cwd: project.root,
    shell: true,
    encoding: 'utf8',
    timeout: verifyTimeoutSec * 1000,
    env: { ...process.env, CI: process.env.CI || '1', FORCE_COLOR: '0' },
  });
  if (result.status === 0) return { ok: true };

  const reason = result.error && result.error.code === 'ETIMEDOUT'
    ? `timed out after ${verifyTimeoutSec}s`
    : `exited with code ${result.status}`;
  return { ok: false, reason, output: tail(`${result.stdout || ''}\n${result.stderr || ''}`, 60) };
}

module.exports = { runVerify };
