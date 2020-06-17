const _ = require('lodash');

async function selectLocationRules(pool) {
  const request = pool.request();
  const selectQueryString = `SELECT [location_rules_id]
      ,[json_rules]
      ,[last_modified_ms_timestamp]
    FROM [rtls].[dbo].[location_rules]
    WHERE [is_active] = 1`;
  const result = await request.query(selectQueryString);
  const recordset = _.get(result, 'recordset', []);
  return recordset;
}

module.exports = selectLocationRules;
