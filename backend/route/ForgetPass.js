import express from "express";
import {
  sendOTP,
  resendOTP,
  verifyOTP,
  resetPassword,
} from "../controllers/User/ForgetPass.js";

const router = express.Router();

// Send OTP for password reset
router.post("/send-reset-otp", async (req, res) => {
  try {
    const { identifier } = req.body;
    const result = await sendOTP(identifier);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Resend OTP for password reset
router.post("/resend-reset-otp", async (req, res) => {
  try {
    const { identifier } = req.body;
    const result = await resendOTP(identifier);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Verify OTP for password reset
router.post("/verify-reset-otp", async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    const result = await verifyOTP(identifier, otp);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Reset password after OTP verification
router.post("/reset-password", async (req, res) => {
  try {
    const { identifier, newPassword } = req.body;
    const result = await resetPassword(identifier, newPassword);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
