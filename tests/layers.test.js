'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { layerOf, extractImports, resolveSpecifier, checkLayerImports } = require('../plugins/project-forge/lib/layers');
const { normalizeConfig } = require('../plugins/project-forge/lib/config');
const webPreset = require('../plugins/project-forge/templates/presets/forge-config.web.json');

const config = normalizeConfig(webPreset);

test('layerOf picks the longest matching prefix', () => {
  const layers = { ui: ['src'], logic: ['src/features'] };
  assert.equal(layerOf('src/features/cart/useCart.ts', layers), 'logic');
  assert.equal(layerOf('src/app/page.tsx', layers), 'ui');
  assert.equal(layerOf('scripts/build.js', layers), null);
});

test('layerOf does not match partial folder names', () => {
  assert.equal(layerOf('src/apiary/x.ts', { network: ['src/api'] }), null);
});

test('extractImports finds import, export-from, require and dynamic import', () => {
  const src = [
    "import React from 'react';",
    "import { a } from '@/services/http';",
    "import './styles.css';",
    "export { b } from '../data/repo';",
    "const c = require('./c');",
    "const d = await import('@/db/client');",
  ].join('\n');
  assert.deepEqual(
    extractImports(src).map((i) => i.spec),
    ['react', '@/services/http', './styles.css', '../data/repo', './c', '@/db/client'],
  );
});

test('extractImports skips lines marked forge-ignore', () => {
  assert.equal(extractImports("import x from '@/services/x'; // forge-ignore").length, 0);
});

test('resolveSpecifier handles relative paths, aliases and packages', () => {
  assert.equal(resolveSpecifier('../services/http', 'src/app/page.tsx', config.aliases), 'src/services/http');
  assert.equal(resolveSpecifier('@/db/client', 'src/app/page.tsx', config.aliases), 'src/db/client');
  assert.equal(resolveSpecifier('zod', 'src/app/page.tsx', config.aliases), null);
});

test('checkLayerImports flags ui importing network', () => {
  const v = checkLayerImports({
    fileRel: 'src/app/page.tsx',
    source: "import { getUser } from '@/services/users';",
    config,
  });
  assert.equal(v.length, 1);
  assert.equal(v[0].from, 'ui');
  assert.equal(v[0].to, 'network');
  assert.equal(v[0].line, 1);
});

test('checkLayerImports allows ui → logic and logic → network', () => {
  assert.equal(
    checkLayerImports({ fileRel: 'src/app/page.tsx', source: "import { useUser } from '@/features/user/useUser';", config }).length,
    0,
  );
  assert.equal(
    checkLayerImports({ fileRel: 'src/features/user/useUser.ts', source: "import { getUser } from '@/services/users';", config }).length,
    0,
  );
});

test('checkLayerImports flags logic importing ui', () => {
  const v = checkLayerImports({
    fileRel: 'src/features/user/useUser.ts',
    source: "import { Button } from '../../ui/Button';",
    config,
  });
  assert.equal(v.length, 1);
  assert.equal(v[0].to, 'ui');
});

test('checkLayerImports ignores non-code files and files outside layers', () => {
  assert.equal(checkLayerImports({ fileRel: 'src/app/page.md', source: "import x from '@/services/x'", config }).length, 0);
  assert.equal(checkLayerImports({ fileRel: 'scripts/seed.ts', source: "import x from '@/services/x'", config }).length, 0);
});
