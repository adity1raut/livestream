import express from 'express';
import upload from '../connection/multrer.js'; // Adjust the import path as necessary
import Video from '../../models/VideoSchema.js'; // Adjust the import path as necessary

const router = express.Router();

router.post('/videos', upload.single('videoFile'), async (req, res) => {
    try {
        const { title, description, uploadedBy } = req.body;
        if (!title || !description || !uploadedBy) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Video file is required and must be uploaded via Multer and Cloudinary' });
        }

        const videoFile = req.file.path;
        const video = new Video({ title, description, videoFile, uploadedBy });
        await video.save();
        res.status(201).json(video);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all videos
router.get('/videos', async (req, res) => {
    try {
        const videos = await Video.find().populate('uploadedBy', 'username'); // Assuming `username` is a field in the User schema
        res.status(200).json(videos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single video by ID
router.get('/videos/:id', async (req, res) => {
    try {
        const video = await Video.findById(req.params.id).populate('uploadedBy', 'username');
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }
        res.status(200).json(video);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a video by ID
router.put('/videos/:id', upload.single('videoFile'), async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }

        const videoFile = req.file ? req.file.path : null;
        const updatedData = { title, description };
        if (videoFile) updatedData.videoFile = videoFile;

        const video = await Video.findByIdAndUpdate(
            req.params.id,
            updatedData,
            { new: true, runValidators: true }
        );
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }
        res.status(200).json(video);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a video by ID
router.delete('/videos/:id', async (req, res) => {
    try {
        const video = await Video.findByIdAndDelete(req.params.id);
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }
        res.status(200).json({ message: 'Video deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
