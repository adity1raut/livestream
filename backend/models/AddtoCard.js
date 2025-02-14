import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StoreItem',
        required: true,
      },
      title: String,
      price: Number,
      quantity: {
        type: Number,
        default: 1,
      },
      image: String,
    }
  ]
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
