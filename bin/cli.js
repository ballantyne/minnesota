#!/usr/bin/env node


var path = require('path');
var cli = require(path.join(__dirname, '..', 'utils', 'cli'));

cli(path.join(__dirname, '..', 'mblsportal.sos.state.mn.us'), ['entities', 'number', 'liens']).then(() => {
  process.exit();
})

