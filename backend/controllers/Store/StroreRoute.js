import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import StoreItem from '../../models/StoreSchema.js';
import authenticateToken from '../middleware/Auth.js';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'store-items',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }],
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
});

// Create a new store item
router.post('/api/items', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Image is required' });

    const { title, price, rating, description } = req.body;
    if (!title || !price || !rating) return res.status(400).json({ message: 'Title, price, and rating are required' });

    const newItem = new StoreItem({
      title,
      price,
      rating,
      description: description || '',
      image: req.file.path,
      owner: req.user.username, // Store the username as the owner
    });

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error creating item', error: error.message });
  }
});

// Get all store items
router.get('/api/items', async (req, res) => {
  try {
    const items = await StoreItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching store items', error: error.message });
  }
});

// Get items by owner (username)
router.get('/api/items/my-items', authenticateToken, async (req, res) => {
  try {
    const items = await StoreItem.find({ owner: req.user.username }) // Filter by owner (username)
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching your items', error: error.message });
  }
});

// Get a single store item by ID
router.get('/api/items/:id', async (req, res) => {
  try {
    const item = await StoreItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching item', error: error.message });
  }
});

// Update a store item by ID
router.put('/api/items/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const item = await StoreItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Check if the logged-in user is the owner
    if (item.owner !== req.user.username) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    const updateData = { ...req.body };
    if (req.file) {
      // Delete old image from Cloudinary
      const publicId = item.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
      updateData.image = req.file.path;
    }

    const updatedItem = await StoreItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    res.json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error updating item', error: error.message });
  }
});

// Delete a store item by ID
router.delete('/api/items/:id', authenticateToken, async (req, res) => {
  try {
    const item = await StoreItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Check if the logged-in user is the owner
    if (item.owner !== req.user.username) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    // Delete image from Cloudinary
    const publicId = item.image.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(publicId);

    // Delete item from database
    await item.deleteOne();
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting item', error: error.message });
  }
});

export default router;