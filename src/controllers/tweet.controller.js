import Tweet from "../models/tweet.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createTweet = asyncHandler(async (req, res) => {
    const { _id: owner } = req.user;

    const { content } = req.body;

    if (!content?.trim()) {
        throw new ApiError(400, "invalid content");
    }

    const tweet = await Tweet.create({
        owner,
        content,
    });

    res.status(201).json(
        new ApiResponse(201, tweet, "tweet created successfully")
    );
});

export const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId?.trim()) {
        throw new ApiError(400, "invalid user id");
    }

    const tweets = await Tweet.find({
        owner: userId,
    });

    res.status(200).json(
        new ApiResponse(200, tweets, "user tweets fetched successfully")
    );
});

export const updateTweet = asyncHandler(async (req, res) => {
    const { _id: owner } = req.user;

    const { tweetId } = req.params;

    const { content } = req.body;

    if (!tweetId?.trim() || !content?.trim()) {
        throw new ApiError(400, "invalid tweetId");
    }

    const updatedTweet = await Tweet.findOneAndUpdate(
        {
            _id: tweetId,
            owner,
        },
        {
            content: content,
        },
        { new: true }
    );

    res.status(200).json(
        new ApiResponse(200, updatedTweet, "tweet updated successfully")
    );
});

export const deleteTweet = asyncHandler(async (req, res) => {
    const { _id: owner } = req.user;
    const { tweetId } = req.params;

    if (!tweetId?.trim()) {
        throw new ApiError(400, "invalid tweet id");
    }

    await Tweet.findOneAndDelete({
        _id: tweetId,
        owner,
    });

    res.send(204);
});
