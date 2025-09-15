import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import Razorpay from "razorpay";
import crypto from "crypto";
import Store from "../../models/Store.models.js";
import User from "../../models/User.models.js";
import Product from "../../models/Product.models.js";
import Cart from "../../models/Card.models.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Helper function to upload image to Cloudinary
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "image",
          folder: folder,
          transformation: [
            { width: 500, height: 500, crop: "limit" },
            { quality: "auto" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      )
      .end(buffer);
  });
};

// Middleware to check authentication
const authenticateUser = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid authentication" });
  }
};

// ================================
// STORE MANAGEMENT ROUTES
// ================================

// GET /api/stores - Get all stores (public)
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = search ? { name: { $regex: search, $options: "i" } } : {};

    const stores = await Store.find(query)
      .populate("owner", "username profile.name")
      .populate("products", "name price images")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Store.countDocuments(query);

    res.status(200).json({
      stores,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stores/:id - Get specific store (public)
router.get("/:id", async (req, res) => {
  try {
    const store = await Store.findById(req.params.id)
      .populate("owner", "username profile.name profile.profileImage")
      .populate({
        path: "products",
        populate: {
          path: "ratings.user",
          select: "username profile.name",
        },
      });

    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    res.status(200).json(store);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/stores - Create new store
router.post("/", authenticateUser, upload.single("logo"), async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if user already has a store
    const existingStore = await Store.findOne({ owner: req.user._id });
    if (existingStore) {
      return res.status(400).json({ error: "User already has a store" });
    }

    let logoUrl = "";
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "store-logos");
      logoUrl = result.secure_url;
    }

    const store = new Store({
      owner: req.user._id,
      name,
      description,
      logo: logoUrl,
    });

    await store.save();

    // Update user with store reference
    await User.findByIdAndUpdate(req.user._id, { store: store._id });

    const populatedStore = await Store.findById(store._id).populate(
      "owner",
      "username profile.name",
    );

    res.status(201).json(populatedStore);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/stores/:id - Update store
router.put(
  "/:id",
  authenticateUser,
  upload.single("logo"),
  async (req, res) => {
    try {
      const { name, description } = req.body;
      const store = await Store.findById(req.params.id);

      if (!store) {
        return res.status(404).json({ error: "Store not found" });
      }

      // Check if user owns the store
      if (store.owner.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ error: "Not authorized to update this store" });
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (description !== undefined) updateData.description = description;

      // Handle logo upload
      if (req.file) {
        // Delete old logo from Cloudinary if exists
        if (store.logo) {
          const publicId = store.logo.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`store-logos/${publicId}`);
        }

        const result = await uploadToCloudinary(req.file.buffer, "store-logos");
        updateData.logo = result.secure_url;
      }

      const updatedStore = await Store.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true },
      ).populate("owner", "username profile.name");

      res.status(200).json(updatedStore);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// DELETE /api/stores/:id - Delete store
router.delete("/:id", authenticateUser, async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);

    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    // Check if user owns the store
    if (store.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this store" });
    }

    // Delete all products associated with this store
    await Product.deleteMany({ store: store._id });

    // Delete logo from Cloudinary if exists
    if (store.logo) {
      const publicId = store.logo.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`store-logos/${publicId}`);
    }

    // Remove store reference from user
    await User.findByIdAndUpdate(req.user._id, { $unset: { store: 1 } });

    await Store.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Store deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stores/user/:userId - Get user's store
router.get("/user/:userId", async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.params.userId })
      .populate("owner", "username profile.name")
      .populate("products", "name price images stock");

    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    res.status(200).json(store);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stores/:id/products - Get all products of a store
router.get("/:id/products", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      sort = "createdAt",
      order = "desc",
    } = req.query;

    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    const sortObj = {};
    sortObj[sort] = order === "desc" ? -1 : 1;

    const products = await Product.find({ store: req.params.id })
      .populate("store", "name logo")
      .populate("ratings.user", "username profile.name")
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments({ store: req.params.id });

    res.status(200).json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stores/my/store - Get current user's store
router.get("/my/store", authenticateUser, async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id })
      .populate("owner", "username profile.name")
      .populate("products", "name price images stock");

    if (!store) {
      return res.status(404).json({ error: "You don't have a store yet" });
    }

    res.status(200).json(store);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================================
// PRODUCT MANAGEMENT ROUTES
// ================================

