import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import StoreItem from '../models/StoreSchema.js';
import authenticateToken from "../middleware/Auth.js";

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/api/items', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Image is required' });
    const { title, price, rating } = req.body;
    if (!title || !price || !rating) return res.status(400).json({ message: 'Title, price, and rating are required' });

    const newItem = new StoreItem({
      title,
      price,
      rating,
      image: req.file.path,
      oner: req.user.username,  // Storing username as a string
    });

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error creating item', error: error.message });
  }
});

router.get('/api/items', async (req, res) => {
  try {
    const items = await StoreItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching store items', error: error.message });
  }
});

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

router.put('/api/items/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const item = await StoreItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.oner !== req.user.username) {  // Check if the username matches
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    const updateData = { ...req.body };
    if (req.file) {
      const publicId = item.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
      updateData.image = req.file.path;
    }

    const updatedItem = await StoreItem.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error updating item', error: error.message });
  }
});

router.delete('/api/items/:id', authenticateToken, async (req, res) => {
  try {
    const item = await StoreItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.oner !== req.user.username) {  // Check if the username matches
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    const publicId = item.image.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(publicId);

    await item.deleteOne();
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting item', error: error.message });
  }
});

export default router;
