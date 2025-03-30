

// 2. Then update your authentication controller to handle password hashing directly
// authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/email');

// Helper function to hash passwords consistently
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// User Signup - now with direct password hashing
const userSignup = async (req, res) => {
  try {
    const { fullName, email, password, agreeToTerms } = req.body;

    if (!fullName || !email || !password || agreeToTerms === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Ensure email is unique
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Enforce strong password rules
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: 'Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character.'
      });
    }

    // Hash password directly here
    const hashedPassword = await hashPassword(password);

    // Save the user with pre-hashed password
    const newUser = new User({ 
      fullName, 
      email, 
      password: hashedPassword, 
      agreeToTerms 
    });
    
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Login User
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    res.status(200).json({ 
      message: 'Login successful', 
      token, 
      user: { id: user._id, email: user.email } 
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

//forgot password 
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined");
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const token = jwt.sign(
      { id: user._id, purpose: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    const resetLink = `http://localhost:3000/en/reset-password/${token}`;

    await sendEmail(
      email,
      'Password Reset Link',
      resetLink,
      `<p>Click <a href="${resetLink}">here</a> to reset your password</p>`
    );
    
    console.log(resetLink);
    res.json({ message: 'Password reset link sent to email' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Reset Password - now with direct password hashing
const resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, token } = req.body;
    
    if (!password || !confirmPassword) {
      return res.status(400).json({ error: 'Password and confirmation are required' });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords don't match" });
    }
    
    if (!token) {
      return res.status(400).json({ error: 'Token is missing' });
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (!decoded || !decoded.id) {
        return res.status(400).json({ error: 'Invalid token' });
      }
      
      // Hash the new password
      const hashedPassword = await hashPassword(password);
      
      // Update user with findByIdAndUpdate
      const updatedUser = await User.findByIdAndUpdate(
        decoded.id,
        { password: hashedPassword },
        { new: true }
      );
      
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error("JWT Verification Error:", error);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(400).json({ error: 'Token has expired' });
      }
      
      return res.status(400).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { userSignup, userLogin, forgotPassword, resetPassword };