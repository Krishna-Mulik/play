import { Router } from "express";
import {
    createPlayList,
    getPlaylistById,
    getAllUserPlaylists,
    deletePlaylistById,
    deletePlaylists,
    removeVideoFromPlaylist,
} from "../controllers/playlist.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = Router();

router.use(auth);

router.route("/").get(getAllUserPlaylists);

router.post("/create", createPlayList);

router.delete("/deletemany", deletePlaylists);

router.route("/remove/:videoId/:playlistId").delete(removeVideoFromPlaylist);

router.route("/:playlistId").get(getPlaylistById).delete(deletePlaylistById);

export default router;
