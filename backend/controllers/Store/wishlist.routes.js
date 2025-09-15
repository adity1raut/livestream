import Product from "../../models/Product.models.js";
import User from "../../models/User.models.js";

export async function addToWishlist(req, res) {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const user = await User.findById(req.user._id);

    // Check if product already in wishlist
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
}

export async function getUserWishlist(req, res) {
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
}
