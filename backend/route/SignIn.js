import express from 'express';
import generateToken from '../utils/GenerateToken.js';
import authenticateToken from '../middleware/Auth.js';
import upload from '../config/multrer.js';
import { loginUser , logoutUser , getProfile , updateProfile } from '../controllers/User/Login.js';

const router = express();

// Route handlers
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    
    generateToken(res, result.user);
    res.status(200).json({ username: result.username, message: result.message });
  } catch (error) {
    res.status(400).json({ error: true, message: error.message });
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

router.get('/profile/:username', authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;
    const result = await getProfile(username);
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ error: true, message: error.message });
  }
});

router.put('/profile/:username', authenticateToken, upload.single('profileImage'), async (req, res) => {
  try {
    const { username } = req.params;
    const result = await updateProfile(username, req.body, req.file);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

export default router;