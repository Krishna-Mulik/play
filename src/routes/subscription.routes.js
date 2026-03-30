import { Router } from "express";
import {
    toggleSubscription,
    getSubscribedChannels,
} from "../controllers/subscription.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = Router();

router.use(auth);

router.route("/c/:channelId").post(toggleSubscription);

// Get Channels to Which user has subscribed.
router.get("/", getSubscribedChannels);

export default router;
