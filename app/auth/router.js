const express = require('express');
const router = express.Router();
const { register, root, getMerkleProof, login } = require('./controller');

router.post('/register', register);
router.get('/root', root);
router.get('/proof/:index', getMerkleProof);
router.post('/login', login);

module.exports = router;