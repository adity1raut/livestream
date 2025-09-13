import Store from '../models/Store.models.js';

const verifyStoreOwnership = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    
    // Find the store
    const store = await Store.findById(storeId);
    
    if (!store) {
      return res.status(404).json({ 
        success: false, 
        message: "Store not found" 
      });
    }

    // Check if the authenticated user owns this store
    if (store.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. You don't own this store" 
      });
    }

    // Add store to request object for use in route handlers
    req.store = store;
    next();
  } catch (error) {
    console.error('Store ownership verification error:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error during store verification" 
    });
  }
};

export default verifyStoreOwnership;