// POST /api/stores/:storeId/products - Add product to store (Store Owner)
router.post(
  "/:storeId/products",
  authenticateUser,
  upload.array("images", 5),
  async (req, res) => {
    try {
      const { storeId } = req.params;
      const { name, description, price, stock } = req.body;

      // Verify store exists and user owns it
      const store = await Store.findById(storeId);
      if (!store) {
        return res.status(404).json({ error: "Store not found" });
      }

      if (store.owner.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ error: "Not authorized to add products to this store" });
      }

      // Upload images to Cloudinary
      let imageUrls = [];
      if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map((file) =>
          uploadToCloudinary(file.buffer, "product-images"),
        );
        const results = await Promise.all(uploadPromises);
        imageUrls = results.map((result) => result.secure_url);
      }

      const product = new Product({
        store: storeId,
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        images: imageUrls,
      });

      await product.save();

      // Add product to store's products array
      store.products.push(product._id);
      await store.save();

      const populatedProduct = await Product.findById(product._id).populate(
        "store",
        "name logo",
      );

      res.status(201).json(populatedProduct);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// PUT /api/stores/:storeId/products/:productId - Update product (Store Owner)
router.put(
  "/:storeId/products/:productId",
  authenticateUser,
  upload.array("images", 5),
  async (req, res) => {
    try {
      const { storeId, productId } = req.params;
      const { name, description, price, stock, removeImages } = req.body;

      // Verify store exists and user owns it
      const store = await Store.findById(storeId);
      if (!store) {
        return res.status(404).json({ error: "Store not found" });
      }

      if (store.owner.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ error: "Not authorized to update products in this store" });
      }

      const product = await Product.findOne({ _id: productId, store: storeId });
      if (!product) {
        return res
          .status(404)
          .json({ error: "Product not found in this store" });
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (price) updateData.price = parseFloat(price);
      if (stock !== undefined) updateData.stock = parseInt(stock);

      // Handle image removal
      if (removeImages && Array.isArray(removeImages)) {
        for (const imageUrl of removeImages) {
          const publicId = imageUrl.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`product-images/${publicId}`);
          product.images = product.images.filter((img) => img !== imageUrl);
        }
      }

      // Handle new image uploads
      if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map((file) =>
          uploadToCloudinary(file.buffer, "product-images"),
        );
        const results = await Promise.all(uploadPromises);
        const newImageUrls = results.map((result) => result.secure_url);
        product.images = [...product.images, ...newImageUrls];
      }

      updateData.images = product.images;

      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        updateData,
        { new: true },
      ).populate("store", "name logo");

      res.status(200).json(updatedProduct);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// DELETE /api/stores/:storeId/products/:productId - Delete product (Store Owner)
router.delete(
  "/:storeId/products/:productId",
  authenticateUser,
  async (req, res) => {
    try {
      const { storeId, productId } = req.params;

      // Verify store exists and user owns it
      const store = await Store.findById(storeId);
      if (!store) {
        return res.status(404).json({ error: "Store not found" });
      }

      if (store.owner.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ error: "Not authorized to delete products from this store" });
      }

      const product = await Product.findOne({ _id: productId, store: storeId });
      if (!product) {
        return res
          .status(404)
          .json({ error: "Product not found in this store" });
      }

      // Delete images from Cloudinary
      if (product.images && product.images.length > 0) {
        for (const imageUrl of product.images) {
          const publicId = imageUrl.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`product-images/${publicId}`);
        }
      }

      // Remove product from store's products array
      store.products = store.products.filter(
        (id) => id.toString() !== productId,
      );
      await store.save();

      // Delete product
      await Product.findByIdAndDelete(productId);

      res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// GET /api/stores/products/:productId - Get specific product (public)
