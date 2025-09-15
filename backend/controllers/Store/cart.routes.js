import Cart from "../../models/Cart.models.js";
import Product from "../../models/Product.models.js";
import Store from "../../models/Store.models.js";

// POST /api/stores/:storeId/cart/add - Add item to cart
export async function addToCart(req, res) {
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

    // Calculate total amount
    const totalAmount = populatedCart.items.reduce((total, item) => {
      if (
        item.product &&
        typeof item.product.price === "number" &&
        typeof item.quantity === "number"
      ) {
        return total + item.product.price * item.quantity;
      }
      return total;
    }, 0);

    res.status(200).json({ ...populatedCart.toObject(), totalAmount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// GET /api/stores/cart - Get user's cart
export async function getCart(req, res) {
  try {
    if (!req.user || !req.user._id) {
      console.log("User not authenticated");
      return res.status(401).json({ error: "User not authenticated" });
    }

    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: "items.product",
      populate: { path: "store", select: "name logo owner" },
    });

    if (!cart) {
      console.log("Cart not found for user:", req.user._id);
      return res.status(200).json({ items: [], totalAmount: 0 });
    }

    // Filter out items with null/undefined products (deleted products)
    cart.items = cart.items.filter((item) => item.product != null);

    // Save cart if items were filtered out
    if (cart.items.length !== cart.items.length) {
      await cart.save();
    }

    // Calculate total amount safely
    const totalAmount = cart.items.reduce((total, item) => {
      if (
        item.product &&
        typeof item.product.price === "number" &&
        !isNaN(item.product.price) &&
        typeof item.quantity === "number" &&
        !isNaN(item.quantity)
      ) {
        return total + item.product.price * item.quantity;
      }
      return total;
    }, 0);

    const response = {
      ...cart.toObject(),
      totalAmount: Number(totalAmount.toFixed(2)),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error in getCart:", error);
    res.status(500).json({
      error: error.message,
      type: error.name,
    });
  }
}

// PUT /api/stores/cart/update - Update cart item quantity
export async function updateCartItem(req, res) {
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
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
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

    // Calculate total amount
    const totalAmount = populatedCart.items.reduce((total, item) => {
      if (
        item.product &&
        typeof item.product.price === "number" &&
        typeof item.quantity === "number"
      ) {
        return total + item.product.price * item.quantity;
      }
      return total;
    }, 0);

    res.status(200).json({ ...populatedCart.toObject(), totalAmount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// DELETE /api/stores/cart/remove/:productId - Remove item from cart
export async function removeFromCart(req, res) {
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

    // Calculate total amount
    const totalAmount = populatedCart.items.reduce((total, item) => {
      if (
        item.product &&
        typeof item.product.price === "number" &&
        typeof item.quantity === "number"
      ) {
        return total + item.product.price * item.quantity;
      }
      return total;
    }, 0);

    res.status(200).json({ ...populatedCart.toObject(), totalAmount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// DELETE /api/stores/cart/clear - Clear entire cart
export async function clearCart(req, res) {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    cart.items = [];
    cart.updatedAt = new Date();
    await cart.save();

    res
      .status(200)
      .json({
        message: "Cart cleared successfully",
        items: [],
        totalAmount: 0,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
