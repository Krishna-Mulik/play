import asyncHandler from "../utils/asyncHandler.js";
import { UserLoginSchema, UserSchema } from "../utils/zodValidations.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/user.model.js";
import uploadToCloudinary from "../services/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import { log } from "console";
import userRouter from "../routes/user.routes.js";
import mongoose from "mongoose";

export const registerUser = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImglocalPath = req.files?.coverImage[0]?.path;

    console.log("files: ", req.files);

    const result = UserSchema.safeParse({
        ...req.body,
        avatarLocalPath,
        coverImglocalPath,
    });

    if (!result.success) {
        throw new ApiError(400, result.error.message);
    }

    const { userName, fullName, email, password } = result.data;

    const fetchUser = await User.find({ email });
    if (fetchUser.length) throw new ApiError(400, "email already exists");

    const avatar = await uploadToCloudinary(avatarLocalPath);

    let coverImage = "";
    if (coverImglocalPath) {
        coverImage = await uploadToCloudinary(coverImglocalPath);
    }

    const user = await User.create({
        userName,
        fullName,
        email,
        password,
        avatar,
        coverImage,
    });

    console.log(`mongoseuser ${user}`);

    const createdUser = user.toObject();
    delete createdUser.password;
    delete createdUser.refreshToken;

    const token = user.generateAccessToken();

    return res.status(201).json({
        ...new ApiResponse(201, createdUser, "User registered Successfully"),
        token,
    });
});

export const loginUser = asyncHandler(async (req, res) => {
    const result = UserLoginSchema.safeParse(req.body);

    if (!result.success) {
        throw new ApiError(400, `missing data: ${result.error.message}`);
    }

    const { userName, email, password } = result.data;

    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "No User with provide email");

    const isPasswordMatch = await user.isPasswordValid(password);

    if (!isPasswordMatch) throw new ApiError(401, "Invalid password");

    const { accessToken, refreshToken } =
        await user.generateAccessAndRefreshTokens();

    const filteredUser = user.toObject();
    delete filteredUser.password;

    const cookieOptions = {
        httpOnly: true,
        secure: true,
    };

    res.status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json({
            ...new ApiResponse(200, filteredUser, "User Found"),
            accessToken,
            refreshToken,
        });
});

export const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshToken: null },
        },
        { new: true }
    );

    const cookieOptions = {
        httpOnly: true,
        secure: true,
    };

    res.status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json({
            ...new ApiResponse(200, {}, "user logged out"),
        });
});

export const refreshTokens = asyncHandler(async (req, res) => {
    const { _id } = req.user;

    const user = await User.findById(_id);

    const { accessToken, refreshToken } = user.generateAccessAndRefreshTokens();

    const cookieOptions = {
        httpOnly: true,
        secure: true,
    };

    res.status(200)
        .cookie("accessToken", accessToken)
        .cookie("refreshToken", refreshToken)
        .json({
            ...ApiResponse(
                200,
                { accessToken, refreshToken },
                "tokens refreshed"
            ),
        });
});

export const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = User.findById(_id);

    const isPassword = user.isPasswordValid(oldPassword);
    if (!isPassword) throw new ApiError(400, "Invalid Password");

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "Password Changed"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
    res.status(200).json(
        new ApiResponse(200, req.user, "user fetched successfully")
    );
});

export const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    await User.findByIdAndUpdate(req.user._id, {
        $set: { fullName, email },
    });

    res.status(200).json(
        new ApiResponse(200, {}, "user account updated successfully")
    );
});

export const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req?.file?.path;
    if (!avatarLocalPath) throw new ApiError(400, "Invalid Avatar");

    const avatar = await uploadToCloudinary(avatarLocalPath);
    if (!avatar) {
        console.error("avatar failed to upload on cloudinary");
        throw new ApiError(500, "Error Uploading to Avatar");
    }

    const user = await User.findOneAndUpdate(
        req.user._id,
        {
            $set: { avatar: avatar.url },
        },
        { new: true }
    );

    res.status(200).json(
        new ApiResponse(
            200,
            { avatar: user?.avatar },
            "avatar updated successfully"
        )
    );
});

export const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (username?.trim()) {
        throw new ApiError("400", "invalid username");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase(),
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo",
            },
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers",
                },
                channelSubscribedToCount: {
                    $size: "$subscribedTo",
                },
                isSbuscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $project: {
                userName: 1,
                fullName: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                subscribersCount: 1,
                channelSubscribedToCount: 1,
                isSbuscribed: 1,
            },
        },
    ]);

    console.log(`channel profile: `, channel);

    if (!channel?.length) {
        console.log("getUserChannerlProfile Aggrigation: ", channel);
        throw new ApiError(404, "channel does not exists");
    }

    res.status(200).json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    );
});

export const addVideoToWatchHistory = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $addToSet: { watchHistory: videoId },
        },
        { new: true }
    );

    res.status(201).json(
        new ApiResponse(
            201,
            user.watchHistory,
            `${videoId} added to watchHistory`
        )
    );
});

export const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        userName: 1,
                                        email: 1,
                                        avatar: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $unwind: "$owner",
                    },
                ],
            },
        },
    ]);

    res.status(200).json(
        new ApiResponse(200, user.at(0).watchHistory, "user watch history")
    );
});
