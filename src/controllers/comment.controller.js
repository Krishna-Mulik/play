import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import Comment from "../models/comment.model.js";
import ApiResponse from "../utils/ApiResponse.js";

export const addComments = asyncHandler(async (req, res) => {
    const { _id: owner } = req.user;

    const { videoId } = req.params;
    const { content } = req.body;

    if (!videoId?.trim() || !content?.trim()) {
        console.error("invalid video id or content", videoId, content);
        throw new ApiError(400, "invalid video id or content");
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: owner,
    });

    res.status(200).json(new ApiResponse(200, comment, "comment successfully"));
});

export const getVideoComments = asyncHandler(async (req, res) => {
    const { _id: owner } = req.user;

    const { videoId } = req.params;

    if (!videoId?.trim()) {
        console.error("invalid video id ", videoId, content);
        throw new ApiError(400, "invalid video id");
    }

    const comments = await Comment.find({
        owner: owner,
        video: videoId,
    });

    res.status(200).json(
        new ApiResponse(200, comments, "comments fetched successfully")
    );
});

export const deleteComment = asyncHandler(async (req, res) => {
    const { _id: owner } = req.user;
    const { commentId } = req.params;

    if (!commentId?.trim()) {
        console.error("commentId not present");
        throw new ApiError(400, "commentId not present");
    }

    await Comment.findOneAndDelete({
        _id: commentId,
        owner: owner,
    });

    res.status(204).send(204);
});

export const updateComment = asyncHandler(async (req, res) => {
    const { _id: owner } = req.user;
    const { commentId } = req.params;
    const { content } = req.body;

    if (!commentId?.trim() || !content?.trim()) {
        console.error("commentId not present or content is empty");
        throw new ApiError(400, "commentId not present or content is empty");
    }

    const updateComment = await Comment.findOneAndUpdate(
        {
            _id: commentId,
            owner: owner,
        },
        {
            content: content,
        },
        { new: true }
    );

    res.status(200).json(
        new ApiResponse(200, updateComment, "comment updated successfully.")
    );
});
