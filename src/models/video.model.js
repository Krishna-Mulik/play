import mongoose, { Schema } from "mongoose";

const videoSchema = new Schema(
    {
        videoFile: {
            type: String,
            required: [true, "video is required"],
        },
        thumbnail: {
            type: String,
            required: [true, "video-thumbnail is required"],
        },
        title: {
            type: String,
            required: [true, "video-title is required"],
        },
        description: {
            type: String,
            required: [true, "video-description is required"],
        },
        duration: {
            type: Number,
        },
        views: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps }
);

export default Video = mongoose.model("Video", videoSchema);
