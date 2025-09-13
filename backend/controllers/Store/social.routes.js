import express from "express";
import authenticateToken from "../../middleware/Auth.js";
import Store from "../../models/Store.models.js";
import User from "../../models/User.models.js";

const router = express.Router();

// POST /api/stores/:storeId/follow - Follow/Unfollow a store
router.post("/:storeId/follow", authenticateToken, async (req, res) => {
  try {
    const { storeId } = req.params;

    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    // Can't follow your own store
    if (store.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: "You cannot follow your own store" });
    }

    const user = await User.findById(req.user._id);
    const storeOwner = await User.findById(store.owner);

    // Check if already following
    const isFollowing = user.following.includes(store.owner);

    if (isFollowing) {
      // Unfollow
      user.following = user.following.filter(id => id.toString() !== store.owner.toString());
      storeOwner.followers = storeOwner.followers.filter(id => id.toString() !== req.user._id.toString());
      await user.save();
      await storeOwner.save();

      res.status(200).json({ message: "Unfollowed store successfully", following: false });
    } else {
      // Follow
      user.following.push(store.owner);
      storeOwner.followers.push(req.user._id);
      await user.save();
      await storeOwner.save();

      res.status(200).json({ message: "Following store successfully", following: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stores/:storeId/follow-status - Check if user is following a store
router.get("/:storeId/follow-status", authenticateToken, async (req, res) => {
  try {
    const { storeId } = req.params;

    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    const user = await User.findById(req.user._id);
    const isFollowing = user.following.includes(store.owner);

    res.status(200).json({ following: isFollowing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stores/following/stores - Get stores that user is following
router.get("/following/stores", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const user = await User.findById(req.user._id).populate("following");
    const followingUserIds = user.following.map(u => u._id);

    const stores = await Store.find({ owner: { $in: followingUserIds } })
      .populate("owner", "username profile.name")
      .populate("products", "name price images")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Store.countDocuments({ owner: { $in: followingUserIds } });

    res.status(200).json({
      stores,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;