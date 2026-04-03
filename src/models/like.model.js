import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
    {
        comment: {
            type: mongoose.Types.ObjectId,
            ref: "Comment",
        },
        tweet: {
            type: mongoose.Types.ObjectId,
            ref: "Tweet",
        },
        video: {
            type: mongoose.Types.ObjectId,
            ref: "Video",
        },
        likedBy: {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

const Like = mongoose.model("Like", likeSchema);

export default Like;
