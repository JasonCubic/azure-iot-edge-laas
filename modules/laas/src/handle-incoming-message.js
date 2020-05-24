const _ = require('lodash');
const upsertReader = require('./mssql/upsert-reader.js');

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

async function getReaderId(message) {
  const readerObj = {
    readerName: _.get(message, 'reader_name', ''),
    macAddress: _.get(message, 'mac_address', ''),
  };
  if (readerObj.macAddress.length === 0) {
    console.log('ERROR, invalid mac address: ', readerObj.macAddress);
    return -1;
  }
  const rfidReaderId = await upsertReader(readerObj);
  return rfidReaderId;
}

// {"reader_name":"FX9600F05EC9 FX9600 RFID Reader","mac_address":"84:24:8D:F0:5E:C9","tag_reads":[{"epc":"000000000000000000003442","pc":"3000","antennaPort":"3","peakRssi":"-72","seenCount":"1","timeStamp":"23/5/2020 0:37:12:943","phase":"0.00","channelIndex":"24","isHeartBeat":"false"}]}


function parseJson(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return false;
  }
}


async function handleIncomingMessage(iotClient, inputName, msg) {
  completeMessage(iotClient, msg)
    .then((response) => {
      console.log('receiving message status: ' + response.constructor.name);
    })
    .catch((error) => {
      console.log('message complete error: ', error.toString());
    });
    if (inputName === 'input1') {
      const message = msg.getBytes().toString('utf8');
      const messageJson = parseJson(message);
      if (!messageJson) {
        console.log("ERROR: invalid message received", message);
      }
      const readerId = await getReaderId(messageJson);
      console.log('readerId: ', readerId);

      // TODO:
        // check DB and see if this move is new for this tagId
          // if this is new:
            // upsert this entry into the last known location DB
            // send out an enriched message saying the station this antenna corresponds with has a move event
            //    for history server
      console.log('message: ', message);
      // const testMessage = message.test = 'made it';
      // if (message) {
      //   var outputMsg = new Message(message);
      //   client.sendOutputEvent('output1', outputMsg, printResultFor('Sending received message'));
      // }
    }



}


module.exports = handleIncomingMessage;
