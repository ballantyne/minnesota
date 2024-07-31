const path = require('path');
const fetch = require(path.join(__dirname, 'fetch'));

class Entity {
  constructor(data) {
    Object.assign(this, data);
  }

  path() {
    return ['/Business/SearchDetails?filingGuid=', self.id].join('');
  }

  url() {
    if (this.url != undefined) {
      console.log('url', this.url);
      return this.url;
    } else {
      console.log('no url');
      return ['https://mblsportal.sos.state.mn.us', this.path()].join('');
    }
  }

  fetch(config) {
    var self = this;
    return new Promise((resolve, reject) => {
      fetch({id: self.id}, config).then((data) => {
	
	// i need to make these objects merge and the keys need to match between parsers.

	var entity = new Entity(data);
	resolve(data);
      }).catch(console.log)
    })
  }

}

module.exports = Entity;
