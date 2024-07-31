# minnesota

Yet another installment of the scraping extravaganza.  It seemed like people were requesting Minnesota.  So I gave it a try.  Seems to mostly work, but I think there might be more edge cases for various reasons.

If Minnesota wants their name back, I am happy to hand it over.  If people have suggestions about other sources of data in Minnesota that might be interesting, let me know.

This one has a repl and I also added a console because it is nice to have code preloaded sometimes.

```javascript

  var mblsportal = require('minnesota/mblsportal.sos.state.mn.us');
  mblsportal.entities('lake').then((landolakes) => { console.log(landolakes); })

```


