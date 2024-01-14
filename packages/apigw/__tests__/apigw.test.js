'use strict';

const apigw = require('..');
const assert = require('assert').strict;

assert.strictEqual(apigw(), 'Hello from apigw');
console.info('apigw tests passed');
