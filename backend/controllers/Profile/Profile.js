import express from "express";
import User from "../../models/User.models.js";
import authenticateToken from "../../middleware/Auth.js";

const router = express.Router();

// ✅ Get logged-in user's own profile (private)
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("-password")
      .populate("followers", "username profile.profileImage")
      .populate("following", "username profile.profileImage");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Get another user's profile (public - no auth required)


// ✅ Follow another user (requires auth)
router.post("/:username/follow", authenticateToken, async (req, res) => {
  try {
    const targetUser = await User.findOne({ username: req.params.username });
    const currentUser = await User.findById(req.userId);

    if (!targetUser) return res.status(404).json({ message: "User not found" });
    if (targetUser._id.equals(currentUser._id)) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    if (!targetUser.followers.includes(currentUser._id)) {
      targetUser.followers.push(currentUser._id);
      currentUser.following.push(targetUser._id);
      await targetUser.save();
      await currentUser.save();
    }

    res.json({ message: "Followed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Unfollow another user (requires auth)
router.post("/:username/unfollow", authenticateToken, async (req, res) => {
  try {
    const targetUser = await User.findOne({ username: req.params.username });
    const currentUser = await User.findById(req.userId);

    if (!targetUser) return res.status(404).json({ message: "User not found" });

    targetUser.followers = targetUser.followers.filter(
      (id) => !id.equals(currentUser._id)
    );
    currentUser.following = currentUser.following.filter(
      (id) => !id.equals(targetUser._id)
    );

    await targetUser.save();
    await currentUser.save();

    res.json({ message: "Unfollowed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
