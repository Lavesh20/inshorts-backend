// const express = require('express');
// const { userSignup, userLogin } = require('../controllers/userAuthController');

// const router = express.Router();

// router.post('/register', userSignup);
// router.post('/signin', userLogin);

// module.exports = router;

const express = require('express');
const { userSignup, userLogin, forgotPassword, resetPassword } = require('../controllers/userAuthController');

const router = express.Router();

router.post('/register', userSignup);
router.post('/signin', userLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
