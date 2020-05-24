const _ = require('lodash');
const { mssql, getPool } = require('./db.js');

async function getReaderByMac(pool, macAddress) {
  const request = pool.request();
  const selectQueryString = `SELECT TOP (1000)
    [rfid_reader_id],
    [reader_name],
    [mac_address],
    [last_modified_unix_timestamp],
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

async function insertReader(pool, readerObj) {
  const { readerName, macAddress } = readerObj;
  const request = pool.request();
  const insertQueryString = `INSERT INTO [rtls].[dbo].[rfid_reader] (
    [reader_name],
    [mac_address],
    [last_modified_unix_timestamp]
    ) VALUES (
    @READER_NAME,
    @MAC_ADDRESS,
    @LAST_MODIFIED_UNIX_TIMESTAMP
  ); SELECT SCOPE_IDENTITY() AS id;`;
  request.input('READER_NAME', mssql.VarChar, readerName);
  request.input('MAC_ADDRESS', mssql.VarChar, macAddress);
  request.input('LAST_MODIFIED_UNIX_TIMESTAMP', mssql.BigInt, Date.now());
  const result = await request.query(insertQueryString);
  // console.log('result: ', result);
  const recordSet = _.get(result, 'recordset', []);
  return recordSet;
}


async function upsertReader(readerObj) {
  // console.log('readerObj: ', readerObj);
  const { readerName, macAddress } = readerObj;
  let readerRecordSet;
  const pool = await getPool();
  // console.log('pool: ', pool);
  try {
    readerRecordSet = await getReaderByMac(pool, macAddress);
  } catch (err) {
    console.error('getReaderByMac SQL error', err);
  }
  console.log('readerRecordSet: ', readerRecordSet);
  if (readerRecordSet.length === 1) {
    // TODO: check if readerName needs to be updated and do so as needed
    return _.get(readerRecordSet, '0.rfid_reader_id', -1);
  }
  if (readerRecordSet.length > 1) {
    console.log('ERROR more than one active reader with MAC Address ', macAddress);
    // return readerRecordSet[0];
    // return _.get(readerRecordSet, '0.rfid_reader_id', -1);
    return -1;

  }
  let insertReaderRecordSet;
  try {
    insertReaderRecordSet = await insertReader(pool, readerObj);
  } catch (err) {
    console.error('insertReader SQL error', err);
  }
  return insertReaderRecordSet;
}

module.exports = upsertReader;
