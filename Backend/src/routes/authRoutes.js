import express from "express"
import {SignUp,Login,Logout,AllUsers,GetUser,updateUser,deleteUser,verifyEmail,resendVerification} from "../controllers/authController.js"
import { forgotPassword, resetPassword } from "../controllers/passwordResetController.js"
import authantication from "../middleware/authMiddleware.js"
import  { userMiddlware, adminMiddlware } from "../middleware/Adminmiddle.js"
const AuthRoute = express.Router()

AuthRoute.post('/signup',SignUp)
AuthRoute.post('/resend-verification', resendVerification)
AuthRoute.get('/verify-email/:token', verifyEmail)
AuthRoute.post('/login',Login)
AuthRoute.post('/forgot-password', forgotPassword)
AuthRoute.post('/reset-password/:token', resetPassword)
AuthRoute.get("/logout",Logout)
AuthRoute.get("/users",authantication,adminMiddlware, AllUsers)
AuthRoute.get("/user/:id",authantication,GetUser)
AuthRoute.put("/user/:id",authantication,updateUser)
AuthRoute.delete("/user/:id",authantication,deleteUser)

export default AuthRoute