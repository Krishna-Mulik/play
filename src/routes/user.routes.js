import { Router } from "express";
import {
    loginUser,
    logout,
    refreshTokens,
    registerUser,
} from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js";
import auth from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.post(
    "/register",

    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    registerUser
);

userRouter.post("/login", upload.none(), loginUser);

userRouter.post("/logout", auth, logout);

userRouter.post("/refreshToken", auth, refreshTokens);

export default userRouter;
