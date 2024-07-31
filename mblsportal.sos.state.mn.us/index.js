const path = require('path');
const os   = require('os');
const qs   = require('querystring');

const {
  get,
  post,
  cp,
  construct,
  prepare,
  requireJSON
} = require('great-lakes');

var Parser = require(path.join(__dirname, 'parsers'));
var Entity = require(path.join(__dirname, 'entity'));


var constructQuery = construct(requireJSON(path.join(__dirname, 'queries')));
var applyOptions   = construct(requireJSON(path.join(__dirname, 'defaults')));









function search(query, config={}) {
  return new Promise(async(resolve) => {
    if (typeof query == 'string') {
      query = constructQuery('default', {BusinessName: query});
    }

    var options = applyOptions('default', 'get');

    options.path = ['/Business/BusinessSearch', qs.stringify(query)].join('?');
    config.signature = {options: options, function: 'search', query: query};

    var cache = await prepare(config);
    var cached = config.cache && cache.missed == false;

    if (cached == true) {
      var response = JSON.parse(cache.data);
    } else {
      var response = await get(options, config).catch(console.log);
      if (config.cache && cache.missed) {
	await cache.write(JSON.stringify(response));
      }
    } 

    var list = await Parser.search(response.body, config, {query: query}).catch(console.log);

    if (config.meta && config.response) {
      list.response = response
    }

    resolve(list);
  })
}
module.exports.search = search;









function number(query, config={}) {
  var initial = cp(config)
  return new Promise((resolve) => {
    query = constructQuery('default', {FileNumber: query});

    search(query, {meta: false, cache: initial.cache}).then((searchResults) => {
      var entity = new Entity(searchResults[0]);
      entity.fetch(initial).then((completeEntity) => {
        resolve(completeEntity);
      })
    })
  });
}
module.exports.number = number;











function entities(query, config={}) {
  return search(query, config);
}
module.exports.entities = entities;










// i can't find an example where there is a lien.  
// So I just made it detect if there isn't and as of what time.

function liens(query, config={}) {
  return new Promise(async(resolve, reject) => {
    if (typeof query == 'string') {
      query = constructQuery('ucc', {FileNumber: query})
    }
    
    config.signature = {function: 'liens', query: query};

    var cache = await prepare(config);
    var cached = config.cache && cache.missed == false;

    if (cached == true) {
      var response = JSON.parse(cache.data);
    } else {
      var options = applyOptions('default', 'get');
      var endpoint = ['/Secured/SearchResults', qs.stringify(query)].join('?')
      options.path = endpoint;

      var response = await get(options, config).catch(console.log);

      if (config.cache && cache.missed) {
	await cache.write(JSON.stringify(response));
      }
    } 

    var list = await Parser.liens(response.body, config, {query: query})

    resolve(list);
  });

}
module.exports.liens = liens;









