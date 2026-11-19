'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { isDesignChecked, findRawValues, checkDesignTokens } = require('../plugins/project-forge/lib/design');
const { normalizeConfig } = require('../plugins/project-forge/lib/config');
const webPreset = require('../plugins/project-forge/templates/presets/forge-config.web.json');

const { design } = normalizeConfig(webPreset);

test('isDesignChecked: UI files yes; tokens, tests, logic, other extensions no', () => {
  assert.equal(isDesignChecked('src/components/Card.tsx', design), true);
  assert.equal(isDesignChecked('src/ui/theme/tokens.ts', design), false);
  assert.equal(isDesignChecked('src/ui/theme/tokens.css', design), false);
  assert.equal(isDesignChecked('src/components/Card.test.tsx', design), false);
  assert.equal(isDesignChecked('src/features/cart/useCart.ts', design), false);
  assert.equal(isDesignChecked('src/components/data.json', design), false);
});

test('findRawValues catches hex, rgb/hsl and px sizes', () => {
  const src = [
    "const s = { color: '#ff0000', padding: '12px' };",
    'const t = { background: "rgba(0,0,0,0.5)" };',
    '<div className="bg-[#1a1a1a] p-[18px]" />',
  ].join('\n');
  const rules = findRawValues(src).map((v) => v.rule);
  assert.deepEqual(rules, ['hex-color', 'px-size', 'fn-color', 'hex-color', 'px-size']);
});

test('findRawValues allows 0px/1px, imports, comments, ids and forge-ignore', () => {
  const src = [
    "import logo from './logo.svg';",
    '// brand colour is #4f46e5 in tokens',
    "const border = '1px solid';",
    "const x = '0px';",
    "const anchor = href + '#section';",
    "const legacy = '#abcdef'; // forge-ignore",
    "const id = 'item-#12';",
  ].join('\n');
  assert.deepEqual(findRawValues(src), []);
});

test('findRawValues ignores numbers that are part of other words', () => {
  assert.deepEqual(findRawValues("const w = 'w-10px-ish'; const v = '1.5px';"), []);
});

test('checkDesignTokens returns messages with file and line', () => {
  const v = checkDesignTokens({ fileRel: 'src/ui/Button.tsx', source: "\nconst c = '#000';", design });
  assert.equal(v.length, 1);
  assert.match(v[0].message, /src\/ui\/Button\.tsx:2/);
});
