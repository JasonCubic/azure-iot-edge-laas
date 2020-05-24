const getIotClient = require('./iot/get-iot-client.js');
const handleIncomingMessage = require('./handle-incoming-message.js');

(async () => {
  console.log('my job aint a job, its a damn good time');
  // console.log('made it');

  const iotClient = await getIotClient();
  iotClient.on('error', (err) => {
    console.error('error seen by client: ', err.message);
  });
  iotClient.on('inputMessage', (inputName, msg) => {
    handleIncomingMessage(iotClient, inputName, msg);
  });
})();
