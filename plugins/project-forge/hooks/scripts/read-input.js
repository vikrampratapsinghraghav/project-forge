'use strict';

const fs = require('node:fs');

/** Hook input arrives as one JSON object on stdin. Returns {} when empty or invalid. */
function readHookInput() {
  let text = '';
  try {
    text = fs.readFileSync(0, 'utf8');
  } catch {
    return {};
  }
  if (!text.trim()) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

module.exports = { readHookInput };
