const parse = require('date-fns/parse');

function parseWeirdZebraTimestamp(weirdTimestamp) {
  // example timeStamp: '26/5/2020 22:55:28:788'
  // this zebra timestamp is bad.  why no iso 8601??
  // console.log('parsedTimestamp: ', parsedTimestamp);
  // console.log('parsedTimestamp.getTime(): ', parsedTimestamp.getTime());
  // console.log('new Date(parsedTimestamp.getTime()): ', new Date(parsedTimestamp.getTime()));
  // https://date-fns.org/v2.14.0/docs/parse
  return parse(weirdTimestamp, 'd/L/yyyy H:m:s:SSS', new Date());
}

module.exports = parseWeirdZebraTimestamp;
