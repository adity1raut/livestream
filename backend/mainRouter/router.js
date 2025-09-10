import express from "express"
import SignInrouter from "../route/SignIn.js"
import SignUprouter from "../route/SingUp.js"
import ForgetPassrouter from "../route/ForgetPass.js"
import Message from "../route/Chat.js"

const router = express() ;

router.use("/api/auth" , SignInrouter)
router.use("/api/auth" , SignUprouter)
router.use("/api/auth" , ForgetPassrouter)




export default router ;