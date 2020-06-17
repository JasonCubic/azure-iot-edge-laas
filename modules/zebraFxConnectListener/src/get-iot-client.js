const Protocol = require('azure-iot-device-mqtt').Mqtt;
var ModuleClient = require('azure-iot-device').ModuleClient;

let clientConnection = null;

function getIotClient() {
  return new Promise((resolve, reject) => {
    if (clientConnection && clientConnection.sendOutputEvent) {
      // console.log('using cached client');
      resolve(clientConnection);
      return;
    }
    ModuleClient.fromEnvironment(Protocol, (err, client) => {
      if (err) {
        reject(err);
        return;
      }
      clientConnection = client;
      clientConnection.on('error', (err) => {
        console.error('error seen by client: ', err.message);
      });
      resolve(clientConnection);
    });
  });
}


module.exports = getIotClient;
