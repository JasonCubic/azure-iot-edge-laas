var Transport = require('azure-iot-device-mqtt').Mqtt;

const azureIotDevice = require('azure-iot-device');

// var Client = require('azure-iot-device').ModuleClient;
// var Message = require('azure-iot-device').Message;


https://docs.microsoft.com/en-us/javascript/api/azure-iot-device/?view=azure-node-latest


let clientConnection = null;

function getIotClient() {
  return new Promise((resolve, reject) => {
    if (clientConnection && clientConnection.sendOutputEvent) {
      // console.log('using cached client');
      resolve(clientConnection);
      return;
    }
    azureIotDevice.ModuleClient.fromEnvironment(TransportProtocol, (err, client) => {
      if (err) {
        reject(err);
        return;
      }
      clientConnection = client;
      // clientConnection.on('error', (err) => {
      //   console.error('error seen by client: ', err.message);
      // });
      resolve(clientConnection);
    });
  });
}


module.exports = getIotClient;


// azureIotDevice.ModuleClient.fromEnvironment(Transport, function (err, client) {
//   if (err) {
//     throw err;
//   } else {
//     client.on('error', function (err) {
//       throw err;
//     });

//     // connect to the Edge instance
//     client.open(function (err) {
//       if (err) {
//         throw err;
//       } else {
//         console.log('IoT Hub module client initialized');

//         // Act on input messages to the module.
//         client.on('inputMessage', function (inputName, msg) {
//           pipeMessage(client, inputName, msg);
//         });
//       }
//     });
//   }
// });

// This function just pipes the messages without any change.
function pipeMessage(client, inputName, msg) {
  client.complete(msg, printResultFor('Receiving message'));
  if (inputName === 'input1') {
    var message = msg.getBytes().toString('utf8');
    // TODO:
      // check DB and see if this move is new for this tagId
        // if this is new:
          // store this entry into the last known location DB
          // send out an enriched message saying the station this antenna corresponds with has a move event
    console.log('message: ', message);
    // const testMessage = message.test = 'made it';
    if (message) {
      var outputMsg = new Message(message);
      client.sendOutputEvent('output1', outputMsg, printResultFor('Sending received message'));
    }
  }
}

// Helper function to print results in the console
function printResultFor(op) {
  return function printResult(err, res) {
    if (err) {
      console.log(op + ' error: ' + err.toString());
    }
    if (res) {
      console.log(op + ' status: ' + res.constructor.name);
    }
  };
}
