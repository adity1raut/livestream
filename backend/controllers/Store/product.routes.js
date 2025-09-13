import express from "express";
import authenticateToken from "../../middleware/Auth.js";
import verifyStoreOwnership from "../../middleware/verifyStore.js";
import upload from "../../config/multrer.js";
import cloudinary from "../../config/cloudinary.js";
import Product from "../../models/Product.models.js";
import Store from "../../models/Store.models.js";

const router = express.Router();

// POST /api/stores/:storeId/products - Add product to store (Store Owner)
router.post("/:storeId/products", authenticateToken, upload.array("images", 5), verifyStoreOwnership, async (req, res) => {
  try {
    const { storeId } = req.params;
    const { name, description, price, stock } = req.body;

    // Upload images to Cloudinary
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => 
        cloudinary.uploader.upload(file.path, {
          folder: "product-images",
          resource_type: "auto"
        })
      );
      const results = await Promise.all(uploadPromises);
      imageUrls = results.map(result => result.secure_url);
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
    req.store.products.push(product._id);
    await req.store.save();

    const populatedProduct = await Product.findById(product._id)
      .populate("store", "name logo");

    res.status(201).json(populatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/stores/:storeId/products/:productId - Update product (Store Owner)
router.put("/:storeId/products/:productId", authenticateToken, upload.array("images", 5), verifyStoreOwnership, async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, description, price, stock, removeImages } = req.body;

    const product = await Product.findOne({ _id: productId, store: req.store._id });
    if (!product) {
      return res.status(404).json({ error: "Product not found in this store" });
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
        product.images = product.images.filter(img => img !== imageUrl);
      }
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => 
        cloudinary.uploader.upload(file.path, {
          folder: "product-images",
          resource_type: "auto"
        })
      );
      const results = await Promise.all(uploadPromises);
      const newImageUrls = results.map(result => result.secure_url);
      product.images = [...product.images, ...newImageUrls];
    }

    updateData.images = product.images;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true }
    ).populate("store", "name logo");

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/stores/:storeId/products/:productId - Delete product (Store Owner)
router.delete("/:storeId/products/:productId", authenticateToken, verifyStoreOwnership, async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOne({ _id: productId, store: req.store._id });
    if (!product) {
      return res.status(404).json({ error: "Product not found in this store" });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const imageUrl of product.images) {
        const publicId = imageUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`product-images/${publicId}`);
      }
    }

    // Remove product from store's products array
    req.store.products = req.store.products.filter(id => id.toString() !== productId);
    await req.store.save();

    // Delete product
    await Product.findByIdAndDelete(productId);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
router.post("/products/:productId/rating", authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, review } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if user already rated this product
    const existingRatingIndex = product.ratings.findIndex(
      r => r.user.toString() === req.user._id.toString()
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
        createdAt: new Date()
      });
    }

    await product.save();

    const populatedProduct = await Product.findById(productId)
      .populate("ratings.user", "username profile.name");

    res.status(200).json(populatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;