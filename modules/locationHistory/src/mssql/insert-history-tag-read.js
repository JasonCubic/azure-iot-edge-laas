const _ = require('lodash');
const { mssql } = require('./db.js');

async function insertHistoryTagRead(pool, tagRead) {
  const epc = _.get(tagRead, 'epc', '');
  let msTimestamp = _.toInteger(_.get(tagRead, 'ms_timestamp', 0));
  if (_.isNaN(msTimestamp)) {
    console.log('ERROR: invalid ms_timestamp value for tag read (using ms_timestamp 0): ', tagRead);
    msTimestamp = 0;
  }
  const request = pool.request();
  const insertQueryString = `INSERT INTO [location_history].[dbo].[tag_read_history] (
      [epc],
      [ms_timestamp],
      [json_data],
      [last_modified_ms_timestamp]
    ) VALUES (
      @EPC,
      @MS_TIMESTAMP,
      @JSON_DATA,
      @LAST_MODIFIED_MS_TIMESTAMP
    ); SELECT SCOPE_IDENTITY() AS id;`;
  request.input('EPC', mssql.VarChar, epc);
  request.input('MS_TIMESTAMP', mssql.BigInt, msTimestamp);
  request.input('JSON_DATA', mssql.NVarChar, JSON.stringify(tagRead));
  request.input('LAST_MODIFIED_MS_TIMESTAMP', mssql.BigInt, Date.now());
  const result = await request.query(insertQueryString);
  const recordSet = _.get(result, 'recordset', []);
  return recordSet;
}

module.exports = insertHistoryTagRead;
