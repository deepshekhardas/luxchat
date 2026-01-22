const express = require('express');
const { searchUsers, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const router = express.Router();
router.use(protect); // All routes below are protected
router.get('/', searchUsers); // ?search=keyword
router.put('/profile', updateUserProfile);
module.exports = router;
