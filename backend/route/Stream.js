import express from "express";
import { createStream, endStream, getAllLiveStreams, getStreamById, getUserStreams, joinStream, leaveStream, sendChatMessage } from "../controllers/Stream/steam.router";
import authenticateToken from "../middleware/Auth";



const router = express.Router();

router.post("/create", authenticateToken, createStream );
router.get("/live", authenticateToken
    , getAllLiveStreams );
router.get("/:id",authenticateToken ,  getStreamById );
router.put("/:id/end", authenticateToken, endStream );
router.post("/:id/join", authenticateToken, joinStream)
router.post("/:id/leave", authenticateToken, leaveStream )
router.post("/:id/chat", authenticateToken, sendChatMessage)
router.get("/user/my-streams", authenticateToken,getUserStreams )
router.get("/:id/analytics", authenticateToken, endStream )

export default router;