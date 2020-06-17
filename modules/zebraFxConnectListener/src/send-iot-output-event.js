const Message = require('azure-iot-device').Message;


// https://docs.microsoft.com/en-us/javascript/api/azure-iot-device/moduleclient?view=azure-node-latest#sendoutputevent-string--message-
function sendIotOutputEvent(client, outputName, rawOutputMsg = {}) {
  return new Promise((resolve, reject) => {
    if (!client.sendOutputEvent) {
      reject(new Error('invalid azure-iot-device ModuleClient, the method sendOutputEvent not found'));
      return;
    }
    if (!rawOutputMsg || typeof outputName !== 'string') {
      reject(new Error('sendIotOutputEvent outputName must be of type string'));
      return;
    }
    if (!rawOutputMsg || typeof rawOutputMsg !== 'object') {
      reject(new Error('sendIotOutputEvent outputMessage must be of type object'));
      return;
    }
    const outputMsg = new Message(JSON.stringify(rawOutputMsg));
    client.sendOutputEvent(outputName, outputMsg, (err, res) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(res);
    });
  });
}

module.exports = sendIotOutputEvent;
