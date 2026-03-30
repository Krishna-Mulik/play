import { Router } from "express";
import auth from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import {
    getVideoById,
    uploadVideo,
    deleteVideo,
    updateThumbnail,
    togglePublishStatus,
} from "../controllers/video.controller.js";

const router = Router();

router.use(auth);

router.route("/upload").post(
    upload.fields([
        {
            name: "video",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        },
    ]),
    uploadVideo
);

router.route("/:videoId").get(getVideoById).delete(deleteVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

router
    .route("/thumbnail/:videoId")
    .patch(upload.single("thumbnail"), updateThumbnail);

// router.get("/", getAllVideos);

export default router;
