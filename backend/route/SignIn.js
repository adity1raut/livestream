import Post from '../models/Post.models.js';
import express from 'express';
import generateToken from '../utils/GenerateToken.js';
import authenticateToken from '../middleware/Auth.js';

import { loginUser, logoutUser, getProfile, updateProfile , getProfileByUsername } from '../controllers/User/Login.js';
import User from '../models/User.models.js';

const router = express.Router(); 

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

router.get("/profile/:username", authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select("-password").lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, data: user });
  } catch (error) {
    console.error("Profile by username error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put('/profile', authenticateToken, (req, res) => {
  updateProfile(req, res);
});

router.post("/profile/:username/follow", authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const targetUsername = req.params.username;
    if (!targetUsername) return res.status(400).json({ success: false, message: "Username required" });

    const targetUser = await User.findOne({ username: targetUsername });
    if (!targetUser) return res.status(404).json({ success: false, message: "User not found" });
    if (targetUser._id.equals(currentUserId)) return res.status(400).json({ success: false, message: "Cannot follow yourself" });

    const currentUser = await User.findById(currentUserId);
    const alreadyFollowing = targetUser.followers.includes(currentUserId);

    if (alreadyFollowing) {
      // Unfollow
      targetUser.followers.pull(currentUserId);
      currentUser.following.pull(targetUser._id);
      await targetUser.save();
      await currentUser.save();
      return res.json({ success: true, followed: false, followersCount: targetUser.followers.length });
    } else {
      // Follow
      targetUser.followers.push(currentUserId);
      currentUser.following.push(targetUser._id);
      await targetUser.save();
      await currentUser.save();
      return res.json({ success: true, followed: true, followersCount: targetUser.followers.length });
    }
  } catch (error) {
    console.error("Follow error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/profile/:username/followers", authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).populate({
      path: 'followers',
      select: '-password',
    });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.json({ success: true, data: user.followers });
  } catch (error) {
    console.error("Fetch followers error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


router.get("/profile/:username/following", authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).populate({
      path: 'following',
      select: '-password',
    });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.json({ success: true, data: user.following });
  } catch (error) {
    console.error("Fetch following error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/profile/:username/posts", authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const posts = await Post.find({ author: user._id }).sort({ createdAt: -1 }).populate({
      path: 'author',
      select: 'username profile',
    });
    return res.json({ success: true, data: posts });
  } catch (error) {
    console.error("Fetch user posts error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


export default router;