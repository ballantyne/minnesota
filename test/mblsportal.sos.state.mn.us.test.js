process.env.NODE_ENV = 'test';

var path   = require('path');
var assert = require('assert');

var fs = require('fs');

var mblsportal = require(path.join(__dirname, '..', 'mblsportal.sos.state.mn.us'));
var Parser = require(path.join(__dirname, '..', 'mblsportal.sos.state.mn.us', 'parsers'));


describe('Minnesota', () => {
  describe('Services', () => {
    describe('mblsportal.sos.state.mn.us', () => {
      describe('entities', () => {
	
	it('ibm', (done) => {
	  var options = {cache: true, meta: true};
	  mblsportal.entities('ibm', options).then((list) => {
	    assert.equal(list.data[0].name, 'IBM')
	    done();
	  }).catch(console.log);
	});

	it('ibm, fetch from list item', (done) => {
	  var options = {cache: true, meta: true};
	  mblsportal.entities('ibm', options).then((list) => {
	    assert.equal(list.data[0].name, 'IBM')
	    list.data[0].fetch(options).then((entity) => {
	      assert.equal(entity.meta.url, 'https://mblsportal.sos.state.mn.us/Business/SearchDetails?filingGuid=1fbde1fd-a0d4-e011-a886-001ec94ffe7f');
	      assert.equal(entity.meta.id, '1fbde1fd-a0d4-e011-a886-001ec94ffe7f');
	      assert.equal(entity.data.type, 'Trademark');

	      done();
	    }).catch(console.log);
	  }).catch(console.log);
	}).timeout(5000);

      });

      describe('number', () => {

	it('ibm?', (done) => {
	  var options = {cache: true, meta: true};
	  mblsportal.number('1471418800022', options).then((list) => {
	    assert.equal(list.data.name, 'IBM LLC')
	    done();
	  }).catch(console.log);
	});

	it('hotpot', (done) => {
	  var options = {cache: true, meta: true};
	  mblsportal.number('1357938300026', options).then((entity) => {
	    // any good chinese food recommendations in the twin cities?
	    // console.log(entity.data);

	    assert.equal(entity.data.name, "HOT POT CITY")
	    assert.equal(entity.data.applicant.name, "HOT POT CITY LLC")
	    assert.equal(entity.data.applicant.address.street, "12160 TECHNOLOGY DR")

	    done();
	  }).catch(console.log);
	});


	it('apple', (done) => {
	  var options = {cache: true, meta: true};
	  mblsportal.number('20509', options).then((entity) => {
	    //console.log(entity.data);

	    assert.equal(entity.data.name, "APPLE INC.")
	    assert.equal(entity.data.ceo.name, "Timothy Cook")  
	    assert.equal(entity.data.registered_office.street, "1010 Dale St N")

	    done();
	  }).catch(console.log);
	});


	it("teal's", (done) => {
	  var options = {cache: true, meta: true};
	  mblsportal.number('938197700044', options).then((entity) => {
	    assert.equal(entity.data.name, "Teal's Market")

	    done();
	  }).catch(console.log);
	});


	it("hum's", (done) => {
	  var options = {cache: true, meta: true};
	  mblsportal.number('899984500029', options).then((entity) => {
	    //console.log(entity.data);
	    assert.equal(entity.data.name, "Hum's Liquor")

	    assert.equal(entity.data.filings.length, 1);
	    assert.equal(entity.data.renewals.length, 7);

	    done();
	  }).catch(console.log);
	});


	it("mra", (done) => {
	  var options = {cache: true, meta: true};
	  mblsportal.number('1270235600022', options).then((entity) => {
	    //console.log(entity);

	    assert.equal(entity.data.name, "MARKET RESEARCH ASSOCIATES")
	    assert.equal(entity.data.type, "Assumed Name")

	    done();
	  }).catch(console.log);
	}).timeout(5000);
      

      });

      describe('liens', () => {
	it("liens", (done) => {
	  // I couldn't find a business with a lien.

	  var options = {cache: true, meta: true};
	  mblsportal.liens('1270235600022', options).then((entity) => {
	    //console.log(entity);
	    assert.equal(entity.data.length, 0)
	    done();
	  }).catch(console.log);
	}).timeout(5000);
      });

    });
  });
});

