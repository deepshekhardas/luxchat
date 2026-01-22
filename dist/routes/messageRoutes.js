const express = require('express');
const { sendMessage, getMessages } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const router = express.Router();
router.use(protect);
router.post('/', validate(schemas.sendMessage), sendMessage);
router.get('/:targetId', getMessages); // targetId can be convId or groupId
module.exports = router;
