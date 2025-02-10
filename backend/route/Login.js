import express from 'express';
import User from '../models/UserSchema.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import authenticateToken from '../middleware/Auth.js';
import multer from "multer";
const upload = multer({ dest: 'uploads/' });
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const router = express.Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log('Invalid email:', email);
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Invalid password for email:', email);
            console.log('Entered password:', password);
            console.log('Stored hashed password:', user.password);
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, username: user.username },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log('Login successful:', email);
        res.status(200).json({ token, username: user.username, message: 'Login successful' });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const profile = async (req, res) => {
    try {
        const { username } = req.params;

        if (!username) {
            return res.status(400).json({ error: true, message: 'Username is required.' });
        }

        const user = await User.findOne({ username }).select('-password').lean();  // Fetch user from DB
        if (!user) {
            return res.status(404).json({ error: true, message: 'User not found.' });
        }

        res.status(200).json({ success: true, data: user });  // Return user data
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: true, message: 'Server error, please try again later.' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const { firstName, lastName, email } = req.body;
        const profileImage = req.file;

        if (!username) {
            return res.status(400).json({ error: true, message: 'Username is required.' });
        }
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: true, message: 'User not found.' });
        }

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (email) user.email = email;

        if (profileImage) {
            const uploadResponse = await cloudinary.uploader.upload(profileImage.path, {
                folder: 'profile_pictures',
                use_filename: true,
                unique_filename: false,
            });
            user.profileImage = uploadResponse.secure_url;
        }

        await user.save();

        res.status(200).json({ success: true, message: 'Profile updated successfully.', data: user });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: true, message: 'Server error, please try again later.' });
    }
};

router.post('/api/login', login);
router.get('/api/profile/:username', authenticateToken, profile);
router.put('/api/profile/:username', upload.single('profileImage'), updateProfile);

export default router;