import express from 'express';
import User from '../models/UserSchema.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import authenticateToken from '../middleware/Auth.js';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const router = express.Router();

// Login Controller
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

// Profile Controller
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

// Profile Update Controller
const updateProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const { firstName, lastName, email } = req.body;

        if (!username) {
            return res.status(400).json({ error: true, message: 'Username is required.' });
        }

        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: true, message: 'User not found.' });
        }

        // Update user fields
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (email) user.email = email;

        // Save the updated user
        await user.save();

        res.status(200).json({ success: true, message: 'Profile updated successfully.', data: user });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: true, message: 'Server error, please try again later.' });
    }
};

// Routes
router.post('/api/login', login);
router.get('/api/profile/:username', authenticateToken, profile);
router.put('/api/profile/:username', authenticateToken, updateProfile); // Add profile update route

export default router;