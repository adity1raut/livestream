import express from "express";
import authenticateToken from "../../middleware/Auth.js";
import { razorpay } from "../../config/rozapay.js";
import crypto from "crypto";
import Cart from "../../models/Card.models.js";
import Product from "../../models/Product.models.js";
import User from "../../models/User.models.js";
import Store from "../../models/Store.models.js";

const router = express.Router();

// POST /api/stores/order/create - Create Razorpay order
router.post("/order/create", authenticateToken, async (req, res) => {
  try {
    const { addressId } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Verify user address
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(400).json({ error: "Address not found" });
    }

    // Calculate total amount
    let totalAmount = 0;
    for (const item of cart.items) {
      // Verify stock availability
      if (item.product.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${item.product.name}` 
        });
      }
      totalAmount += item.product.price * item.quantity;
    }

    // Create Razorpay order
    const options = {
      amount: totalAmount * 100, // Amount in paise
      currency: "INR",
      receipt: `order_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        addressId: addressId,
        itemCount: cart.items.length
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: totalAmount,
        currency: "INR",
        key: process.env.RAZORPAY_KEY_ID,
        name: "Your Store Name",
        description: "Payment for your order",
        prefill: {
          name: user.profile.name || user.username,
          email: user.email,
          contact: address.phone
        },
        theme: {
          color: "#3399cc"
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/stores/order/verify - Verify Razorpay payment
router.post("/order/verify", authenticateToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, addressId } = req.body;

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    // Update stock and prepare order items
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${product.name}` 
        });
      }

      // Reduce stock
      product.stock -= item.quantity;
      await product.save();

      totalAmount += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        storeName: (await Store.findById(product.store)).name
      });
    }

    // Clear the cart
    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Payment verified and order placed successfully",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount: totalAmount,
      items: orderItems
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;