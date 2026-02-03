const bcrypt = require('bcrypt');
const User = require('../models/User'); // Adjust path as needed

// Login controller
const loginUser = async (req, res) => {
  try {
    const { User_Id, password } = req.body;

    const user = await User.findOne({ User_Id });
    if (!user) {
      return res.status(404).json({ message: 'User not found ❌' });
    }

    // Plaintext password comparison
    if (password !== user.password) {
      return res.status(401).json({ message: 'Invalid password ❌' });
    }

    return res.status(200).json({
      message: 'Login successful ✅',
      user: {
        User_Id: user.User_Id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login ❌' });
  }
};


module.exports = {
  loginUser
};
