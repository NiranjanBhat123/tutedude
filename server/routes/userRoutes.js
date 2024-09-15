const express = require('express');
const { registerUser, loginUser,getDashboardData,updateUserProfile,searchUsers,getTopUsers ,sendFriendRequest, handleFriendRequest, getUser,logoutUser} = require('../controllers/userController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/dashboard',getDashboardData);
router.put('/update/:userId',updateUserProfile);
router.get('/top',getTopUsers)
router.get('/search',searchUsers);
router.post('/send-friend-request',sendFriendRequest);
router.post('/handle-friend-request',handleFriendRequest);
router.get('/getuser/:username',getUser)
router.post('/logout',logoutUser)



module.exports = router;