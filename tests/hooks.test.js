'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { isCommitCommand } = require('../plugins/project-forge/hooks/scripts/pre-commit-gate');

const SCRIPTS = path.join(__dirname, '..', 'plugins', 'project-forge', 'hooks', 'scripts');
const PRESET = path.join(__dirname, '..', 'plugins', 'project-forge', 'templates', 'presets', 'forge-config.web.json');

function makeProject(verifyCommand) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'forge-'));
  const cfg = JSON.parse(fs.readFileSync(PRESET, 'utf8'));
  cfg.verifyCommand = verifyCommand;
  fs.mkdirSync(path.join(root, '.forge'));
  fs.writeFileSync(path.join(root, '.forge', 'config.json'), JSON.stringify(cfg));
  return root;
}

function writeFile(root, rel, content) {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content);
  return abs;
}

function runHook(script, input) {
  return spawnSync(process.execPath, [path.join(SCRIPTS, script)], { input: JSON.stringify(input), encoding: 'utf8' });
}

test('isCommitCommand detects commits only', () => {
  assert.equal(isCommitCommand('git commit -m "x"'), true);
  assert.equal(isCommitCommand('git add . && git commit -m "x"'), true);
  assert.equal(isCommitCommand('git -C app commit -am x'), true);
  assert.equal(isCommitCommand('git status'), false);
  assert.equal(isCommitCommand('git commit --help'), false);
  assert.equal(isCommitCommand('echo "git commit"'), false);
  assert.equal(isCommitCommand(undefined), false);
});

test('post-edit: violation in a forge project exits 2 with a message', () => {
  const root = makeProject('true');
  const file = writeFile(root, 'src/app/page.tsx', "import { getUser } from '@/services/users';\nconst c = '#123456';\n");
  const r = runHook('post-edit.js', { cwd: root, tool_name: 'Write', tool_input: { file_path: file } });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /"ui" layer must not import "network"/);
  assert.match(r.stderr, /raw hex colour/);
});

test('post-edit: clean file exits 0', () => {
  const root = makeProject('true');
  const file = writeFile(root, 'src/app/page.tsx', "import { useUser } from '@/features/user/useUser';\n");
  assert.equal(runHook('post-edit.js', { cwd: root, tool_input: { file_path: file } }).status, 0);
});

test('post-edit: outside a forge project is a silent no-op', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'plain-'));
  const file = writeFile(root, 'src/app/page.tsx', "const c = '#123456';\n");
  const r = runHook('post-edit.js', { cwd: root, tool_input: { file_path: file } });
  assert.equal(r.status, 0);
  assert.equal(r.stderr, '');
});

test('pre-commit: failing verify blocks the commit', () => {
  const root = makeProject('node -e "console.log(\'2 tests failed\'); process.exit(1)"');
  const r = runHook('pre-commit-gate.js', { cwd: root, tool_input: { command: 'git commit -m wip' } });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /commit blocked/);
  assert.match(r.stderr, /2 tests failed/);
});

test('pre-commit: passing verify allows the commit; non-commit commands are ignored', () => {
  const root = makeProject('node -e "process.exit(0)"');
  assert.equal(runHook('pre-commit-gate.js', { cwd: root, tool_input: { command: 'git commit -m ok' } }).status, 0);
  const failing = makeProject('node -e "process.exit(1)"');
  assert.equal(runHook('pre-commit-gate.js', { cwd: failing, tool_input: { command: 'ls -la' } }).status, 0);
});

test('session-start: prints rules in a forge project, nothing elsewhere', () => {
  const root = makeProject('pnpm verify');
  writeFile(root, 'CLAUDE.md', '# x');
  const r = runHook('session-start.js', { cwd: root });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /project-forge is active/);
  assert.match(r.stdout, /Missing docs: ARCHITECTURE\.md, DESIGN\.md/);

  const plain = fs.mkdtempSync(path.join(os.tmpdir(), 'plain-'));
  assert.equal(runHook('session-start.js', { cwd: plain }).stdout, '');
});
