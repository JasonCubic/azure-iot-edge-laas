const express = require('express');

const webRootExpressRouter = require('./web-root-express-router.js');
const zebraExpressRouter = require('./zebra-express-router.js');

function webserverWorker() {
  const host = process.env.ZEBRA_FX_CONNECT_SERVER_HOST || "0.0.0.0";
  const port = parseInt(process.env.ZEBRA_FX_CONNECT_SERVER_PORT || "8087", 10);
  const app = express();
  app.use('/', webRootExpressRouter);
  app.use('/zebra', zebraExpressRouter);
  app
    .listen(port, host, () => {
      console.log(`Express server worker started, pid ${process.pid}, port ${port}, ${app.get('env')} mode`);
    })
    .once('error', (err) => {
      console.log('err: ', err);
      process.exit(126);
    });
}

module.exports = webserverWorker;
