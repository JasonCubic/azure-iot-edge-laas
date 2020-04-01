const Protocol = require('azure-iot-device-mqtt').Mqtt;
var ModuleClient = require('azure-iot-device').ModuleClient;
var Message = require('azure-iot-device').Message;

ModuleClient.fromEnvironment(Protocol, async (err, client) => {
  if (err) {
    console.log('error:' + err);
  } else {
    console.log('got client');
    client.on('error', function (err) {
      console.error(err.message);
    });
    await rfidReadSimulate(client);
  }
});

async function rfidReadSimulate(client) {
  while (true) {
    const tagId = randHex(32);
    const antennaCount = 4; // how many antenna this reader has
    for (let j = 1; j <= antennaCount; j += 1) {
      const numberInBurst = getRandomInt(5, 10); // How many messages to send for this RFID read
      const delayBetweenStations = getRandomInt(7, 14); // How many seconds to wait to change to the next antenna
      for (let x = 0; x < numberInBurst; x++) {
        const outputMsg = new Message(JSON.stringify({
          reader: 1,
          antenna: j,
          tagId,
          signalStrength: getRandomInt(-90, -40),
        }));
        await sendMessage(client, outputMsg);
        if (x < numberInBurst - 1) {
          // 1 second between messages because driver on the reader will be debounced to 1 second
          await sleep(1000);
        }
      }
      await sleep(delayBetweenStations * 1000);
    }
  }
}

async function sendMessage(client, outputMsg) {
  try {
    const response = await promiseSendOutputEvent(client, 'output1', outputMsg);
    // console.log('response: ', JSON.stringify(response, null, 2));
    console.log('status: ' + response.constructor.name);
  } catch(err) {
    console.log('error: ' + err.toString());
  }
}

// https://codepen.io/code_monk/pen/FvpfI
function randHex(len) {
  const maxlen = 8;
  const min = Math.pow(16,Math.min(len,maxlen)-1);
  const max = Math.pow(16,Math.min(len,maxlen)) - 1;
  const n = Math.floor(Math.random() * (max-min+1)) + min;
  let r = n.toString(16);
  while ( r.length < len ) {
    r = r + randHex(len - maxlen);
  }
  return r;
};

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}


// https://docs.microsoft.com/en-us/javascript/api/azure-iot-device/moduleclient?view=azure-node-latest#sendoutputevent-string--message-
function promiseSendOutputEvent(client, outputName, outputMsg) {
  return new Promise((resolve, reject) => {
    client.sendOutputEvent(outputName, outputMsg, (err, res) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(res);
    });
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
