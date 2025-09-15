import exprees from "express";
import authenticateToken from "../middleware/Auth.js";
import {
  CreatePost,
  getFeed,
  SinglePost,
  DeletePost,
  likePost,
  addComment,
  getUserpost,
} from "../controllers/Post/Media.js";
const router = exprees.Router();
import upload from "../config/multrer.js";

router.post("/create", upload.single("media"), authenticateToken, CreatePost);
router.get("/feed", authenticateToken, getFeed);
router.get("/:postId", authenticateToken, SinglePost);
router.delete("/:postId", authenticateToken, DeletePost);
router.post("/:postId/like", authenticateToken, likePost);
router.post("/:postId/comment", authenticateToken, addComment);
router.get("/user/:username", authenticateToken, getUserpost);

// router.get("/search/:query",authenticateToken , searchByhashtag)
// router.delete("/:postId/comment/:commentId", authenticateToken , deleteComment)
// router.put("/:postId" ,authenticateToken , UpdatePost)

export default router;
