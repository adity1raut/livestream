import express from "express"
import SignInrouter from "../route/SignIn.js"
import SignUprouter from "../route/SingUp.js"
import ForgetPassrouter from "../route/ForgetPass.js"
import Message from "../route/Chat.js"
import Post from "../route/Post.js"
import Notifications from "../route/Notification.js"
import Store from "../route/Store.js"
import Live from "../route/Stream.js"

const router = express() ;

router.use("/api/auth" , SignInrouter)
router.use("/api/auth" , SignUprouter)
router.use("/api/auth" , ForgetPassrouter)

router.use("/api/chat" , Message)
router.use("/api/posts" , Post)
router.use("/api/notifications" , Notifications)
router.use("/api/stores" , Store)
router.use("/api/stream" , Live)

export default router ;