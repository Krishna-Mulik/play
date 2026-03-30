import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import Subscription from "../models/subscription.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";

export const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId?.trim()) {
        throw new ApiError(404, `Invalid Channel: ${channelId}`);
    }

    const { _id: userId } = req.user;

    if (!userId) throw new ApiError(404, `User does not exists`);

    const subscription = await Subscription.findOne({
        channel: channelId,
        subscriber: userId,
    });

    if (subscription) {
        const data = await subscription.deleteOne();
        return res.status(204).json(new ApiResponse(204, data, "unbscribed"));
    }

    const subs = await Subscription.findByIdAndUpdate(
        channelId,
        {
            $set: {
                subscriber: userId,
                channel: channelId,
            },
        },
        {
            upsert: true,
            new: true,
        }
    );

    console.log(subscription, "subscription");

    res.status(201).json(new ApiResponse(201, subs, "subscribed"));
});

export const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { _id: userId } = req.user;

    console.log(userId);

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedChannel",
            },
        },
        {
            $unwind: "$subscribedChannel",
        },
        {
            $addFields: {
                channelName: "$subscribedChannel.userName",
                channelEmail: "$subscribedChannel.email",
            },
        },
        {
            $project: {
                subscriber: 1,
                channel: 1,
                channelName: 1,
                channelEmail: 1,
            },
        },
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, subscribedChannels, "subscibed channels"));
});
