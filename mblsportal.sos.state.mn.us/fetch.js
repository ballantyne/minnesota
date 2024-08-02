const path = require('path');
const os = require('os');
const qs = require('querystring');

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
var applyOptions = construct(requireJSON(path.join(__dirname, 'defaults')));


var conf = {
  host: 'https://mblsportal.sos.state.mn.us',
  endpoint: '/Business/SearchDetails?filingGuid='
}



function fetch(query, config={}) {
  var endpoint = [conf.endpoint, query.id].join('');

  return new Promise(async(resolve, reject) => {
    config.signature = {function: 'fetch', url: endpoint};

    var cache = await prepare(config);
    var cached = config.cache && cache.missed == false;

    if (cached == true) {
      var response = JSON.parse(cache.data);
    } else {
     
      var options = applyOptions('default', 'get');
      options.path = endpoint;
      
      var response = await get(options, config).catch(console.log);

      if (config.cache && cache.missed) {
	await cache.write(JSON.stringify(response));
      }
    } 

    //console.log('fetch',response)

    var meta = cp({
      id: query.id,
      url: [conf.host, conf.endpoint, query.id].join('')
    });


    if (response.headers.location == '/Home/Error') {
       resolve({meta: meta, data: {error: 'Not Found'}});
    } else {

      var entity = await Parser.entity(response.body, config, meta).catch(console.log)

      resolve(entity);
    }
  });

}
module.exports = fetch;



