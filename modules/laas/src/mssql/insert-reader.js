const _ = require('lodash');
const { mssql } = require('./db.js');

async function insertReader(pool, readerObj) {
  console.log('upsertReader insertReader: ', readerObj); // should be rare
  // const { readerName, macAddress } = readerObj;
  const readerName = _.get(readerObj, 'reader_name', '');
  const macAddress = _.get(readerObj, 'mac_address', '');
  const request = pool.request();
  const insertQueryString = `INSERT INTO [rtls].[dbo].[rfid_reader] (
    [reader_name],
    [mac_address],
    [last_modified_ms_timestamp]
    ) VALUES (
    @READER_NAME,
    @MAC_ADDRESS,
    @LAST_MODIFIED_MS_TIMESTAMP
  ); SELECT SCOPE_IDENTITY() AS id;`;
  request.input('READER_NAME', mssql.VarChar, readerName);
  request.input('MAC_ADDRESS', mssql.VarChar, macAddress);
  request.input('LAST_MODIFIED_MS_TIMESTAMP', mssql.BigInt, Date.now());
  const result = await request.query(insertQueryString);
  // console.log('insertReader result: ', result);
  const recordSet = _.get(result, 'recordset', []);
  return recordSet;
}

module.exports = insertReader;
