const path = require('path');

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
  get,
  logger
} = require('great-lakes');

const Entity = require(path.join(__dirname, '..', '..', 'entity'));

var fields = requireJSON(path.join(__dirname, 'fields'));
var ignoranceRules = requireJSON(path.join(__dirname, 'ignore'));
var ignorance = ignorant(ignoranceRules);
var transitions = requireJSON(path.join(__dirname, 'transitions'));
var modulator = sway(transitions);

function liens(html, config, meta={}) {
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
	    case 'no_results':
	      var matched = line.match(/<div class='alert alert-error'>(?<error>.+)<\/div>/)
	      Object.assign(meta, {message: modulation.trigger.value});

	      break;
	    case 'current':
	      var matched = line.match(/(?<month>\d+)\/(?<day>\d\d)\/(?<year>\d\d\d\d)\s(?<time>.+)\s(?<daytime>\w\w)/)
	      meta.as_of = Date.parse([
		matched.groups.year,
		'/',
		matched.groups.month,
		'/',
		matched.groups.day,
		' ',
		matched.groups.time,
		' ',
		matched.groups.daytime
	      ].join(''));
	      meta.as_of = new Date(meta.as_of); 
	     
	      break;
	  
	    default:
	      console.log('unused',modulation);
	  }
	}

      }
      return obj;


    }, []);

    if (config.meta) {
      meta.version.data = fingerprint('list', rows);
    }

    // wrapping in a class that allows me to 
    // specify the function to use to open and parse the url.
    // rows.list = rows.list.map((item) => { return new Entity(item); });

    if (config.meta) {
      meta.requested_at = new Date();

      results = {meta: meta, data: rows};
    } else {
      results = rows
    }

    resolve(results);
  });

}


module.exports = liens;
