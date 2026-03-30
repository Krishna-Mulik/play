import { Router } from "express";
import {
    loginUser,
    logout,
    refreshTokens,
    registerUser,
    updateAvatar,
    getWatchHistory,
    addVideoToWatchHistory,
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

userRouter.use(auth);

userRouter.post("/logout", logout);

userRouter.post("/refreshToken", refreshTokens);

userRouter.post("/updateAvatar", upload.single("avatar"), updateAvatar);

userRouter.get("/watch-history", getWatchHistory);

userRouter.patch("/watch-history/:videoId", addVideoToWatchHistory);

export default userRouter;
