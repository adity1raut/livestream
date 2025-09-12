import Post from '../../models/Post.models.js';
import User from '../../models/User.models.js';
import cloudinary from '../../config/cloudinary.js';
import NotificationService from './NotificationServic.js';


let notificationService;

export const initializeNotificationService = (io) => {
  notificationService = new NotificationService(io);
};

// Helper function to upload to cloudinary
const uploadToCloudinary = (buffer, resourceType, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: folder,
        transformation: resourceType === 'video' ? 
          [{ quality: 'auto', format: 'mp4' }] : 
          [{ quality: 'auto', format: 'jpg', width: 1200, height: 1200, crop: 'limit' }]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    ).end(buffer);
  });
};

// Create a new post
export async function CreatePost (req, res) {
  try {
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    let mediaData = {
      type: 'none',
      url: '',
      publicId: ''
    };

    // Handle media upload if file exists
    if (req.file) {
      const isVideo = req.file.mimetype.startsWith('video/');
      const resourceType = isVideo ? 'video' : 'image';
      const folder = isVideo ? 'social_app/videos' : 'social_app/images';

      try {
        const result = await uploadToCloudinary(req.file.buffer, resourceType, folder);
        
        mediaData = {
          type: isVideo ? 'video' : 'image',
          url: result.secure_url,
          publicId: result.public_id
        };
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload media'
        });
      }
    }

    // Create new post
    const newPost = new Post({
      author: userId,
      content,
      media: mediaData
    });

    await newPost.save();

    // Add post to user's posts array
    await User.findByIdAndUpdate(userId, {
      $push: { posts: newPost._id }
    });

    // Populate author details for response
    await newPost.populate('author', 'username profile.name profile.profileImage');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: newPost
    });

  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating post'
    });
  }
};

// Get all posts (feed)
export async function getFeed (req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('author', 'username profile.name profile.profileImage')
      .populate('comments.user', 'username profile.name profile.profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      posts,
      currentPage: page,
      hasMore: posts.length === limit
    });

  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching posts'
    });
  }
};

// Get single post
export async function SinglePost (req, res) {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username profile.name profile.profileImage')
      .populate('comments.user', 'username profile.name profile.profileImage')
      .populate('likes', 'username profile.name profile.profileImage');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.status(200).json({
      success: true,
      post
    });

  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching post'
    });
  }
};

export async function likePost (req, res) {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId).populate('author', 'username');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // Unlike the post
      post.likes = post.likes.filter(id => id.toString() !== userId);
      await post.save();

      res.status(200).json({
        success: true,
        message: 'Post unliked',
        isLiked: false,
        likesCount: post.likes.length
      });
    } else {
      // Like the post
      post.likes.push(userId);
      await post.save();

      // Send notification to post owner
      if (notificationService) {
        const liker = await User.findById(userId);
        await notificationService.sendLikeNotification(
          post.author._id,
          userId,
          liker.username,
          postId
        );
      }

      res.status(200).json({
        success: true,
        message: 'Post liked',
        isLiked: true,
        likesCount: post.likes.length
      });
    }

  } catch (error) {
    console.error('Error liking/unliking post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing like'
    });
  }
};

// Comment on a post
export async function addComment (req, res) {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    const post = await Post.findById(postId).populate('author', 'username');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const newComment = {
      user: userId,
      text,
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    // Populate the new comment with user details
    await post.populate('comments.user', 'username profile.name profile.profileImage');
    
    const addedComment = post.comments[post.comments.length - 1];

    // Send notification to post owner
    if (notificationService) {
      const commenter = await User.findById(userId);
      await notificationService.sendCommentNotification(
        post.author._id,
        userId,
        commenter.username,
        postId
      );
    }

    res.status(200).json({
      success: true,
      message: 'Comment added successfully',
      comment: addedComment,
      commentsCount: post.comments.length
    });

  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding comment'
    });
  }
};

// Delete a post
export async function DeletePost (req, res) {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user owns the post
    if (post.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts'
      });
    }

    // Delete media from cloudinary if exists
    if (post.media.publicId) {
      try {
        await cloudinary.uploader.destroy(post.media.publicId, {
          resource_type: post.media.type === 'video' ? 'video' : 'image'
        });
      } catch (cloudinaryError) {
        console.error('Error deleting from cloudinary:', cloudinaryError);
      }
    }

    // Remove post from user's posts array
    await User.findByIdAndUpdate(userId, {
      $pull: { posts: postId }
    });

    // Delete the post
    await Post.findByIdAndDelete(postId);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting post'
    });
  }
};

// Get user's posts
export async function getUserpost (req, res) {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const posts = await Post.find({ author: user._id })
      .populate('author', 'username profile.name profile.profileImage')
      .populate('comments.user', 'username profile.name profile.profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      posts,
      currentPage: page,
      hasMore: posts.length === limit
    });

  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user posts'
    });
  }
};

