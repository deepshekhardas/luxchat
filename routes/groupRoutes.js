const express = require('express');
const { createGroup, getMyGroups, addMember } = require('../controllers/groupController');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

router.use(protect);

router.post('/', validate(schemas.createGroup), createGroup);
router.get('/', getMyGroups);
router.post('/:groupId/members', addMember);

module.exports = router;
