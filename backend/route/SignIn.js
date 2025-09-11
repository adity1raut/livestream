import express from 'express';
import generateToken from '../utils/GenerateToken.js';
import authenticateToken from '../middleware/Auth.js';
import { loginUser, logoutUser, getProfile, updateProfile } from '../controllers/User/Login.js';

const router = express.Router(); // Fixed: Use express.Router() instead of express()

// Route handlers
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const result = await loginUser(identifier, password);

    generateToken(res, result.user);
    res.status(200).json({
      username: result.username,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({
      error: true,
      message: error.message
    });
  }
});


router.post('/logout', (req, res) => {
  const result = logoutUser();
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  });
  res.status(200).json(result);
});

// Fixed: Pass req and res to getProfile
router.get("/profile", authenticateToken, (req, res) => getProfile(req, res));

// Fixed: Pass req and res to updateProfile
router.put('/profile', authenticateToken, (req, res) => {
  updateProfile(req, res);
});

export default router;