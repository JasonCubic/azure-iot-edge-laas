const _ = require('lodash');
const { mssql } = require('./db.js');

async function selectMarriageEavByEntity(pool, entity) {
  const request = pool.request();
  const selectQueryString = `SELECT [marriage_eav_id]
      ,[entity]
      ,[marriage_eav].[marriage_attribute_id]
      ,[attribute]
      ,[value]
      ,[marriage_eav].[last_modified_by]
      ,[marriage_eav].[last_modified_ms_timestamp]
    FROM [rtls].[dbo].[marriage_eav]
    JOIN [rtls].[dbo].[marriage_attributes]
      ON ([rtls].[dbo].[marriage_eav].[marriage_attribute_id] = [rtls].[dbo].[marriage_attributes].[marriage_attribute_id])
    WHERE [entity] = @ENTITY
    AND [rtls].[dbo].[marriage_eav].[is_active] = 1`;
  request.input('ENTITY', mssql.VarChar, entity);
  const result = await request.query(selectQueryString);
  const recordset = _.get(result, 'recordset', []);
  return recordset;
}

module.exports = selectMarriageEavByEntity;
