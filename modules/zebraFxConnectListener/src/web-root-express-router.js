const express = require('express');
const packageJson = require('../package');

function handleItWorks(req, res) {
  res.status(200).send('It Works!');
}

function handleVersion(req, res) {
  res.status(200).send(`zebraFxConnectListener v${packageJson.version} - node ${process.version}`);
}


// https://expressjs.com/en/guide/routing.html
const router = express.Router();
// router.use(express.json());
// router.use(express.urlencoded({ extended: false }));

router.get('/', handleItWorks);
router.get('/version', handleVersion);

module.exports = router;
