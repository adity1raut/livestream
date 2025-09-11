
import exprees from "express"
import authenticateToken from "../middleware/Auth.js"
import { CreatePost , getFeed , SinglePost , UpdatePost , DeletePost , likePost , addComment , deleteComment , getUserpost , searchByhashtag } from "../controllers/Post/Post.js";
const router = exprees.Router();

router.post("/create" ,  authenticateToken ,CreatePost)
router.get("/feed" , authenticateToken , getFeed)
router.get("/:postId" , authenticateToken ,  SinglePost)
router.put("/:postId" ,authenticateToken , UpdatePost)
router.delete("/:postId",authenticateToken , DeletePost)
router.post("/:postId/like", authenticateToken , likePost )
router.post("/:postId/comment", authenticateToken , addComment)
router.delete("/:postId/comment/:commentId", authenticateToken , deleteComment)
router.get("/user/:userId", authenticateToken , getUserpost)
router.get("/search/:query",authenticateToken , searchByhashtag)

export default router ;