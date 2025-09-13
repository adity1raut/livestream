import express from "express";
import authenticateToken from "../../middleware/Auth.js";
import verifyStoreOwnership from "../../middleware/verifyStore.js";
import cloudinary from "../../config/cloudinary.js";
import { upload } from "../../config/multrer.js";
import Product from "../../models/Product.models.js";
import Store from "../../models/Store.models.js";
import User from "../../models/User.models.js";

const router = express.Router();

// GET /api/stores - Get all stores (public)
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = search 
      ? { name: { $regex: search, $options: "i" } }
      : {};

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
          select: "username profile.name"
        }
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
router.post("/", authenticateToken, upload.single("logo"), async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if user already has a store
    const existingStore = await Store.findOne({ owner: req.user._id });
    if (existingStore) {
      return res.status(400).json({ error: "User already has a store" });
    }

    let logoUrl = "";
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "store-logos",
        resource_type: "auto"
      });
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

    const populatedStore = await Store.findById(store._id)
      .populate("owner", "username profile.name");

    res.status(201).json(populatedStore);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/stores/:id - Update store
router.put("/:id", authenticateToken, verifyStoreOwnership, upload.single("logo"), async (req, res) => {
  try {
    const { name, description } = req.body;

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
      
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "store-logos",
        resource_type: "auto"
      });
      updateData.logo = result.secure_url;
    }

    const updatedStore = await Store.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("owner", "username profile.name");

    res.status(200).json(updatedStore);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/stores/:id - Delete store
router.delete("/:id", authenticateToken, verifyStoreOwnership, async (req, res) => {
  try {

        // Delete all products associated with this store
    await Product.deleteMany({ store: req.store._id });

    // Delete logo from Cloudinary if exists
    if (req.store.logo) {
      const publicId = req.store.logo.split("/").pop().split(".")[0];
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
    const { page = 1, limit = 12, sort = "createdAt", order = "desc" } = req.query;
    
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
router.get("/my/store", authenticateToken, async (req, res) => {
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

export default router;