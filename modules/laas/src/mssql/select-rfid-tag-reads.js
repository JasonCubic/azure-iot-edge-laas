const _ = require('lodash');
const { mssql } = require('./db.js');

async function selectRfidTagReads(pool, epc) {
  const request = pool.request();
  const selectQueryString = `SELECT TOP (1000)
      [rfid_tagReads_id],
      [mac_address],
      [epc],
      [antenna_port],
      [ms_timestamp],
      [json_data],
      [last_modified_ms_timestamp],
      [is_active]
    FROM [rtls].[dbo].[rfid_tag_reads]
    WHERE [epc] = @EPC
    AND [is_active] = 1`;
  request.input('EPC', mssql.VarChar, epc);
  const result = await request.query(selectQueryString);
  const recordSet = _.get(result, 'recordset', []);
  if (recordSet.length === 0) {
    console.log('first read of tag with epc: ', epc);
  }
  if (recordSet.length > 1) {
    console.log('ERROR: more than one rfid tag with epc: ', epc);
    console.log('WARNING: not updating this rfid tag any further until epc is unique');
    return {};
  }
  return _.get(recordSet, '0', {});
}


module.exports = selectRfidTagReads;
