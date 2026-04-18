const express = require('express');
const router = express.Router();
const { test } = require('./controller');

router.get('/', test);

module.exports = router;