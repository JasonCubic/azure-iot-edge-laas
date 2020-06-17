const getIotClient = require('./iot/get-iot-client.js');
const handleIncomingMessage = require('./handle-incoming-message.js');
const waitForMssqlToBeUp = require('./utilities/wait-for-mssql-to-be-up.js');

(async () => {
  await waitForMssqlToBeUp();
  const iotClient = await getIotClient();
  iotClient.on('error', (err) => {
    console.error('error seen by client: ', err.message);
  });
  iotClient.on('inputMessage', (inputName, msg) => {
    handleIncomingMessage(iotClient, inputName, msg);
  });
})();
