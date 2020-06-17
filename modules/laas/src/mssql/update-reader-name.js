const _ = require('lodash');
const { mssql } = require('./db.js');


async function updateReaderName(pool, readerObj) {
  console.log('upsertReader updateReaderName: ', readerObj); // should be rare
  // const { readerName, macAddress } = readerObj;
  const readerName = _.get(readerObj, 'reader_name', '');
  const macAddress = _.get(readerObj, 'mac_address', '');
  const request = pool.request();
  const updateQueryString = `UPDATE [rtls].[dbo].[rfid_reader] SET
      [reader_name] = @READER_NAME,
      [last_modified_ms_timestamp] = @LAST_MODIFIED_MS_TIMESTAMP
    WHERE [is_active] = 1
      AND [mac_address] = @MAC_ADDRESS;`;
  request.input('READER_NAME', mssql.VarChar, readerName);
  request.input('MAC_ADDRESS', mssql.VarChar, macAddress);
  request.input('LAST_MODIFIED_MS_TIMESTAMP', mssql.BigInt, Date.now());
  const result = await request.query(updateQueryString);
  const recordSet = _.get(result, 'recordset', []);
  return recordSet;
}

module.exports = updateReaderName;
