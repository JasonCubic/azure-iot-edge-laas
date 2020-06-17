const _ = require('lodash');

async function selectNewestEntryInLocationRules(pool) {
  const request = pool.request();
  const result = await request.query("SELECT MAX([last_modified_ms_timestamp]) as 'newest_entry' FROM [rtls].[dbo].[location_rules]");
  // console.log('selectNewestEntryInLocationRules result: ', result);
  return _.get(result, 'recordset.0.newest_entry', Date.now());
}

module.exports = selectNewestEntryInLocationRules;
