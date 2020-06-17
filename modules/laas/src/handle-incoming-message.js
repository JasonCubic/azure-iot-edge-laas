const _ = require('lodash');
const parseJson = require('./utilities/parse-json.js');
const {
  upsertReader,
  upsertTagReads,
  getLocationRules,
  getCurrentTagData,
  getTagsEnrichedWithMarriages,
} = require('./mssql/interface.js');
const getRuleResults = require('./location-rules/get-rule-results.js');
const sendIotOutputEvent = require('./iot/send-iot-output-event.js');
const parseWeirdZebraTimestamp = require('./utilities/parse-weird-zebra-timestamp.js');

function completeMessage(iotClient, msg) {
  return new Promise((resolve, reject) => {
    iotClient.complete(msg, (err, res) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(res);
    });
  });
}


// {
//   "reader_name":"FX9600F05EC9 FX9600 RFID Reader",
//   "mac_address":"84:24:8D:F0:5E:C9",
//   "tag_reads":[
//     {
//       "epc":"000000000000000000003442",
//       "pc":"3000",
//       "antennaPort":"3",
//       "peakRssi":"-72",
//       "seenCount":"1",
//       "timeStamp":"23/5/2020 0:37:12:943",
//       "phase":"0.00",
//       "channelIndex":"24",
//       "isHeartBeat":"false"
//     }
//   ]
// }


function filterOutHeartbeats(rawTagReads) {
  return rawTagReads.filter((read) => {
    if (_.get(read, 'isHeartBeat', false) === 'true') {
      return false;
    }
    return true;
  });
}

function getMessageJson(rawMsg) {
  const message = rawMsg.getBytes().toString('utf8');
  let messageJson = parseJson(message);
  if (!messageJson) {
    console.log('ERROR: malformed json message received: ', message);
    messageJson = {};
  }
  return ({ ...messageJson, tag_reads: filterOutHeartbeats(_.get(messageJson, 'tag_reads', [])) });
}


function getMsTimestamp(tagRead) {
  const timeStamp = _.get(tagRead, 'timeStamp', '');
  const parsedTime = timeStamp.length > 0 ? parseWeirdZebraTimestamp(timeStamp) : new Date();
  return parsedTime.getTime();
}

function getPreLocationRuleParseEnrichedTagData(tagReads, readerObj) {
  return tagReads.map((tagRead) => ({ ...readerObj, ...tagRead, ms_timestamp: getMsTimestamp(tagRead) }));
}

function filterOutTagsWithNoLocationChange(tags) {
  return tags.filter((tag) => tag.isLocationChange === true);
}

function getPreviousTagFromCollection(epc, previousTagCollection) {
  let previousTag = _.find(previousTagCollection, { epc });
  if (_.isUndefined(previousTag)) {
    previousTag = {};
  }
  previousTag.json_data = parseJson(_.get(previousTag, 'json_data', '{}'));
  if (!previousTag.json_data) {
    previousTag.json_data = {};
  }
  return previousTag;
}

function getIsLocationChangeEnrichedTags(previousTagCollection, newTagCollection) {
  return newTagCollection.map((tag) => {
    const currentTagEpc = _.get(tag, 'epc', '');
    const currentTagLocation = _.get(tag, 'location', []);
    const previousTag = getPreviousTagFromCollection(currentTagEpc, previousTagCollection);
    const previousTagLocation = _.get(previousTag, 'json_data.location', []);
    const isLocationChange = !_.isEqual(currentTagLocation, previousTagLocation);
    if (isLocationChange) {
      return ({ ...tag, last_location_change_ms_timestamp: _.get(tag, 'ms_timestamp', Date.now()), isLocationChange });
    }
    return ({ ...tag, last_location_change_ms_timestamp: _.get(previousTag, 'json_data.last_location_change_ms_timestamp', 0), isLocationChange });
  });
}

async function upsertRfidReaderInDb(readerObj) {
  try {
    return await upsertReader(readerObj);
  } catch (upsertReaderError) {
    console.log('upsertReader ERROR: ', upsertReaderError.message, upsertReaderError);
    return null;
  }
}

async function handleUpsertTagReadsInDb(currentTagData, isLocationChangeEnrichedTags) {
  try {
    return await upsertTagReads(currentTagData, isLocationChangeEnrichedTags);
  } catch (upsertTagReadsError) {
    console.log('upsertTagReads ERROR: ', upsertTagReadsError.message, upsertTagReadsError);
    return null;
  }
}


async function handleIncomingMessage(iotClient, inputName, msg) {
  // this module only listens to input1
  if (inputName !== 'input1') {
    return;
  }

  // send a message completed response on IoT
  completeMessage(iotClient, msg)
    .then((response) => {
      console.log(`receiving message status: ${response.constructor.name}`);
    })
    .catch((error) => {
      console.log('message complete error: ', error.toString());
    });


  // step 1. Get the tag reads that are valid (no heartbeats or malformed json)
  const messageJson = getMessageJson(msg);
  if (messageJson.tag_reads.length === 0) {
    console.log('no valid tag reads found, not logging a location change');
    return;
  }


  // step 2. update the reader table in the database (so we have a record of all rfid readers in the system)
  const readerObj = _.omit(messageJson, ['tag_reads']);
  upsertRfidReaderInDb(readerObj); // do not need to await this


  // step 3. apply the location rules to enrich the tag reads with location data
  const tagCollection = getPreLocationRuleParseEnrichedTagData(messageJson.tag_reads, readerObj);
  const locationRules = await getLocationRules();
  const locationRuleEnrichedTags = getRuleResults(tagCollection, locationRules);


  // step 4 enrich the tags with the isLocationChange key (just checking if they changed location)
  const currentTagData = await getCurrentTagData(locationRuleEnrichedTags);
  const locationEnrichedTags = getIsLocationChangeEnrichedTags(currentTagData, locationRuleEnrichedTags);
  // console.log('locationEnrichedTags: ', JSON.stringify(locationEnrichedTags, null, 2));


  // step 5. upsert the enriched tag reads into the database.
  handleUpsertTagReadsInDb(currentTagData, locationEnrichedTags); // do not need to await this


  // step 6. we don't want to do anything else with tag reads that have no location changes
  const tagsWithLocationChange = filterOutTagsWithNoLocationChange(locationEnrichedTags);
  if (tagsWithLocationChange.length === 0) {
    console.log('no tag reads with location changes to push upstream');
    return;
  }


  // step 7. add enriched marriage info to tagsWithLocationChange
  const tagsWithMarriages = await getTagsEnrichedWithMarriages(tagsWithLocationChange);


  // step 8. send out the fully enriched location changes
  sendIotOutputEvent(iotClient, 'output1', tagsWithMarriages);
}


module.exports = handleIncomingMessage;
