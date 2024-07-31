#!/usr/bin/env node

const path = require('path');
const repl = require('node:repl');
const portal = require(path.join(__dirname, '..', 'mblsportal.sos.state.mn.us'));

const r = repl.start('> ');


Object.defineProperty(r.context, 'sos', {
  configurable: false,
  enumerable: true,
  value: portal,
}); 


