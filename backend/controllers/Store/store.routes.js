import cloudinary from "../../config/cloudinary.js";
import Product from "../../models/Product.models.js";
import Store from "../../models/Store.models.js";
import User from "../../models/User.models.js";

// GET /api/stores - Get all stores (public)
export async function getAllStores (req, res) {
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
};

// GET /api/stores/:id - Get specific store (public)
export async function getStoreById (req, res) {
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
};

// POST /api/stores - Create new store
export async function createStore (req, res) {
  try {
    const { name, description } = req.body;

    // Check if user already has a store
    const existingStore = await Store.findOne({ owner: req.user._id });
    if (existingStore) {
      return res.status(400).json({ error: "User already has a store" });
    }

    let logoUrl = "";
    if (req.file) {
      try {
        // Convert buffer to base64
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: "store-logos",
          resource_type: "auto"
        });
        logoUrl = result.secure_url;
      } catch (cloudinaryError) {
        return res.status(500).json({ error: "Failed to upload logo" });
      }
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
};

// PUT /api/stores/:id - Update store
export async function updateStore (req, res) {
  try {
    const { name, description } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    // First get the store to check for existing logo
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    // Handle logo upload
    if (req.file) {
      // Delete old logo from Cloudinary if exists
      if (store.logo) {
        try {
          const publicId = store.logo.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`store-logos/${publicId}`);
        } catch (cloudinaryError) {
          // Silently handle error
        }
      }
      
      try {
        // Convert buffer to base64
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: "store-logos",
          resource_type: "auto"
        });
        updateData.logo = result.secure_url;
      } catch (cloudinaryError) {
        return res.status(500).json({ error: "Failed to upload new logo" });
      }
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
};

// DELETE /api/stores/:id - Delete store
export async function deleteStore (req, res) {
  try {
    // Delete all products associated with this store
    await Product.deleteMany({ store: req.store._id });

    // Delete logo from Cloudinary if exists
    if (req.store.logo) {
      try {
        const publicId = req.store.logo.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`store-logos/${publicId}`);
      } catch (cloudinaryError) {
        // Silently handle error
      }
    }

    // Remove store reference from user
    await User.findByIdAndUpdate(req.user._id, { $unset: { store: 1 } });

    await Store.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Store deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/stores/user/:userId - Get user's store
export async function getUserStore (req, res) {
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
};

// GET /api/stores/:id/products - Get all products of a store
export async function getStoreProducts (req, res) {
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
};

// GET /api/stores/my/store - Get current user's store
export async function getCurrentUserStore (req, res) {
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
};
