const express = require('express');
const packageJson = require('../package');
const getIotClient = require('./get-iot-client');
const sendIotOutputEvent = require('./send-iot-output-event');


function handleItWorks(req, res) {
  res.status(200).send('It Works!');
}


function handleVersion(req, res) {
  res.status(200).send(`zebraFxConnectListener v${packageJson.version} - node ${process.version}`);
}


// http://youHostName:8087/zebra/test
async function handleSendTestMessage(req, res) {
  const testMessage = {
    reader_name: 'IoT Edge Zebra Listener Test Message',
    mac_address: 'NA',
    tag_reads: [
      {
        epc: '********',
        pc: '0',
        antennaPort: '0',
        peakRssi: '0',
        seenCount: '0',
        timeStamp: new Date(),
        phase: '0',
        channelIndex: '0',
        isHeartBeat: 'true'
      }
    ]
  };
  const iotClient = await getIotClient();
  const sendMessageResults = await sendIotOutputEvent(iotClient, 'output1', testMessage);
  res.status(200).json({ testMessage, sendMessageResults });
}


// {
//   reader_name: 'FX9600F05EC9 FX9600 RFID Reader',
//   tag_reads: '84:24:8D:F0:5E:C9',
//   tag_reads:
//    [
//      {
//        epc: '000000000000000001238197',
//        pc: '3000',
//        antennaPort: '3',
//        peakRssi: '-63',
//        seenCount: '3',
//        timeStamp: '21/5/2020 16:5:1:525',
//        phase: '0.00',
//        channelIndex: '35'
//      }
//    ]
// }
async function handleApi(req, res) {
  const startTime = new Date().getTime();
  const validationErrors = [];
  const postBody = req.body || {};
  if (!postBody) {
    validationErrors.push('no post body found');
    return;
  }
  if (!postBody.reader_name) {
    validationErrors.push('no reader_name found in post body');
    return;
  }
  if (!postBody.mac_address) {
    validationErrors.push('ERROR: no mac_address found in post body');
    return;
  }
  if (!postBody.tag_reads) {
    validationErrors.push('ERROR: no tag_reads found in post body');
    return;
  }
  if (validationErrors.length === 0) {
    const iotClient = await getIotClient();
    const sendMessageResults = await sendIotOutputEvent(iotClient, 'output1', postBody);
    const AmountOfTimeTheQueryTook = new Date().getTime() - startTime;
    console.log('Message Sent: ', JSON.stringify({ sendMessageResults, AmountOfTimeTheQueryTook: `${AmountOfTimeTheQueryTook / 1000.0}s` }));
  } else {
    console.log('ERRORS: ', errors);
    console.log('postBody: ', postBody);
  }
  res.status(200).json({ errors: validationErrors });
}


// https://expressjs.com/en/guide/routing.html
const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: false }));


router.get('/', handleItWorks);
router.get('/version', handleVersion);
router.get('/test', handleSendTestMessage);
router.post('/api', handleApi);

module.exports = router;
