import { Router } from "express";
import {
    createPlayList,
    getPlaylistById,
} from "../controllers/playlist.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = Router();

router.use(auth);

router.post("/create", createPlayList);

router.route("/:playlistId").get(getPlaylistById);

export default router;
