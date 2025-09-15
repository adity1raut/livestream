import express from "express";
import User from "../models/User.js";
import authenticateToken from "../middleware/auth.js";
import upload from "../config/multer.js";
import cloudinary from "../config/cloudinary.js";
import NotificationService from "../services/NotificationService.js";

const router = express.Router();

let notificationService;

export const initializeNotificationService = (io) => {
  notificationService = new NotificationService(io);
};

// Helper function to upload to cloudinary
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "image",
          folder: folder,
          transformation: [
            {
              quality: "auto",
              format: "jpg",
              width: 400,
              height: 400,
              crop: "fill",
            },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      )
      .end(buffer);
  });
};

// Get current user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("posts", "content media likes comments createdAt")
      .populate("followers", "username profile.name profile.profileImage")
      .populate("following", "username profile.name profile.profileImage");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
});

// Get user profile by username
router.get("/profile/:username", authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username })
      .select("-password")
      .populate("posts", "content media likes comments createdAt")
      .populate("followers", "username profile.name profile.profileImage")
      .populate("following", "username profile.name profile.profileImage");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if current user is following this user
    const isFollowing = user.followers.some(
      (follower) => follower._id.toString() === req.user.id,
    );

    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        isFollowing,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
});

// Update user profile
router.put(
  "/profile",
  authenticateToken,
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { name, bio } = req.body;

      const updateData = {};

      if (name) updateData["profile.name"] = name;
      if (bio) updateData["profile.bio"] = bio;

      // Handle profile image upload
      if (req.files && req.files.profileImage) {
        try {
          const result = await uploadToCloudinary(
            req.files.profileImage[0].buffer,
            "social_app/profile_images",
          );
          updateData["profile.profileImage"] = result.secure_url;
        } catch (uploadError) {
          console.error("Profile image upload error:", uploadError);
          return res.status(500).json({
            success: false,
            message: "Failed to upload profile image",
          });
        }
      }

      // Handle cover image upload
      if (req.files && req.files.coverImage) {
        try {
          const result = await uploadToCloudinary(
            req.files.coverImage[0].buffer,
            "social_app/cover_images",
          );
          updateData["profile.coverImage"] = result.secure_url;
        } catch (uploadError) {
          console.error("Cover image upload error:", uploadError);
          return res.status(500).json({
            success: false,
            message: "Failed to upload cover image",
          });
        }
      }

      const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      }).select("-password");

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({
        success: false,
        message: "Server error while updating profile",
      });
    }
  },
);

// Follow/Unfollow user
router.post("/follow/:username", authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user.id;

    // Find the user to follow
    const userToFollow = await User.findOne({ username });

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Can't follow yourself
    if (userToFollow._id.toString() === currentUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    const currentUser = await User.findById(currentUserId);

    // Check if already following
    const isFollowing = currentUser.following.includes(userToFollow._id);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== userToFollow._id.toString(),
      );
      userToFollow.followers = userToFollow.followers.filter(
        (id) => id.toString() !== currentUserId,
      );

      await currentUser.save();
      await userToFollow.save();

      res.status(200).json({
        success: true,
        message: `Unfollowed ${username}`,
        isFollowing: false,
        followersCount: userToFollow.followers.length,
        followingCount: currentUser.following.length,
      });
    } else {
      // Follow
      currentUser.following.push(userToFollow._id);
      userToFollow.followers.push(currentUserId);

      await currentUser.save();
      await userToFollow.save();

      // Send notification
      if (notificationService) {
        await notificationService.sendFollowNotification(
          userToFollow._id,
          currentUserId,
          currentUser.username,
        );
      }

      res.status(200).json({
        success: true,
        message: `Now following ${username}`,
        isFollowing: true,
        followersCount: userToFollow.followers.length,
        followingCount: currentUser.following.length,
      });
    }
  } catch (error) {
    console.error("Error following/unfollowing user:", error);
    res.status(500).json({
      success: false,
      message: "Server error while processing follow request",
    });
  }
});

// Get user's followers
router.get("/:username/followers", authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findOne({ username }).populate({
      path: "followers",
      select: "username profile.name profile.profileImage",
      options: { skip, limit },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      followers: user.followers,
      currentPage: page,
      hasMore: user.followers.length === limit,
    });
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching followers",
    });
  }
});

// Get user's following
router.get("/:username/following", authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findOne({ username }).populate({
      path: "following",
      select: "username profile.name profile.profileImage",
      options: { skip, limit },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      following: user.following,
      currentPage: page,
      hasMore: user.following.length === limit,
    });
  } catch (error) {
    console.error("Error fetching following:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching following",
    });
  }
});

// Search users
router.get("/search", authenticateToken, async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const skip = (page - 1) * limit;

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: "i" } },
        { "profile.name": { $regex: q, $options: "i" } },
      ],
    })
      .select("username profile.name profile.profileImage followers following")
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      users,
      currentPage: parseInt(page),
      hasMore: users.length === parseInt(limit),
    });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({
      success: false,
      message: "Server error while searching users",
    });
  }
});

export default router;
