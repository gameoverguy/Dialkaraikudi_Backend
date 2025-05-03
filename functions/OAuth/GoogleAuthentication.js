
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming you have a User model

const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);
const JWT_SECRET = 'your_jwt_secret_key';

async function verifyGoogleToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
}

// Google OAuth Login/Signup function
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) return res.status(400).json({ message: 'Token is required' });

    const payload = await verifyGoogleToken(token);

    const { email, name, picture } = payload;

    // Check if user exists in the database
    let user = await User.findOne({ email });

    if (!user) {
      // If user doesn't exist, create a new user
      user = new User({ email, name, picture });
      await user.save();
    }

    // Create JWT token for user
    const jwtToken = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    // Send the token and user data back to the frontend
    res.json({ token: jwtToken, user });
  } catch (error) {
    console.error('Error in Google OAuth', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
};
