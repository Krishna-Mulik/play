import mongoose, { Schema } from "mongoose";
import { string, trim } from "zod";

const playlistSchema = new Schema(
    {
        name: {
            type: string,
            required: [true, "playlist name is mandatory"],
            trim: true,
        },
        discription: {
            type: string,
            trim: true,
        },
        videos: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video",
            },
        ],
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

const Playlist = mongoose.model("Playlist", playlistSchema);

export default Playlist;
