'use strict';

const cart = require('..');
const assert = require('assert').strict;

assert.strictEqual(cart(), 'Hello from cart');
console.info('cart tests passed');
