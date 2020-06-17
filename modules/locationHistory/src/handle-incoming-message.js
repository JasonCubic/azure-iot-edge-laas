const parseJson = require('./utilities/parse-json.js');
const { addToHistory } = require('./mssql/interface.js');

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


async function handleIncomingMessage(iotClient, inputName, msg) {
  completeMessage(iotClient, msg)
    .then((response) => {
      console.log(`receiving message status: ${response.constructor.name}`);
    })
    .catch((error) => {
      console.log('message complete error: ', error.toString());
    });
  console.log('inputName: ', inputName);
  if (inputName === 'input1') {
    const message = msg.getBytes().toString('utf8');
    const messageJson = parseJson(message);
    if (!messageJson) {
      console.log('ERROR: invalid message received', message);
    }
    console.log('messageJson: ', JSON.stringify(messageJson, null, 2));
    const addToHistoryResults = await addToHistory(messageJson);
    console.log('addToHistoryResults: ', addToHistoryResults);
  }
}


module.exports = handleIncomingMessage;
