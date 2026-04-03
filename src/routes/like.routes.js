import { Router } from "express";
import { toggleLike } from "../controllers/like.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = Router();

router.use(auth);

router.route("/toggle").post(toggleLike);

export default router;
