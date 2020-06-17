const _ = require('lodash');
const { mssql } = require('./db.js');
// const parseWeirdZebraTimestamp = require('../utilities/parse-weird-zebra-timestamp.js');

async function updateRfidTagRead(pool, tagRead) {
  const epc = _.get(tagRead, 'epc', '');
  const macAddress = _.get(tagRead, 'mac_address', '');
  let antennaPort = _.toInteger(_.get(tagRead, 'antennaPort', 0));
  if (_.isNaN(antennaPort)) {
    console.log('ERROR: invalid antennaPort value for tag read (using antennaPort 0): ', tagRead);
    antennaPort = 0;
  }
  // const timeStamp = _.get(tagRead, 'timeStamp', '');
  // const parsedTimestamp = timeStamp.length > 0 ? parseWeirdZebraTimestamp(timeStamp) : new Date();
  const msTimestamp = _.toInteger(_.get(tagRead, 'ms_timestamp', 0));
  const request = pool.request();
  const updateQueryString = `UPDATE [rtls].[dbo].[rfid_tag_reads] SET
      [mac_address] = @MAC_ADDRESS,
      [antenna_port] = @ANTENNA_PORT,
      [ms_timestamp] = @MS_TIMESTAMP,
      [json_data] = @JSON_DATA,
      [last_modified_ms_timestamp] = @LAST_MODIFIED_MS_TIMESTAMP
      OUTPUT INSERTED.rfid_tagReads_id
    WHERE [is_active] = 1
      AND [epc] = @EPC;`;
  // request.input('RFID_READER_ID', mssql.Int, parseInt(readerId, 10));
  request.input('MAC_ADDRESS', mssql.VarChar, macAddress);
  request.input('EPC', mssql.VarChar, epc);
  request.input('ANTENNA_PORT', mssql.Int, antennaPort);
  request.input('MS_TIMESTAMP', mssql.BigInt, msTimestamp);
  request.input('JSON_DATA', mssql.NVarChar, JSON.stringify(tagRead));
  request.input('LAST_MODIFIED_MS_TIMESTAMP', mssql.BigInt, Date.now());
  const result = await request.query(updateQueryString);
  const recordSet = _.get(result, 'recordset', []);
  return recordSet;
}

module.exports = updateRfidTagRead;
