import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
    cloud_name: "dujtdrikt",
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (localFilePath) => {
    if (!localFilePath) return null;

    try {
        const uploadResult = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        console.log(`file uploaded on cloudinary: ${uploadResult}`);
        return uploadResult.url;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null;
    }
};

export default uploadToCloudinary;
