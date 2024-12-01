import { Router } from "express";
import userController from "../controllers/userController.js";

const userRouter = Router();
userRouter.post("/check", userController.checkUserExist);
userRouter.post("/checkusername", userController.checkUserExist);
userRouter.post("/register", userController.createUser);
userRouter.post("/login", userController.loginUser);
userRouter.get("/checkauth", userController.checkAuthentication);
userRouter.post("/logout", userController.logout);
export default userRouter;