router.get("/products/:productId", async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId)
      .populate("store", "name logo owner")
      .populate("ratings.user", "username profile.name");

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/stores/products/:productId/rating - Add rating to product
router.post(
  "/products/:productId/rating",
  authenticateUser,
  async (req, res) => {
    try {
      const { productId } = req.params;
      const { rating, review } = req.body;

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Check if user already rated this product
      const existingRatingIndex = product.ratings.findIndex(
        (r) => r.user.toString() === req.user._id.toString(),
      );

      if (existingRatingIndex > -1) {
        // Update existing rating
        product.ratings[existingRatingIndex].rating = rating;
        product.ratings[existingRatingIndex].review = review;
        product.ratings[existingRatingIndex].createdAt = new Date();
      } else {
        // Add new rating
        product.ratings.push({
          user: req.user._id,
          rating,
          review,
          createdAt: new Date(),
        });
      }

      await product.save();

      const populatedProduct = await Product.findById(productId).populate(
        "ratings.user",
        "username profile.name",
      );

      res.status(200).json(populatedProduct);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// ================================
// CART MANAGEMENT ROUTES
// ================================

// POST /api/stores/:storeId/cart/add - Add item to cart
router.post("/:storeId/cart/add", authenticateUser, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const { storeId } = req.params;

    // Verify store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    // Verify product exists and belongs to the store
    const product = await Product.findOne({ _id: productId, store: storeId });
    if (!product) {
      return res.status(404).json({ error: "Product not found in this store" });
    }

    // Check stock availability
    if (product.stock < quantity) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (newQuantity > product.stock) {
        return res
          .status(400)
          .json({ error: "Total quantity exceeds available stock" });
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({ product: productId, quantity });
    }

    cart.updatedAt = new Date();
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      populate: { path: "store", select: "name logo" },
    });

    res.status(200).json(populatedCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stores/cart - Get user's cart
router.get("/cart", authenticateUser, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: "items.product",
      populate: { path: "store", select: "name logo owner" },
    });

    if (!cart) {
      return res.status(200).json({ items: [], totalAmount: 0 });
    }

    // Calculate total amount
    const totalAmount = cart.items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    res.status(200).json({ ...cart.toObject(), totalAmount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/stores/cart/update - Update cart item quantity
router.put("/cart/update", authenticateUser, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      cart.items.splice(itemIndex, 1);
    } else {
      // Verify stock
      const product = await Product.findById(productId);
      if (quantity > product.stock) {
        return res
          .status(400)
          .json({ error: "Quantity exceeds available stock" });
      }
      cart.items[itemIndex].quantity = quantity;
    }

    cart.updatedAt = new Date();
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      populate: { path: "store", select: "name logo" },
    });

    res.status(200).json(populatedCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/stores/cart/remove/:productId - Remove item from cart
router.delete("/cart/remove/:productId", authenticateUser, async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId,
    );

    cart.updatedAt = new Date();
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      populate: { path: "store", select: "name logo" },
    });

    res.status(200).json(populatedCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/stores/cart/clear - Clear entire cart
router.delete("/cart/clear", authenticateUser, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    cart.items = [];
    cart.updatedAt = new Date();
    await cart.save();

    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================================
// ORDER & PAYMENT ROUTES
// ================================

// POST /api/stores/order/create - Create Razorpay order
router.post("/order/create", authenticateUser, async (req, res) => {
  try {
    const { addressId } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
    );

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
          error: `Insufficient stock for ${item.product.name}`,
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
        itemCount: cart.items.length,
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.status(200).json({
      orderId: razorpayOrder.id,
      amount: totalAmount,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID,
      name: "Your Store Name",
      description: "Payment for your order",
      prefill: {
        name: user.profile.name || user.username,
        email: user.email,
        contact: address.phone,
      },
      theme: {
        color: "#3399cc",
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/stores/order/verify - Verify Razorpay payment
router.post("/order/verify", authenticateUser, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      addressId,
    } = req.body;

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
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
    );

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
          error: `Insufficient stock for ${product.name}`,
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
        storeName: (await Store.findById(product.store)).name,
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
      items: orderItems,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================================
// SOCIAL FEATURES ROUTES
// ================================

// POST /api/stores/:storeId/follow - Follow/Unfollow a store
router.post("/:storeId/follow", authenticateUser, async (req, res) => {
  try {
    const { storeId } = req.params;

    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    // Can't follow your own store
    if (store.owner.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ error: "You cannot follow your own store" });
    }

    const user = await User.findById(req.user._id);
    const storeOwner = await User.findById(store.owner);

    // Check if already following
    const isFollowing = user.following.includes(store.owner);

    if (isFollowing) {
      // Unfollow
      user.following = user.following.filter(
        (id) => id.toString() !== store.owner.toString(),
      );
      storeOwner.followers = storeOwner.followers.filter(
        (id) => id.toString() !== req.user._id.toString(),
      );
      await user.save();
      await storeOwner.save();

      res
        .status(200)
        .json({ message: "Unfollowed store successfully", following: false });
    } else {
      // Follow
      user.following.push(store.owner);
      storeOwner.followers.push(req.user._id);
      await user.save();
      await storeOwner.save();

      res
        .status(200)
        .json({ message: "Following store successfully", following: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stores/:storeId/follow-status - Check if user is following a store
router.get("/:storeId/follow-status", authenticateUser, async (req, res) => {
  try {
    const { storeId } = req.params;

    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    const user = await User.findById(req.user._id);
    const isFollowing = user.following.includes(store.owner);

    res.status(200).json({ following: isFollowing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stores/following/stores - Get stores that user is following
router.get("/following/stores", authenticateUser, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const user = await User.findById(req.user._id).populate("following");
    const followingUserIds = user.following.map((u) => u._id);

    const stores = await Store.find({ owner: { $in: followingUserIds } })
      .populate("owner", "username profile.name")
      .populate("products", "name price images")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Store.countDocuments({
      owner: { $in: followingUserIds },
    });

    res.status(200).json({
      stores,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================================
// SEARCH & FILTER ROUTES
// ================================

// GET /api/stores/search/products - Search products across all stores
router.get("/search/products", async (req, res) => {
  try {
    const {
      q,
      minPrice,
      maxPrice,
      category,
      store,
      page = 1,
      limit = 12,
      sort = "createdAt",
      order = "desc",
    } = req.query;

    let query = {};

    // Text search
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Store filter
    if (store) {
      query.store = store;
    }

    // Only show products with stock
    query.stock = { $gt: 0 };

    const sortObj = {};
    sortObj[sort] = order === "desc" ? -1 : 1;

    const products = await Product.find(query)
      .populate("store", "name logo owner")
      .populate("ratings.user", "username profile.name")
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.status(200).json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      filters: { q, minPrice, maxPrice, category, store },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stores/trending/products - Get trending products
router.get("/trending/products", async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    // Get products with high ratings and recent activity
    const products = await Product.aggregate([
      {
        $match: {
          stock: { $gt: 0 },
          ratings: { $exists: true, $not: { $size: 0 } },
        },
      },
      {
        $addFields: {
          averageRating: { $avg: "$ratings.rating" },
          ratingCount: { $size: "$ratings" },
        },
      },
      {
        $sort: {
          averageRating: -1,
          ratingCount: -1,
          createdAt: -1,
        },
      },
      { $limit: parseInt(limit) },
    ]);

    const populatedProducts = await Product.populate(products, [
      { path: "store", select: "name logo owner" },
      { path: "ratings.user", select: "username profile.name" },
    ]);

    res.status(200).json(populatedProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================================
// ANALYTICS ROUTES (Store Owner)
// ================================

// GET /api/stores/:storeId/analytics - Get store analytics (Store Owner)
router.get("/:storeId/analytics", authenticateUser, async (req, res) => {
  try {
    const { storeId } = req.params;

    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    // Check if user owns the store
    if (store.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to view analytics" });
    }

    // Get products count
    const totalProducts = await Product.countDocuments({ store: storeId });

    // Get products with stock
    const inStockProducts = await Product.countDocuments({
      store: storeId,
      stock: { $gt: 0 },
    });

    // Get out of stock products
    const outOfStockProducts = totalProducts - inStockProducts;

    // Get average rating across all products
    const ratingAggregation = await Product.aggregate([
      { $match: { store: mongoose.Types.ObjectId(storeId) } },
      { $unwind: "$ratings" },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$ratings.rating" },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    const averageRating =
      ratingAggregation.length > 0 ? ratingAggregation[0].averageRating : 0;
    const totalRatings =
      ratingAggregation.length > 0 ? ratingAggregation[0].totalRatings : 0;

    // Get top rated products
    const topRatedProducts = await Product.aggregate([
      { $match: { store: mongoose.Types.ObjectId(storeId) } },
      {
        $addFields: {
          averageRating: { $avg: "$ratings.rating" },
          ratingCount: { $size: "$ratings" },
        },
      },
      { $sort: { averageRating: -1, ratingCount: -1 } },
      { $limit: 5 },
    ]);

    // Get recent ratings
    const recentRatings = await Product.aggregate([
      { $match: { store: mongoose.Types.ObjectId(storeId) } },
      { $unwind: "$ratings" },
      { $sort: { "ratings.createdAt": -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "ratings.user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $project: {
          productName: "$name",
          rating: "$ratings.rating",
          review: "$ratings.review",
          createdAt: "$ratings.createdAt",
          userName: { $arrayElemAt: ["$user.username", 0] },
        },
      },
    ]);

    res.status(200).json({
      totalProducts,
      inStockProducts,
      outOfStockProducts,
      averageRating: parseFloat(averageRating.toFixed(2)),
      totalRatings,
      topRatedProducts,
      recentRatings,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================================
// WISHLIST ROUTES
// ================================

// POST /api/stores/wishlist/add/:productId - Add product to wishlist
router.post("/wishlist/add/:productId", authenticateUser, async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const user = await User.findById(req.user._id);

    // Check if product already in wishlist (assuming you add wishlist array to User model)
    if (!user.wishlist) {
      user.wishlist = [];
    }

    const isInWishlist = user.wishlist.includes(productId);

    if (isInWishlist) {
      // Remove from wishlist
      user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
      await user.save();
      res
        .status(200)
        .json({ message: "Removed from wishlist", inWishlist: false });
    } else {
      // Add to wishlist
      user.wishlist.push(productId);
      await user.save();
      res.status(200).json({ message: "Added to wishlist", inWishlist: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stores/wishlist - Get user's wishlist
router.get("/wishlist", authenticateUser, async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;

    const user = await User.findById(req.user._id).populate({
      path: "wishlist",
      populate: {
        path: "store",
        select: "name logo",
      },
      options: {
        limit: limit * 1,
        skip: (page - 1) * limit,
      },
    });

    const total = user.wishlist ? user.wishlist.length : 0;

    res.status(200).json({
      products: user.wishlist || [],
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
