#!/usr/bin/env node


var path = require('path');
var CarrierPigeon = require('carrier-pigeon');
var mblsportal = require(path.join(__dirname, '..', 'mblsportal.sos.state.mn.us'));

var {
  isJSON
} = require("great-lakes");


var commands = ['entities', 'number', 'liens'];

const commandParser = new CarrierPigeon({strict: false});
commandParser.commands(...commands);

var getCommand = commandParser.parse(process.argv);
var command = getCommand.command;

const parser = new CarrierPigeon({strict: false});
parser.commands(...commands);
parser.option('verbose', {default: false})
parser.option('query');
parser.option('pretty', {default: false})


switch(command) {
  case 'entities':
    parser.option('cache', {default: true});
    parser.option('ttl', {default: 300000});
    parser.option('meta', {default: true});
    parser.option('response', {default: false});
    
    break;
  default:

    parser.option('cache', {default: true});
    parser.option('ttl', {default: 60000});
    parser.option('meta', {default: true});
    parser.option('response', {default: false});
 }

var options = parser.parse(process.argv);

if (isJSON(options.query)) {
  options.query = JSON.parse(options.query);
}

if (command != undefined) {
  mblsportal[command](options.query, options).then((json) => {
    console.log(JSON.stringify(json, null, (options.pretty ? 2 : 0)));
  })
} else {
  console.log(JSON.stringify({error: 'command unknown', interface: "command line", argv: process.argv}))
}
