const _ = require('lodash');
const { mssql } = require('./db.js');

async function selectReaderByMac(pool, macAddress) {
  const request = pool.request();
  const selectQueryString = `SELECT TOP (1000)
    [rfid_reader_id],
    [reader_name],
    [mac_address],
    [last_modified_ms_timestamp],
    [is_active]
    FROM [rtls].[dbo].[rfid_reader]
    WHERE [mac_address] = @MAC_ADDRESS
    AND [is_active] = 1`;
  request.input('MAC_ADDRESS', mssql.VarChar, macAddress);
  const result = await request.query(selectQueryString);
  // console.log('result: ', result);
  const recordSet = _.get(result, 'recordset', []);
  return recordSet;
}

module.exports = selectReaderByMac;
