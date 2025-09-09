import express from 'express';
import {
  checkAvailability,
  sendRegistrationOTP,
  resendRegistrationOTP,
  verifyRegistrationOTP,
  registerUser
} from "../controllers/User/SignUp.js"

const router = express.Router();

// Check username/email availability
router.post('/check-availability', async (req, res) => {
  try {
    const { identifier } = req.body;
    const result = await checkAvailability(identifier);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Send registration OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await sendRegistrationOTP(email);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Resend registration OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await resendRegistrationOTP(email);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Verify registration OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await verifyRegistrationOTP(email, otp);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Register user
router.post('/register', async (req, res) => {
  try {
    const userData = req.body;
    const result = await registerUser(userData);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
});

export default router;