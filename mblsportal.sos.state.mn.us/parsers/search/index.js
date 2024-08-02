
const path = require('path');
const { createHmac } = require('node:crypto');

const {
  sway,
  alphabetize,
  extract,
  fingerprint,
  ignorant,
  cp,
  merge,
  requireJSON,
  construct,
  get
} = require('great-lakes');

const {
  logger
} = require(path.join(__dirname, '..', '..', '..', 'utils'));

const Entity = require(path.join(__dirname, '..', '..', 'entity'));

var fields = requireJSON(path.join(__dirname, 'fields'));
var ignoranceRules = requireJSON(path.join(__dirname, 'ignore'));
var ignorance = ignorant(ignoranceRules);
var transitions = requireJSON(path.join(__dirname, 'transitions'));
var modulator = sway(transitions);


function search(html, config, meta={}) {
  var results;

  if (config.meta) {
    Object.assign(meta, {version: {cache: fingerprint('list', html)}});
  }

  var context = {state: 'scan', parser: 'none', headers: []};

  //config.verbose = true;

  return new Promise((resolve) => {
    var rows = html.split("\n").reduce((obj, raw, index) => {

      var line = raw.trim();

      if (ignorance(line)) {
        line = line.replace('<td>', '').replace('</td>', '').replace("</span>", "").trim();

        var modulations = modulator(context.state, line);

	logger({
	  line:line, 
	  index: index, 
	  modulations: modulations, 
	  state: context.state, 
	  verbose: config.verbose, 
	  ignore: ['scan']
	});

        var changes = modulations.filter((modulation) => {
          return Object.keys(modulation).indexOf('sets') > -1
        });

        var actions = modulations.filter((modulation) => {
          return Object.keys(modulation).indexOf('action') > -1
        });

        while(changes.length > 0) {
          var change = changes.shift();
          Object.assign(context, cp(change.sets));
	}

	while(actions.length > 0) {
	  var modulation = actions.shift();

	  switch(modulation.action) {
	    case 'new':
	      if (Object.keys(obj.current).length > 0) {
                obj.list.push(cp(obj.current));
	      }
	      obj.current = {};
	    break;
	  
            
	    case 'gather:link': 
              var matched = line.match(/.+filingGuid=(?<id>.+)\">Details<\/a>/)
	      var url = [
		'https://mblsportal.sos.state.mn.us/Business/SearchDetails?filingGuid=', 
		matched.groups.id
	      ].join('');

	      Object.assign(obj.current, {id: matched.groups.id, url: url});

	    break;
	    
	    case 'gather:name':
              var matched = line.match(/<strong>(?<name>.+)<\/strong>/)
	      Object.assign(obj.current, matched.groups);

	      break;
	    case 'next:key': 
              var matched = line.match(/<span class=\"text-muted\">(?<next_key>.+):/)
	      context.headers.push(matched.groups.next_key);
	      if (matched.groups.next_key == 'Name Type') {
                context.state = 'collect:values';
	      }

	      break;
	    case 'next:value':
	      var key = context.headers.shift();
              var matched = line.match(/<span>(?<value>.+)/)
	      obj.current[fields[key]] = matched.groups.value;
	      if (context.headers.length == 0) {
                context.state = 'collect';
              }
	      
	      break;
	    default:
	      console.log('unused',modulation);
	  }
	}

      }
      return obj;


    }, {list: [], current: {}});

    if (config.meta) {
      meta.version.data = fingerprint('list', rows.list);
    }

    // wrapping in a class that allows me to 
    // specify the function to use to open and parse the url.
    rows.list = rows.list.map((item) => { return new Entity(item); });

    if (config.meta) {
      meta.requested_at = new Date();

      results = {meta: meta, data: rows.list};
    } else {
      results = rows.list
    }

    resolve(results);
  });

}


module.exports = search;
