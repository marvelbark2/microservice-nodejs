'use strict';

const customer = require('..');
const assert = require('assert').strict;

assert.strictEqual(customer(), 'Hello from customer');
console.info('customer tests passed');
