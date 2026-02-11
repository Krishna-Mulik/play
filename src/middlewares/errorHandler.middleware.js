import ApiError from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).send(err.message);
    }

    return res.status(500).send(err.message);
};

export default errorHandler;
