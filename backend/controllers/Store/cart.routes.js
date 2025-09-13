import Cart from "../../models/Card.models.js";
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
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (newQuantity > product.stock) {
        return res.status(400).json({ error: "Total quantity exceeds available stock" });
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({ product: productId, quantity });
    }

    cart.updatedAt = new Date();
    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: "items.product",
        populate: { path: "store", select: "name logo" }
      });

    res.status(200).json(populatedCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/stores/cart - Get user's cart
export async function getCart(req, res) {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: "items.product",
        populate: { path: "store", select: "name logo owner" }
      });

    if (!cart) {
      return res.status(200).json({ items: [], totalAmount: 0 });
    }

    // Calculate total amount
    const totalAmount = cart.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);

    res.status(200).json({ ...cart.toObject(), totalAmount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/stores/cart/update - Update cart item quantity
export async function updateCartItem(req, res) {
  try {
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
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
        return res.status(400).json({ error: "Quantity exceeds available stock" });
      }
      cart.items[itemIndex].quantity = quantity;
    }

    cart.updatedAt = new Date();
    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: "items.product",
        populate: { path: "store", select: "name logo" }
      });

    res.status(200).json(populatedCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/stores/cart/remove/:productId - Remove item from cart
export async function removeFromCart(req, res) {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    cart.updatedAt = new Date();
    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: "items.product",
        populate: { path: "store", select: "name logo" }
      });

    res.status(200).json(populatedCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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

    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
