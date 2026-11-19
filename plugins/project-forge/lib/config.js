'use strict';

const fs = require('node:fs');
const path = require('node:path');

const CONFIG_REL = path.join('.forge', 'config.json');

/**
 * Walk up from `startDir` until a `.forge/config.json` is found.
 * Returns { root, config } or null when the directory is not a forge project.
 * Hooks are installed globally, so "not a forge project" must be a silent no-op.
 */
function findForgeProject(startDir) {
  if (!startDir) return null;
  let dir = path.resolve(startDir);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const candidate = path.join(dir, CONFIG_REL);
    if (fs.existsSync(candidate)) {
      return { root: dir, config: parseConfig(fs.readFileSync(candidate, 'utf8'), candidate) };
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function parseConfig(text, source = 'config') {
  let raw;
  try {
    raw = JSON.parse(text);
  } catch (err) {
    throw new Error(`project-forge: invalid JSON in ${source}: ${err.message}`);
  }
  return normalizeConfig(raw);
}

function normalizeConfig(raw) {
  const cfg = raw && typeof raw === 'object' ? raw : {};
  return {
    verifyCommand: typeof cfg.verifyCommand === 'string' ? cfg.verifyCommand : null,
    verifyTimeoutSec: Number.isFinite(cfg.verifyTimeoutSec) ? cfg.verifyTimeoutSec : 600,
    verifyOnStop: cfg.verifyOnStop !== false,
    aliases: isPlainObject(cfg.aliases) ? cfg.aliases : { '@/': 'src/' },
    layers: isPlainObject(cfg.layers) ? cfg.layers : {},
    forbidden: isPlainObject(cfg.forbidden) ? cfg.forbidden : {},
    design: {
      tokensFiles: arrayOf(cfg.design && cfg.design.tokensFiles),
      checkDirs: arrayOf(cfg.design && cfg.design.checkDirs),
      extensions: arrayOf(cfg.design && cfg.design.extensions, ['.tsx', '.jsx', '.css', '.scss']),
      ignore: arrayOf(cfg.design && cfg.design.ignore, ['.test.', '.spec.', '.stories.']),
      allow: arrayOf(cfg.design && cfg.design.allow),
    },
  };
}

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function arrayOf(v, fallback = []) {
  return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : fallback;
}

/** Repo-relative POSIX path (works the same on macOS, Linux and Windows). */
function toRel(root, absPath) {
  return path.relative(root, path.resolve(root, absPath)).split(path.sep).join('/');
}

module.exports = { findForgeProject, parseConfig, normalizeConfig, toRel, CONFIG_REL };
