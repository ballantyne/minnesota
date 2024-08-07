const path = require('path');                                    

const { 
  createHmac 
} = require('node:crypto');

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
  logger, 
  deglyph,
  restack
} = require('great-lakes');


var fields         = requireJSON(path.join(__dirname, 'fields'));
var ignoranceRules = requireJSON(path.join(__dirname, 'ignore'));
var ignorance      = ignorant(ignoranceRules);
var transitions    = requireJSON(path.join(__dirname, 'transitions'));
var modulator      = sway(transitions);

function addError(obj, message) {
  obj['error'] = message;
  return obj
}

var regexes = {
  with_name: /(?<name>.+)\n(?<street>.+)\n(?<city>.+),\s(?<state>\w+)\s(?<zip>\d+)\n(?<country>.+)/,
  without_name: /(?<street>.+)\n(?<city>.+),\s(?<state>\w+)\s(?<zip>.+)\n(?<country>.+)/
}

function entity(html, config, meta={}) {

  var results;
  var history = { filings: [], renewals: [] };

  if (config.meta) {
    Object.assign(meta, {version: {cache: fingerprint('entity', html)}});
  }

  var context = {
    state: 'scan', 
    trim: true, 
    parser: 'none', 
    headers: []
  };

  //config.verbose = true;

  return new Promise((resolve) => {
    var lines = html.split('\n');
    var entity = {};
    var index = 0;

    function reduction(obj, raw, index) {
      var line = raw.trim();

      if (ignorance(line)) {
        if (context.trim) {
	  line = line.replace('<td>', '').replace('</td>', '').trim();
        } else {
          var parts = restack(line.trim(), {split: true});
	  
	  if (parts.length > 1) {
            lines = parts.concat(lines);
	    return obj;
	  }
	}
        
	var modulations = modulator(context.state, line);
      
	logger({
	  line: line, 
	  index: index, 
	  modulations: modulations, 
	  state: context.state, 
	  verbose: config.verbose, 
	  ignore: []
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
	    case 'gather:name':
              var matched = line.match(/<span class=\"navbar-brand\">(?<name>.+)<\/span>/)
	      Object.assign(obj, matched.groups);
	      obj.name = deglyph(obj.name).trim();
	      
	      break;
	    case 'error:not_found':
	      obj = {error: "Not Found"};
	      meta.status = 404;

	      break;
	    
	    case 'map:row':
              lines = restack(line, {split: true}).concat(lines);
	      
	      break;
		 
            case 'other_info:headers:gather':
              if (obj.next_key == undefined) {
                obj.next_key = [];
	      }
	      obj.next_key.push(line);
       
	      break;
            
	    case 'other_info:headers:gather:end':
	      context.headers.push(obj.next_key.join(' '));
	      obj.next_key = [];
	      
	      break;

	    case 'other_info:collection': 
	      delete obj.next_key;

	      break;
            
	    case 'other_info:gather':
	      var key = fields[context.headers[0]];
	      if (obj[key] == undefined) {
	        obj[key] = [];
	      }
	      obj[key].push(deglyph(line));
	      
	      break;
            
	    case 'other_info:gather:end':
 	      var key = fields[context.headers[0]];
	      obj[key] = obj[key].join(' ').trim();

	      context.headers.shift();       
	      
	      break;

	    case 'history:initialize:headers':
              context.headers = [];
	      break;

	    case 'history:headers:gather':
              var matched = line.match(/<th class.+>(?<key>[a-zA-Z0-9_ ]*)<\/th>/);
	      if (matched != null && matched.groups.key != '') {
	        context.headers.push(matched.groups.key);
	      }
	      
	      break;

	    case 'history:new:object':
              obj.filing = {};

	      break;

	    case 'history:next_value:push':
	      obj.next_value.push(line);
	      
	      break;

	    case 'history:initialize:next_value':
	      if (obj.next_value == undefined) {
                obj.next_value = [];
	      }
	      
	      break;

	    case 'history:cycle:next_value':
	      var fk = Object.keys(obj.filing); 
	      var value = obj.next_value.join(' ');
	      if (value != "") {
		obj.filing[fields[context.headers[fk.length]]] = obj.next_value.join(' ');
	      }
	      obj.next_value = [];
	      
	      break;

	    case 'history:push:current': 
	      history[context.history].push(cp(obj.filing));
	      obj.filing = {}

	      break;

	    case 'history:set': 
	      delete obj.filing;
              delete obj.next_value;
	      obj[context.history] = history[context.history];
              
	      break;

	    case 'row:initialize:next_key':
	      obj.next_key = line;
	      obj.next_value = [];
	      
	      break;
	
	    case 'business_master_id:set':
	      var matched = line.match(/<input id=\"BusinessMasterId\" name=\"BusinessMasterId\" type=\"hidden\" value=\"(?<id>.+)\" \/>/)
	      obj.id = matched.groups.id;
	      
	      break;

	    case 'row:next_value:push':
	      if (line.trim().length > 0) {
	        obj.next_value.push(line);
	      }
	      
	      break;

	    case 'row:data:set':
	      var key = fields[obj.next_key];
	      obj[key] = ['agents'].indexOf(key) > -1 ? obj.next_value : obj.next_value.join('').trim();
	      
	      delete obj.next_key;
	      delete obj.next_value;
	      
	      break;

	    case 'row:address:set':
	      obj.next_value = obj.next_value.filter((part) => { return part != ''});

              var nextKey = fields[obj.next_key];

	      // parameterize if original doesn't match
	      if (nextKey == undefined) {
		nextKey = obj.next_key.split(' ').join('_').toLowerCase();
	      }


	      var nextValue = deglyph(obj.next_value.join('\n'));
	      var hasName = regexes.with_name.test(nextValue);

	      if (hasName) {
		var matched = nextValue.match(regexes.with_name)
	
		var name = matched.groups.name
		var address = cp(matched.groups);
		delete address.name
                
		obj[nextKey] = {name: name, address: address};
	      } else {
		var matched = nextValue.match(regexes.without_name)
		obj[nextKey] = cp(matched.groups);
	      }

	      delete obj.next_key;
	      delete obj.next_value;
	      
	      break;
	  }
	}
      }

      return obj;

    };

    while(lines.length > 0) {
      var line = lines.shift().trim();
      if (line.length > 0) {
	entity = reduction(entity, line, index);
      }
      index = index + 1;
    }

    entity = ['markholder', 'applicant'].reduce((obj, name) => {
      if (entity[name] != undefined) {
        var matched = entity[name+"_address"].match(/(?<street>.+),\s(?<city>.+),\s(?<state>\w\w)\s(?<zip>.+)/)
	entity[name] = {name: entity[name], address: cp(matched.groups)};
      }
      delete entity[name+'_address'];

      return obj;
    }, entity);


    if (config.meta) {
      meta.version.data = fingerprint('entity', entity);
      meta.requested_at = new Date();


      results = {meta: meta, data: entity};
    } else {
      results = entity;
    }

    resolve(results);
  });

}

module.exports = entity;


