const mssql = require('mssql');
const { get, toInteger } = require('lodash');

const config = {
  user: get(process, 'env.MSSQL_USERNAME', 'SA'),
  password: get(process, 'env.MSSQL_PASSWORD', ''),
  server: get(process, 'env.MSSQL_SERVER', ''),
  port: toInteger(get(process, 'env.MSSQL_PORT', 1433)),
  database: get(process, 'env.MSSQL_DATABASE', ''),
  trustServerCertificate: true,
  options: {
    // set enableArithAbort to true just to get the warning to go away
    enableArithAbort: true,
  },
};


let pool;

async function getPool() {
  if (!pool) {
    try {
      pool = await new mssql.ConnectionPool(config);
    } catch (err) {
      console.error('ERROR: creating new pool SQL error', err.message);
    }
  }
  if (!pool.pool || pool.pool.destroyed) {
    try {
      await pool.connect();
    } catch (err) {
      console.error('ERROR: connecting pool SQL error', err.message);
    }
  }
  return pool;
}

async function closePool() {
  return pool.close();
}

module.exports = { mssql, getPool, closePool };
