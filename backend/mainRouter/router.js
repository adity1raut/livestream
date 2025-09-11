import express from "express"
import SignInrouter from "../route/SignIn.js"
import SignUprouter from "../route/SingUp.js"
import ForgetPassrouter from "../route/ForgetPass.js"
import Message from "../route/Chat.js"
import Post from "../route/Post.js"

const router = express() ;

router.use("/api/auth" , SignInrouter)
router.use("/api/auth" , SignUprouter)
router.use("/api/auth" , ForgetPassrouter)

router.use("/api/chat" , Message)
router.use("/api/post" , Post)


export default router ;