const _ = require('lodash');
const { mssql, getPool } = require('./db.js');

async function upsertTagReads(tagRead) {
  const pool = await getPool();


}

module.exports = upsertTagReads;
