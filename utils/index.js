
function deglyph(text) {
  return text.replace('&#39;', "'").replace('&ndash;', '-').replace('&amp;', '&').replace('&nbsp;', ' ')
}
module.exports.deglyph = deglyph;

function tidy(html) {
  return html.split('').reduce((array, char) => {
    if (char == '<') {
      array.push('\n')
    }

    array.push(char);
    
    if (char == '>') {
      array.push('\n')
    }
    
    return array;
  }, []).join('').split('\n').filter((line) => { 
    return line != ''; 
  }).map((line) => { return line.trim(); }).join('\n');

}

module.exports.tidy = tidy;







function zip(array1, array2) {
  return array1.reduce((obj, key, index) => {
    obj[array1[index]] = array2[index];
    return obj;
  }, {});
}
module.exports.zip = zip;
