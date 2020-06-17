const _ = require('lodash');

const storeShelf = {
  newestEntry: 0,
  locationRules: [],
};

module.exports.get = (path) => _.get(storeShelf, path, '');
module.exports.getAll = () => storeShelf;
module.exports.set = (path, value) => _.set(storeShelf, path, value);
