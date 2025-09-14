import express from "express";
import Stream from "../../models/Stream.js"; 
import User from "../../models/User.models.js";
import LiveMessage from "../../models/StreamChat.models.js";
import authenticateToken from "../../middleware/Auth.js";

const router = express.Router();

// Create a new stream - requires authentication
export async function createStream(req, res) {
  try {
    const { title, description } = req.body;
    const host = req.user._id; // Get host from authenticated user

    // Verify host exists
    const hostUser = await User.findById(host);
    if (!hostUser) {
      return res.status(404).json({ error: "Host user not found" });
    }

    const streamKey = `${host}-${Date.now()}`; 

    const newStream = new Stream({
      host,
      title,
      description,
      streamKey,
      streamUrl: `/live/${streamKey}` // later CDN/RTMP link
    });

    await newStream.save();

    // Add stream to user's streams array
    await User.findByIdAndUpdate(host, {
      $push: { streams: newStream._id }
    });

    res.status(201).json(newStream);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all live streams - public access
export async function getAllLiveStreams(req, res) {
  try {
    const streams = await Stream.find({ isLive: true })
      .populate("host", "username profile.profileImage profile.name");
    res.json(streams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get specific stream - public access for viewing
export async function getStreamById(req, res) {
  try {
    const stream = await Stream.findById(req.params.id)
      .populate("host", "username profile.profileImage profile.name")
      .populate("viewers", "username profile.profileImage profile.name")
      .populate({
        path: "liveChat",
        populate: { 
          path: "sender", 
          select: "username profile.profileImage profile.name" 
        },
        options: { sort: { createdAt: -1 }, limit: 50 } // Latest 50 messages
      });

    if (!stream) return res.status(404).json({ message: "Stream not found" });

    res.json(stream);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// End stream - only stream host can end
export async function endStream(req, res) {
  try {
    const stream = await Stream.findById(req.params.id);
    if (!stream) return res.status(404).json({ message: "Stream not found" });

    // Check if user is the host
    if (stream.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the host can end the stream" });
    }

    stream.isLive = false;
    stream.endedAt = new Date();
    await stream.save();

    res.json({ message: "Stream ended", stream });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Join stream - requires authentication
export async function joinStream(req, res) {
  try {
    const userId = req.user._id; // Get user from token
    
    const stream = await Stream.findById(req.params.id);
    if (!stream) return res.status(404).json({ message: "Stream not found" });

    if (!stream.isLive) {
      return res.status(400).json({ message: "Stream is not live" });
    }

    if (!stream.viewers.includes(userId)) {
      stream.viewers.push(userId);
      await stream.save();
    }

    res.json({ message: "Joined stream", viewers: stream.viewers.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Leave stream - requires authentication
export async function leaveStream(req, res) {
  try {
    const userId = req.user._id; // Get user from token
    const stream = await Stream.findById(req.params.id);
    if (!stream) return res.status(404).json({ message: "Stream not found" });

    stream.viewers = stream.viewers.filter(v => v.toString() !== userId.toString());
    await stream.save();

    res.json({ message: "Left stream", viewers: stream.viewers.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Send chat message - requires authentication
export async function sendChatMessage(req, res) {
  try {
    const { message } = req.body;
    const streamId = req.params.id;
    const userId = req.user._id; // Get user from token

    // Verify stream exists and is live
    const stream = await Stream.findById(streamId);
    if (!stream) return res.status(404).json({ message: "Stream not found" });
    if (!stream.isLive) return res.status(400).json({ message: "Stream is not live" });

    // Create new chat message
    const newMessage = new LiveMessage({
      streamId,
      sender: userId,
      message
    });

    await newMessage.save();

    // Add message to stream's chat
    stream.liveChat.push(newMessage._id);
    await stream.save();

    // Populate sender info for response
    await newMessage.populate("sender", "username profile.profileImage profile.name");

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user's streams - requires authentication
export async function getUserStreams(req, res) {
  try {
    const userId = req.user._id;
    
    const streams = await Stream.find({ host: userId })
      .populate("host", "username profile.profileImage profile.name")
      .sort({ createdAt: -1 });

    res.json(streams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get stream analytics - only for host
export async function getStreamAnalytics(req, res) {
  try {
    const stream = await Stream.findById(req.params.id)
      .populate("viewers", "username profile.profileImage profile.name");
    
    if (!stream) return res.status(404).json({ message: "Stream not found" });

    // Check if user is the host
    if (stream.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the host can view analytics" });
    }

    const analytics = {
      totalViewers: stream.viewers.length,
      totalMessages: stream.liveChat.length,
      duration: stream.endedAt ? 
        Math.floor((new Date(stream.endedAt) - new Date(stream.startedAt)) / 1000 / 60) : 
        Math.floor((new Date() - new Date(stream.startedAt)) / 1000 / 60),
      isLive: stream.isLive,
      startedAt: stream.startedAt,
      endedAt: stream.endedAt
    };

    res.json({ stream: stream.title, analytics });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default router;
