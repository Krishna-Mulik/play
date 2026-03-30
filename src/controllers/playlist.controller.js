import asyncHandler from "../utils/asyncHandler.js";
import Playlist from "../models/playlist.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { createPlaylistSchema } from "../utils/zodValidations.js";

export const createPlayList = asyncHandler(async (req, res) => {
    console.log(req.body);

    const result = createPlaylistSchema.safeParse(req.body);

    console.log(result);

    if (result.error) {
        throw new ApiError(400, "zod: " + result.error.message);
    }

    const { _id } = req.user;
    const { name, description, videos } = result.data;

    const createdPlaylist = await Playlist.create({
        name,
        description,
        owner: _id,
        videos,
    });

    if (!createdPlaylist) {
        throw new ApiError(500, "playlist creation failed");
    }

    res.status(200).json(
        new ApiResponse(200, createdPlaylist, "playlist created")
    );
});

export const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    console.log("param: ", playlistId);

    if (!playlistId && !playlistId.trim()) {
        throw new ApiError(400, "playlistId is required");
    }

    const { _id } = req.user;

    const playlist = await Playlist.find({
        owner: _id,
        _id: playlistId,
    });

    if (!playlist) {
        throw new ApiError(404, "playlist not found");
    }

    res.status(200).json(
        new ApiResponse(200, playlist, "playlist fetched successfully.")
    );
});
