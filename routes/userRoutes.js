// const express = require('express');
// const { userSignup, userLogin } = require('../controllers/userAuthController');

// const router = express.Router();

// router.post('/register', userSignup);
// router.post('/signin', userLogin);

// module.exports = router;

const express = require('express');
const { userSignup, userLogin, forgotPassword, resetPassword , googleAuth } = require('../controllers/userAuthController');

const router = express.Router();

router.post('/register', userSignup);
router.post('/signin', userLogin);
router.post("/google-auth", googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
