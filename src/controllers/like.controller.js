import Like from "../models/like.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { toggleLikeSchema } from "../utils/zodValidations.js";

export const toggleLike = asyncHandler(async (req, res) => {
    const { _id: likedBy } = req.user;
    const zodResult = toggleLikeSchema.safeParse(req.body);

    if (zodResult.error) {
        console.error("invalid likeSchema: ", zodResult.error);
        throw new ApiError(404, "Invalid like type or id");
    }

    const { type, id } = zodResult.data;

    console.log(`type: ${type}, id: ${id}`);

    let like = await Like.findOne({
        likedBy: likedBy,
    });

    if (!like) {
        like = await Like.create({
            likedBy: likedBy,
        });
    }

    like[type] = like[type] ? "" : id;
    const updatedLike = await like.save(
        { validateBeforeSave: false },
        { new: true }
    );

    console.log(updatedLike, "updated ike");

    res.status(200).json(like);
});
