import express from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/UserSchema.js';
import transporter from "../connection/nodeMailer.js"
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const otpStore = new Map();
router.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send({ message: 'User with this email does not exist' });
    }

    const otp = crypto.randomInt(1000, 9999).toString();
    otpStore.set(email, { otp, expiresAt: Date.now() + 2 * 60 * 1000 }); 
    await transporter.sendMail({
      from: 'araut7798@gmail.com',
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is ${otp}. It is valid for 2 minutes.`,
    });
    console.log('OTP sent successfully:', otp);
    res.status(200).send({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).send({ message: 'Error sending OTP' });
  }
});

router.post('/api/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const storedOtp = otpStore.get(email);

    if (!storedOtp || storedOtp.otp !== otp || storedOtp.expiresAt < Date.now()) {
      return res.status(400).send({ message: 'Invalid or expired OTP' });
    }

    otpStore.delete(email);
    res.status(200).send({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).send({ message: 'Error verifying OTP' });
  }
});

router.post('/api/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send({ message: 'User with this email does not exist' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).send({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).send({ message: 'Error updating password' });
  }
});

export default router;