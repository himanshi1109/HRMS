const express = require('express');
const { sendMessage } = require('./chat.controller');
const { verifyToken } = require('../../middleware/auth');

const router = express.Router();

router.post('/message', verifyToken, sendMessage);

module.exports = router;
