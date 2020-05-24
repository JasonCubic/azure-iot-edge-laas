const _ = require('lodash');
const differenceInMinutes = require('date-fns/differenceInMinutes');
const sleep = require('./utilities/sleep');
const { getPool } = require('./mssql/db.js');

async function waitForMssqlToBeUp() {
  let connected = false;
  let timeout = false;
  const startTime = new Date();
  while (!connected && !timeout) {
    const pool = await getPool();
    if (!pool || !pool.pool || pool.pool.destroyed) {
      await sleep(5000);
    } else {
      connected = true;
      console.log('Mssql is up');
    }
    timeout = differenceInMinutes(startTime, new Date()) > 5;
    if (timeout && connected === false) {
      log.error('ERROR: timeout.  LAAS container did not come up.  unable to connect to mssql.');
      process.exit();
    }
  }
}

module.exports = waitForMssqlToBeUp;
