const TransportProtocol = require('azure-iot-device-mqtt').Mqtt;
const ModuleClient = require('azure-iot-device').ModuleClient;

let clientConnection = null;

function getIotClient() {
  return new Promise((resolve, reject) => {
    if (clientConnection && clientConnection.sendOutputEvent) {
      // console.log('using cached client');
      resolve(clientConnection);
      return;
    }
    ModuleClient.fromEnvironment(TransportProtocol, (err, client) => {
      if (err) {
        reject(err);
        return;
      }
      clientConnection = client;
      resolve(clientConnection);
    });
  });
}


module.exports = getIotClient;
