import asyncHandler from "../utils/asyncHandler.js";
import { UserSchema } from "../utils/zodValidations.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/user.model.js";
import uploadToCloudinary from "../services/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

export const registerUser = asyncHandler(async (req, res) => {
    const result = UserSchema.safeParse(req.body);
    if (!result.success) {
        throw new ApiError(400, result.error.message);
    }

    const { fullname, email, password } = result.data;

    const fetchUser = await User.find({ email });
    if (fetchUser.length) throw new ApiError(400, "email already exists");

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImglocalPath = req.files?.avatar[0]?.path;

    if (!avatarLocalPath) throw new ApiError(400, "Avatar Image is required");

    const avatar = await uploadToCloudinary(avatarLocalPath);

    let coverImg = "";
    if (coverImglocalPath) {
        coverImg = await uploadToCloudinary(coverImglocalPath);
    }

    const user = await User.create({
        username: req.body.username,
        fullname,
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImg.url,
    }).select("-password -refreshToken");

    const token = user.generateAccessToken();

    return res.status(201).json({
        ...new ApiResponse(201, user, "User registered Successfully"),
        token,
    });
});
