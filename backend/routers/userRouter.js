import { Router } from "express";
import userController from "../controllers/userController.js";

const userRouter = Router();
userRouter.post("/check", userController.checkUserExist);
userRouter.post("/checkusername", userController.checkUserExist);
userRouter.post("/register", userController.createUser);
userRouter.post("/login", userController.loginUser);
userRouter.get("/checkauth", userController.checkAuthentication);
userRouter.post("/logout", userController.logout);
userRouter.post("/forgot-password", userController.forgotPassword);
userRouter.post("/reset-password/:verifyToken", userController.resetPassword);
export default userRouter;
