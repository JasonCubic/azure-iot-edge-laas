const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const webserverWorker = require('./web-server-worker.js');

(() => {
  if (cluster.isMaster) {
    console.log(`found ${numCPUs} CPU's`);
    // Fork workers.
    for (let i = 0; i < numCPUs; i += 1) {
      cluster.fork();
    }
    cluster.on('exit', (worker, code /* , signal */) => {
      console.log(`worker ${worker.process.pid} died`);
      if (code === 126) {
        console.log('ERROR: unable to execute this command at this time.');
        console.log(`Is the port ${process.env.ZEBRA_FX_CONNECT_SERVER_PORT || '(env ZEBRA_FX_CONNECT_SERVER_PORT not set)'} already in use?`);
      } else {
        cluster.fork();
      }
    });
  } else {
    webserverWorker(cluster.worker);
  }
})();
