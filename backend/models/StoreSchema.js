import mongoose from 'mongoose';

const storeItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  image: {
    type: String,
    required: true
  },
  oner: {
    type: mongoose.Schema.Types.ObjectId,
    ref :"User",
    required: true
  }
}, {
  timestamps: true
});

const StoreItem = mongoose.model('StoreItem', storeItemSchema);

export default StoreItem;
