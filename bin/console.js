#!/usr/bin/env node

const path = require('path');
const repl = require('node:repl');
const portal = require(path.join(__dirname, '..', 'mblsportal.sos.state.mn.us'));
const Entity = require(path.join(__dirname, '..', 'mblsportal.sos.state.mn.us', 'entity'));
const fetch = require(path.join(__dirname, '..', 'mblsportal.sos.state.mn.us', 'fetch'));

const r = repl.start('> ');


Object.defineProperty(r.context, 'sos', {
  configurable: false,
  enumerable: true,
  value: portal
}); 

Object.defineProperty(r.context, 'Entity', {
  configurable: false,
  enumerable: true,
  value: Entity
}); 

Object.defineProperty(r.context, 'fetch', {
  configurable: false,
  enumerable: true,
  value: fetch
}); 


