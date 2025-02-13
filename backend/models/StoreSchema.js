import mongoose from 'mongoose';

const storeItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5,
    default: 0,
  },
  image: {
    type: String,
    required: true,
  },
  owner: {
   type:String,
    required: true,
    ref: 'User',
    index: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
}, {
  timestamps: true,
});


const StoreItem = mongoose.model('StoreItem', storeItemSchema);

export default StoreItem;
