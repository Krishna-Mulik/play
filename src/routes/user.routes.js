import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import multerMiddleware from "../middlewares/multer.middleware.js";

const userRouter = Router();

userRouter.post("/register", multerMiddleware, registerUser);

export default userRouter;
