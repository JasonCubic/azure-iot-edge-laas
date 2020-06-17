
const _ = require('lodash');
const { getPool } = require('./db.js');
const selectReaderByMac = require('./select-reader-by-mac.js');
const updateReaderName = require('./update-reader-name.js');
const insertReader = require('./insert-reader.js');
const selectRfidTagReads = require('./select-rfid-tag-reads.js');
const insertRfidTagRead = require('./insert-rfid-tag-read.js');
const updateRfidTagRead = require('./update-rfid-tag-read');
const store = require('../utilities/store.js');
const selectNewestEntryInLocationRules = require('./select-newest-entry-in-location-rules');
const selectLocationRules = require('./select-location-rules.js');
const parseJson = require('../utilities/parse-json.js');
const selectMarriageEavByEntity = require('./select-marriage-eav-by-entity.js');


async function upsertReader(readerObj) {
  const readerName = _.get(readerObj, 'reader_name', '');
  const macAddress = _.get(readerObj, 'mac_address', '');
  if (macAddress.length === 0) {
    console.log('ERROR, invalid mac address: ', readerObj);
    return -1;
  }
  let readerRecordSet;
  const pool = await getPool();
  try {
    readerRecordSet = await selectReaderByMac(pool, macAddress);
  } catch (err) {
    console.error('ERROR (getReaderByMac): ', err.message);
    console.error(err);
  }
  // console.log('readerRecordSet: ', readerRecordSet);
  if (readerRecordSet.length === 1) {
    const storedReaderName = _.get(readerRecordSet, '0.reader_name', '');
    if (readerName !== storedReaderName) {
      console.log(`updating reader with mac address ${macAddress} from reader name "${storedReaderName}" to "${readerName}"`);
      try {
        await updateReaderName(pool, readerObj);
      } catch (err) {
        console.error('ERROR (updateReaderName): ', err.message);
        console.error(err);
      }
    }
    return _.get(readerRecordSet, '0.rfid_reader_id', -1);
  }
  if (readerRecordSet.length > 1) {
    console.log('ERROR more than one active reader with MAC Address ', macAddress);
    console.log(`WARNING: no updates being done for readers with mac address "${macAddress}" due to error.`);
    return -1;
  }
  let insertReaderRecordSet;
  try {
    insertReaderRecordSet = await insertReader(pool, readerObj);
  } catch (err) {
    console.error('ERROR (insertReader): ', err.message);
    console.error(err);
  }
  return _.get(insertReaderRecordSet, '0.id', -1);
}


async function getExistingTagData(pool, tagReads) {
  return Promise.all(
    tagReads.map(async (tagRead) => {
      const { epc } = tagRead;
      try {
        const tagData = await selectRfidTagReads(pool, epc);
        return tagData;
      } catch (err) {
        console.error('ERROR (getExistingTagData): ', err.message);
        console.error(err);
        return {};
      }
    }),
  );
}

async function insertTags(pool, tagReads) {
  return Promise.all(
    tagReads.map(async (tagRead) => {
      try {
        const tagData = await insertRfidTagRead(pool, tagRead);
        return tagData;
      } catch (err) {
        console.error('ERROR (insertTag): ', err.message);
        console.error(err);
        return {};
      }
    }),
  );
}

async function updateTags(pool, tagReads) {
  return Promise.all(
    tagReads.map(async (tagRead) => {
      try {
        const tagData = await updateRfidTagRead(pool, tagRead);
        return tagData;
      } catch (err) {
        console.error('ERROR (updateTag): ', err.message);
        console.error(err);
        return {};
      }
    }),
  );
}

function transformLocationRules(rawLocationRules) {
  return rawLocationRules.map((row) => ({
    ...row,
    json_rules: parseJson(row.json_rules),
  }));
}

async function getLocationRules() {
  const pool = await getPool();
  const jsonRulesInStore = store.get('locationRules');
  const newestEntryInStore = store.get('newestEntry');
  const newestEntryInDb = _.toInteger(await selectNewestEntryInLocationRules(pool));
  if (!_.isNaN(newestEntryInDb) && newestEntryInStore === newestEntryInDb && jsonRulesInStore.length > 0) {
    return jsonRulesInStore.map((row) => row.json_rules);
  }
  console.log('refreshing location rules from database');
  const locationRulesInDb = transformLocationRules(await selectLocationRules(pool));
  store.set('locationRules', locationRulesInDb);
  const maxLastModifiedMsTimestamp = _.max(locationRulesInDb.map((row) => _.toInteger(row.last_modified_ms_timestamp)));
  store.set('newestEntry', maxLastModifiedMsTimestamp);
  return locationRulesInDb.map((row) => row.json_rules);
}

async function getCurrentTagData(tagReads) {
  const pool = await getPool();
  const currentTagData = await getExistingTagData(pool, tagReads);
  return currentTagData;
}

async function upsertTagReads(currentTagData, newTagData) {
  const pool = await getPool();
  const newTags = _.differenceBy(newTagData, currentTagData, 'epc');
  const insertNewTagsResults = await insertTags(pool, newTags);
  const existingTags = _.intersectionBy(newTagData, currentTagData, 'epc');
  const updateExistingTagsResults = await updateTags(pool, existingTags);
  return { upsertResults: insertNewTagsResults.concat(updateExistingTagsResults) };
}

async function getMarriagesByEpc(pool, epc) {
  try {
    return await selectMarriageEavByEntity(pool, epc);
  } catch (err) {
    console.log('ERROR: getMarriagesByEav selectMarriageEavByEntity: ', err.message, err);
    return err;
  }
}

async function getTagsEnrichedWithMarriages(tagReads) {
  const pool = await getPool();
  return Promise.all(
    tagReads.map(async (tagRead) => {
      try {
        const marriages = await getMarriagesByEpc(pool, tagRead.epc);
        return ({ ...tagRead, marriages });
      } catch (err) {
        console.error('ERROR (updateTag): ', err.message);
        console.error(err);
        return {};
      }
    }),
  );
}


module.exports = {
  upsertReader,
  upsertTagReads,
  getLocationRules,
  getCurrentTagData,
  getTagsEnrichedWithMarriages,
};
