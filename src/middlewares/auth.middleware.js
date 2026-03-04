import { ACCESS_TOKEN_SECRET } from "../constants.js";
import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const auth = async (req, res, next) => {
    const token =
        req?.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!token) throw new ApiError(401, "Invalid Token");

    const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET);
    console.log("decodede-token ", decodedToken);

    const user = await User.findById(decodedToken.userId).select("-password");
    if (!user) throw new ApiError(404, "User Not Found");

    req.user = user.toObject();

    next();
};

export default auth;
