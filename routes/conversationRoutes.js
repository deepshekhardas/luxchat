const express = require('express');
const { getConversations, createConversation } = require('../controllers/conversationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getConversations);
router.post('/', createConversation);

module.exports = router;
