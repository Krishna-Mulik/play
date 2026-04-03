import asyncHandler from "../utils/asyncHandler.js";
import Playlist from "../models/playlist.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { createPlaylistSchema } from "../utils/zodValidations.js";
import mongoose from "mongoose";
import { log } from "console";

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

export const getAllUserPlaylists = asyncHandler(async (req, res) => {
    const { _id } = req.user;

    const playlists = await Playlist.find({
        owner: _id,
    });

    res.status(200).json(
        new ApiResponse(200, playlists, "users playlists fetched successfully")
    );
});

export const deletePlaylistById = asyncHandler(async (req, res) => {
    const { _id } = req.user;

    console.log("in deleteplaylistbyid");

    const { playlistId } = req.params;

    const playlist = await Playlist.findByIdAndDelete(playlistId);

    console.log(playlist);

    res.status(204).json(
        new ApiResponse(204, playlist, "playlist deleted successfully")
    );
});

export const deletePlaylists = asyncHandler(async (req, res) => {
    const { _id } = req.user;

    const { playlists } = req.body;
    console.log("playlists: ", playlists);

    if (!playlists.length) {
        throw ApiError("in valid playlist array");
    }

    const result = await Playlist.deleteMany({
        _id: { $in: playlists },
        owner: _id,
    });

    console.log(result);

    res.status(204).json(new ApiResponse(204, result.deletedCount));
});

export const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { _id } = req.user;

    const { videoId, playlistId } = req.params;

    console.log(videoId, playlistId, "removevidoefromplaylist");

    if (!videoId || !playlistId) {
        throw new ApiError(
            404,
            "invalid inputs for removing video from playlist"
        );
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: _id,
        },
        {
            $pull: { videos: new mongoose.Types.ObjectId(videoId) },
        },
        { new: true }
    );

    console.log(updatedPlaylist);

    if (updatedPlaylist && updatedPlaylist.videos.length === 0) {
        await Playlist.findByIdAndDelete(playlistId);
    }

    res.status(204).send(204);
});

export const getUserPlaylists = asyncHandler(async (req, res) => {
    const { _id: owner } = req.user;

    const playLists = await Playlist.find({ owner: owner });

    res.status(200).json(playLists);
});
