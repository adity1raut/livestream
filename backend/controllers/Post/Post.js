
import Post from "../../models/Post.models.js";
import User from "../../models/User.models.js";
import Notification from "../../models/Notification.models.js";



const createNotification = async (userId, type, message, link = null) => {
  try {
    const notification = new Notification({
      user: userId,
      type,
      message,
      link,
      isRead: false
    });
    await notification.save();
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

// CREATE POST
export async function CreatePost (req, res) {
  try {
    const { content, media } = req.body;
    
    if (!content || content.trim() === "") {
      return res.status(400).json({ error: "Content is required" });
    }

    const newPost = new Post({
      author: req.user._id,
      content: content.trim(),
      media: media || { type: "none", url: "" },
      likes: [],
      comments: []
    });

    const savedPost = await newPost.save();
    
    // Add post to user's posts array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { posts: savedPost._id }
    });

    // Notify followers about new post
    const followers = await User.find({ following: req.user._id });
    for (const follower of followers) {
      await createNotification(
        follower._id,
        "GENERAL",
        `${req.user.username} created a new post`,
        `/post/${savedPost._id}`
      );
    }

    const populatedPost = await Post.findById(savedPost._id)
      .populate("author", "username profile.name profile.profileImage")
      .populate("likes", "username profile.name")
      .populate("comments.user", "username profile.name profile.profileImage");

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: populatedPost
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL POSTS (Feed)
export async function getFeed (req, res)  {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get posts from user and following users
    const followingUsers = req.user.following || [];
    const userIds = [req.user._id, ...followingUsers];

    const posts = await Post.find({ author: { $in: userIds } })
      .populate("author", "username profile.name profile.profileImage")
      .populate("likes", "username profile.name")
      .populate("comments.user", "username profile.name profile.profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET SINGLE POST
export async function SinglePost (req, res) {
  try {
    const post = await Post.findById(req.params.postId)
      .populate("author", "username profile.name profile.profileImage")
      .populate("likes", "username profile.name")
      .populate("comments.user", "username profile.name profile.profileImage");

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json({
      success: true,
      post
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE POST
export async function UpdatePost (req, res)  {
  try {
    const { content, media } = req.body;
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You can only edit your own posts" });
    }

    if (!content || content.trim() === "") {
      return res.status(400).json({ error: "Content is required" });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        content: content.trim(),
        media: media || post.media
      },
      { new: true, runValidators: true }
    )
      .populate("author", "username profile.name profile.profileImage")
      .populate("likes", "username profile.name")
      .populate("comments.user", "username profile.name profile.profileImage");

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post: updatedPost
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE POST
export async function DeletePost (req, res) {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You can only delete your own posts" });
    }

    await Post.findByIdAndDelete(req.params.postId);
    
    // Remove post from user's posts array
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { posts: req.params.postId }
    });

    res.status(200).json({
      success: true,
      message: "Post deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// LIKE/UNLIKE POST
export async function likePost (req, res) {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const userId = req.user._id;
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // Unlike the post
      post.likes.pull(userId);
      await post.save();

      res.status(200).json({
        success: true,
        message: "Post unliked",
        isLiked: false,
        likesCount: post.likes.length
      });
    } else {
      // Like the post
      post.likes.push(userId);
      await post.save();

      // Notify post author (if not self-like)
      if (post.author.toString() !== userId.toString()) {
        await createNotification(
          post.author,
          "LIKE",
          `${req.user.username} liked your post`,
          `/post/${post._id}`
        );
      }

      res.status(200).json({
        success: true,
        message: "Post liked",
        isLiked: true,
        likesCount: post.likes.length
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ADD COMMENT
export async function addComment (req, res) {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Comment text is required" });
    }

    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const newComment = {
      user: req.user._id,
      text: text.trim(),
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    // Notify post author (if not self-comment)
    if (post.author.toString() !== req.user._id.toString()) {
      await createNotification(
        post.author,
        "COMMENT",
        `${req.user.username} commented on your post`,
        `/post/${post._id}`
      );
    }

    const updatedPost = await Post.findById(req.params.postId)
      .populate("author", "username profile.name profile.profileImage")
      .populate("likes", "username profile.name")
      .populate("comments.user", "username profile.name profile.profileImage");

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      post: updatedPost,
      comment: newComment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE COMMENT
export async function deleteComment (req, res) {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Check if user is comment author or post author
    const isCommentAuthor = comment.user.toString() === req.user._id.toString();
    const isPostAuthor = post.author.toString() === req.user._id.toString();

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({ 
        error: "You can only delete your own comments or comments on your posts" 
      });
    }

    post.comments.pull(req.params.commentId);
    await post.save();

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET USER'S POSTS
export async function getUserpost (req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: req.params.userId })
      .populate("author", "username profile.name profile.profileImage")
      .populate("likes", "username profile.name")
      .populate("comments.user", "username profile.name profile.profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET POSTS BY HASHTAG OR SEARCH
export async function searchByhashtag (req, res) {
  try {
    const query = req.params.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({
      content: { $regex: query, $options: 'i' }
    })
      .populate("author", "username profile.name profile.profileImage")
      .populate("likes", "username profile.name")
      .populate("comments.user", "username profile.name profile.profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      posts,
      query,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

