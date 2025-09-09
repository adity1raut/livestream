import express from 'express';
import Cart from '../../models/AddtoCard.js';
import StoreItem from '../../models/StoreSchema.js';
import authenticateToken from '../middleware/Auth.js';

const router = express.Router();

// **Add to Cart (POST)**
router.post('/add', authenticateToken, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.id; // Extract user ID from token

        const product = await StoreItem.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        // Check if product is already in cart
        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({
                productId,
                title: product.title,
                price: product.price,
                image: product.image,
                quantity
            });
        }

        await cart.save();
        res.status(201).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// **Get Cart Items (GET)**
router.get('/', authenticateToken, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
        if (!cart) return res.status(200).json({ items: [] });
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// **Remove Item from Cart (DELETE)**
router.delete('/remove/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        let cart = await Cart.findOne({ userId });

        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.items = cart.items.filter(item => item.productId.toString() !== req.params.id);
        await cart.save();

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
