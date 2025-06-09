import { Router } from "express";
import userController from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import isAdmin from "../middlewares/isAdmin.js";
const userRouter = Router();
userRouter.post("/check", userController.checkUserExist);
userRouter.post("/checkusername", userController.checkUserExist);
userRouter.post("/register", userController.createUser);
userRouter.post("/login", userController.loginUser);
userRouter.get("/checkauth", userController.checkAuthentication);
userRouter.post("/logout", userController.logout);
userRouter.post("/forgot-password", userController.forgotPassword);
userRouter.post("/reset-password/:verifyToken", userController.resetPassword);
userRouter.get("/", isAuthenticated, userController.fetchAllUsers);
userRouter.get("/:userId", isAuthenticated, userController.fetchAUser);
userRouter.delete("/:userId", isAuthenticated, userController.deleteUser);

userRouter.put(
  "/admin/:userId",
  isAuthenticated,
  isAdmin,
  userController.adminEditUser
);
userRouter.put("/:userId", isAuthenticated, userController.editUserProfile);
userRouter.put(
  "/:userId/change-password",
  isAuthenticated,
  userController.changePassword
);
userRouter.put(
  "/admin/:userId",
  isAuthenticated,
  isAdmin,
  userController.adminEditUser
);
export default userRouter;
