
function deglyph(text) {
  return text.replace('&#39;', "'").replace('&ndash;', '-').replace('&amp;', '&').replace('&nbsp;', ' ')
}
module.exports.deglyph = deglyph;

function tidy(html, options={}) {
  if (options.split == undefined) {
    options.split = false
  }


  var array = html.split('').reduce((array, char) => {
    if (char == '<') {
      array.push('\n')
    }

    array.push(char);
    
    if (char == '>') {
      array.push('\n')
    }
    
    return array;
  }, [])

  // filter out extras and trim;
  array = array.join('').split('\n').filter((line) => { 
    return line != ''; 
  }).map((line) => { 
    return line.trim(); 
  })
  
  if (options.split) {
    return array;
  } else {
    return array.join('\n');
  }
}

module.exports.tidy = tidy;







function zip(array1, array2) {
  return array1.reduce((obj, key, index) => {
    obj[array1[index]] = array2[index];
    return obj;
  }, {});
}
module.exports.zip = zip;




function logger(options={}) {
  if (options.ignore == undefined) {
    options.ignore = []
  }

  if (options.verbose && options.ignore.indexOf(options.state) == -1) {
    console.log('.......................................................')
    console.log(options.index, options.state, options.line);

    if (options.modulations.length > 0) {
      console.log('.......................................................')
      console.log('modulations');
      console.log('.......................................................')
      console.log(options.modulations);
    }
  }
}
module.exports.logger = logger;
