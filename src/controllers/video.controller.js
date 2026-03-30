import uploadToCloudinary from "../services/cloudinary.js";
import asyncHandler from "../utils/asyncHandler.js";
import { imageFileSchema, uploadVideoSchema } from "../utils/zodValidations.js";
import Video from "../models/video.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

export const uploadVideo = asyncHandler(async (req, res) => {
    const result = uploadVideoSchema.safeParse({
        ...req.body,
        files: req.files,
    });

    if (!result.success) {
        return res.status(400).json(result.error);
    }

    const { files, title, description } = result.data;
    console.log(JSON.stringify(result));

    console.log(JSON.stringify(result.files));

    const videoFile = await uploadToCloudinary(files.videoLocal.path);
    const thumbnail = await uploadToCloudinary(files.thumbnail.path);

    const videoObj = await Video.create({
        videoFile,
        thumbnail,
        title,
        description,
        duration: req.body.duration || 0,
        owner: req.user._id,
    });

    res.status(200).json(videoObj);
});

const getAllVideos = asyncHandler(async (req, res) => {
    const {} = req.query;

    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * limit;
});

export const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const videoObj = await Video.findById(videoId);

    if (!videoObj) {
        return res.status(404).json(new ApiError(404, "video not found"));
    }

    res.status(200).json(new ApiResponse(200, videoObj, "video found"));
});

export const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    await Video.findByIdAndDelete(videoId);

    res.status(204).json(new ApiResponse(204, {}, "video deleted"));
});

export const updateThumbnail = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    console.log(`single file `, req.file);

    const result = imageFileSchema.safeParse(req?.file);

    if (!result.success) {
        throw new ApiError(404, "inavlid thumbnail");
    }

    const videoObj = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                thumbnail: result.data.path,
            },
        },
        { new: true }
    );

    if (!videoObj) {
        throw new ApiError(404, "video not found");
    }

    res.status(201).json(
        new ApiResponse(201, videoObj, "thumbnail updated successfully")
    );
});

export const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const videoObj = await Video.findById(videoId);
    if (!videoObj) {
        throw new ApiError(404, "video not found");
    }

    console.log(`before vidpub status:  ${videoObj.isPublished}`);

    videoObj.isPublished = !videoObj.isPublished;
    await videoObj.save({ validateBeforeSave: false });

    console.log(`after vidpub status:  ${videoObj.isPublished}`);

    res.status(201).json(
        new ApiResponse(
            201,
            { isPublished: videoObj.isPublished },
            "publish status updated"
        )
    );
});
