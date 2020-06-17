// const _ = require('lodash');
const differenceInMinutes = require('date-fns/differenceInMinutes');
const sleep = require('./sleep.js');
const { getPool } = require('../mssql/db.js');

async function waitForMssqlToBeUp() {
  let connected = false;
  let timeout = false;
  const startTime = new Date();
  while (!connected && !timeout) {
    // eslint-disable-next-line no-await-in-loop
    const pool = await getPool();
    if (!pool || !pool.pool || pool.pool.destroyed) {
      // eslint-disable-next-line no-await-in-loop
      await sleep(5000);
    } else {
      connected = true;
      console.log('mssql is up');
    }
    timeout = differenceInMinutes(startTime, new Date()) > 5;
    if (timeout && connected === false) {
      console.log('ERROR: timeout.  LAAS container did not come up.  unable to connect to mssql.');
      process.exit();
    }
  }
}

module.exports = waitForMssqlToBeUp;
