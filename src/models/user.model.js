import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
    ACCESS_TOKEN_EXPIRY,
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRY,
    REFRESH_TOKEN_SECRET,
} from "../constants.js";
import { required, trim } from "zod/mini";

const userSchema = new Schema(
    {
        userName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        fullName: {
            type: String,
            required: [true, "name is required"],
            unique: [true, "name already exists"],
            lowercase: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            require: [true, "email is required"],
            lowercase: true,
            trim: true,
        },
        avatar: {
            type: String,
            required: true,
        },
        coverImage: {
            type: String,
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video",
            },
        ],
        password: {
            type: String,
            required: [true, "password is required"],
        },
        refreshToken: {
            type: String,
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordValid = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAccessToken = function () {
    console.log(ACCESS_TOKEN_SECRET, ACCESS_TOKEN_EXPIRY, "access token check");
    return jwt.sign(
        {
            userId: this.id,
            username: this.username,
            fullname: this.fullname,
            email: this.email,
        },
        ACCESS_TOKEN_SECRET,
        {
            expiresIn: ACCESS_TOKEN_EXPIRY,
        }
    );
};

userSchema.methods.generateRefereshToken = function () {
    return jwt.sign({ userId: this._id }, REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRY,
    });
};

userSchema.methods.generateAccessAndRefreshTokens = async function () {
    const accessToken = this.generateAccessToken();
    const refreshToken = this.generateRefereshToken();

    this.refreshToken = refreshToken;
    await this.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};

const User = mongoose.model("User", userSchema);
export default User;
