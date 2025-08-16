const express = require('express');
const router = express.Router();
const {
  createUserHandler,
  getUsersHandler,
  deleteUserHandler,
  updateUserHandler,
} = require('../controllers/userController');

router.post('/create_user', createUserHandler);
router.post('/get_users', getUsersHandler);
router.post('/delete_user', deleteUserHandler);
router.post('/update_user', updateUserHandler);

module.exports = router;
