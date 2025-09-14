import express from "express";
import authenticateToken from "../middleware/Auth.js";
import verifyStoreOwnership from "../middleware/verifyStore.js";
import { getAllStores , createStore , getStoreById , updateStore , getUserStore , getCurrentUserStore , deleteStore, getStoreProducts} from "../controllers/Store/store.routes.js";
import { addToWishlist, getUserWishlist } from "../controllers/Store/wishlist.routes.js";
import { followStore, getFollowingStores, getFollowStatus } from "../controllers/Store/social.routes.js";
import { getTrendingProducts, searchProducts } from "../controllers/Store/search.routes.js";
import { addProduct, addProductRating, deleteProduct, getProductById, updateProduct } from "../controllers/Store/product.routes.js";
import { createOrder, verifyPayment } from "../controllers/Store/order.routes.js";
import { addToCart, getCart, removeFromCart, updateCartItem , clearCart } from "../controllers/Store/cart.routes.js";
import { getStoreAnalytics } from "../controllers/Store/analytics.routes.js";
import upload from "../config/multrer.js";


const router = express.Router();

// Store routes
router.get("/",  getAllStores);
router.get("/:id" , getStoreById);
router.post("/", authenticateToken, upload.single("logo"), createStore);
router.put("/:id", authenticateToken, upload.single("logo"), updateStore); 
router.delete("/:id", authenticateToken, verifyStoreOwnership, deleteStore);
router.get("/user/:userId", getUserStore);
router.get("/:id/products", getStoreProducts);
router.get("/my/store", authenticateToken, getCurrentUserStore);

router.post("/:storeId/products", authenticateToken, upload.array("images", 5), verifyStoreOwnership, addProduct)
router.put("/:storeId/products/:productId", authenticateToken, upload.array("images", 5), verifyStoreOwnership, updateProduct)
router.delete("/:storeId/products/:productId", authenticateToken, verifyStoreOwnership, deleteProduct )
router.get("/products/:productId" ,getProductById )
router.post("/products/:productId/rating", authenticateToken, addProductRating )


router.post("/:storeId/cart/add", authenticateToken, addToCart)
router.get("/cart", authenticateToken, getCart)
router.put("/cart/update", authenticateToken, updateCartItem )
router.delete("/cart/remove/:productId", authenticateToken, removeFromCart )
router.delete("/cart/clear", authenticateToken, clearCart )


router.post("/wishlist/add/:productId", authenticateToken , addToWishlist)
router.get("/wishlist", authenticateToken , getUserWishlist)


router.post("/order/create", authenticateToken,createOrder )
router.post("/order/verify", authenticateToken, verifyPayment )


router.get("/:storeId/analytics", authenticateToken, verifyStoreOwnership, getStoreAnalytics );


router.post("/:storeId/follow", authenticateToken , followStore )
router.get("/:storeId/follow-status", authenticateToken,getFollowStatus )
router.get("/following/stores", authenticateToken, getFollowingStores )


router.get("/search/products",  searchProducts )
router.get("/trending/products", getTrendingProducts )


export default router;