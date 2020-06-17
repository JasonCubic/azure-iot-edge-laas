const { getPool } = require('./db.js');
const insertHistoryTagRead = require('./insert-history-tag-read.js');

async function insertHistoryTagReads(pool, tagReads) {
  return Promise.all(
    tagReads.map(async (tagRead) => {
      try {
        const insertHistoryTagReadResults = await insertHistoryTagRead(pool, tagRead);
        return insertHistoryTagReadResults;
      } catch (err) {
        console.error('ERROR (insertTag): ', err.message);
        console.error(err);
        return {};
      }
    }),
  );
}

async function addToHistory(tagReads) {
  const pool = await getPool();
  const insertToHistoryResults = await insertHistoryTagReads(pool, tagReads);
  // console.log('insertToHistoryResults: ', insertToHistoryResults);
  return insertToHistoryResults;
}

module.exports = { addToHistory };
