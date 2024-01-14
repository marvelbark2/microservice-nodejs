'use strict';

const inventory = require('..');
const assert = require('assert').strict;

assert.strictEqual(inventory(), 'Hello from inventory');
console.info('inventory tests passed');
