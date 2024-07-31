process.env.NODE_ENV = 'test';

var path        = require('path');
var assert      = require('assert');

var fs = require('fs');

const {
  tidy
} = require(path.join(__dirname, '..', 'utils'));


describe('utils', () => {
  describe('tidy', () => {

    it('should create an array for parsing', (done) => {
      var html = '<div class="row"><div class="col-md-6"><dl><dt>Business Type</dt><dd>Limited Liability Company (Domestic)</dd></dl></div><div class="col-md-6"><dl><dt>MN Statute</dt><dd>322C</dd></dl></div></div><div class="row"><div class="col-md-6"><dl><dt>File Number</dt><dd>4419236-2</dd></dl></div><div class="col-md-6"><dl><dt>Home Jurisdiction</dt><dd>Minnesota</dd></dl></div></div><div class="row"><div class="col-md-6"><dl><dt>Filing Date</dt><dd>08/22/2011</dd></dl></div><div class="col-md-6"><dl><dt>Status</dt><dd>Inactive</dd></dl></div></div><div class="row"><div class="col-md-6"><dl><dt>Renewal Due Date</dt><dd>12/31/2022</dd></dl></div><div class="col-md-6"><dl><dt>Registered Office Address</dt><dd><address>1779 Hampshire Ave<br />St Paul, MN 55116<br />USA</address></dd></dl></div></div><div class="row"><div class="col-md-6"><dl><dt>Registered Agent(s)</dt><dd>Ellen Hart-Shegos</dd></dl></div><div class="col-md-6"><dl><dt>Manager</dt><dd>Ellen Hart-Shegos</dd><dd><address>1779 Hampshire Ave<br />St Paul, MN 55116<br />USA</address></dd></dl></div></div><div class="row"><div class="col-md-6"><dl><dt>Principal Executive Office Address</dt><dd><address>1779 Hampshire Ave<br />St Paul, MN 55116<br />USA</address></dd></dl></div></div>'
      
      var parts = tidy(html);
      //console.log(parts);
      done();
    });


  });
});
