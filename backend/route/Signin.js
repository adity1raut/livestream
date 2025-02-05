import express from "express";
import User from "../models/UserSchema.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import transporter from "../connection/nodeMailer.js"; 
dotenv.config();

const router = express.Router();
const otpStore = new Map();  

router.post('/api/send-otp', async (req, res) => {
  try {
    const { email, fname, lname } = req.body; // Capture first name and last name along with email

    if (!email || !fname || !lname) {
      return res.status(400).send({ message: "Email, first name, and last name are required" });
    }

    // Generate a 4-digit OTP
    const otp = crypto.randomInt(1000, 9999).toString();
    otpStore.set(email, { otp, expiresAt: Date.now() + 2 * 60 * 1000 }); // OTP expires in 2 minutes

    // Send OTP via email
    await transporter.sendMail({
      from: 'your-email@gmail.com',
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It is valid for 2 minutes.`,
    });

    console.log(`OTP sent to ${email}: ${otp}`);
    res.status(200).send({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).send({ message: "Error sending OTP" });
  }
});

router.post('/api/verify-otp', (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).send({ message: "Email and OTP are required" });
    }

    const storedOtpData = otpStore.get(email);
    if (!storedOtpData) {
      return res.status(400).send({ message: "OTP expired or not found" });
    }
    if (storedOtpData.otp !== otp) {
      return res.status(400).send({ message: "Invalid OTP" });
    }

    if (storedOtpData.expiresAt < Date.now()) {
      otpStore.delete(email); // Clean up expired OTP
      return res.status(400).send({ message: "OTP expired" });
    }

    otpStore.delete(email); // OTP verified successfully, delete from store
    res.status(200).send({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).send({ message: "Error verifying OTP" });
  }
});

router.post('/api/users', async (req, res) => {
  try {
    const { email, password, fname, lname } = req.body;

    if (!email || !password || !fname || !lname) {
      return res.status(400).send({ message: "Email, password, first name, and last name are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ message: "User already exists" });
    }


    const hashedPassword = await bcrypt.hash(password, 10);

    const username = `${fname.toLowerCase()}_${lname.toLowerCase()}${crypto.randomInt(1000, 9999)}`;

    const newUser = new User({
      firstName: fname,
      lastName: lname,
      email,
      username,
      password: hashedPassword,
    });

    await newUser.save();

    console.log("User saved:", newUser);
    res.status(201).send({ message: "User registered successfully", username });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send({ message: "Error registering user" });
  }
});

export default router;
