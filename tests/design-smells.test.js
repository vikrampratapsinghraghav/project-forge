'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { findSmells, checkDesignTokens } = require('../plugins/project-forge/lib/design');
const { normalizeConfig } = require('../plugins/project-forge/lib/config');
const webPreset = require('../plugins/project-forge/templates/presets/forge-config.web.json');

test('findSmells catches CSS, Tailwind and React Native gradients and blur', () => {
  const src = [
    'background: linear-gradient(90deg, var(--a), var(--b));',
    '<h1 className="bg-gradient-to-r from-brand to-accent bg-clip-text" />',
    '<div className="bg-linear-to-br" />',
    '<div className="backdrop-blur-md" />',
    'backdrop-filter: blur(12px);',
    '<LinearGradient colors={c} />',
  ].join('\n');
  assert.deepEqual(findSmells(src).map((s) => s.rule), ['gradient', 'gradient', 'gradient', 'blur', 'blur', 'gradient']);
});

test('findSmells respects design.allow and forge-ignore', () => {
  assert.deepEqual(findSmells('background: radial-gradient(var(--a), var(--b));', ['gradient']), []);
  assert.deepEqual(findSmells('<div className="backdrop-blur" /> {/* forge-ignore */}'), []);
});

test('findSmells ignores normal class names and words', () => {
  assert.deepEqual(findSmells('<div className="bg-surface text-muted blur-none" /> const gradientSteps = 3;'), []);
});

test('checkDesignTokens reports smells with a fix hint', () => {
  const { design } = normalizeConfig(webPreset);
  const v = checkDesignTokens({ fileRel: 'src/app/page.tsx', source: '<div className="bg-gradient-to-r" />', design });
  assert.equal(v.length, 1);
  assert.match(v[0].message, /reads as generated UI/);
  assert.match(v[0].message, /design\.allow/);

  const allowed = normalizeConfig({ ...webPreset, design: { ...webPreset.design, allow: ['gradient'] } }).design;
  assert.equal(checkDesignTokens({ fileRel: 'src/app/page.tsx', source: '<div className="bg-gradient-to-r" />', design: allowed }).length, 0);
});
