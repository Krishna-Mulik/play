import { email, file, z } from "zod";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB

const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
];

const fileSchema = z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string().optional(),
    mimetype: z.string(),
    size: z.number(),
    path: z.string(),
});

const imageSchema = z
    .instanceof(File, { message: "File is required." })
    .refine((file) => file.size <= MAX_UPLOAD_SIZE, {
        message: "Max image size is 5MB.",
    })
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
        message: "Only .jpg, .jpeg, .png and .webp formats are accepted.",
    });

export const UserSchema = z.object({
    userName: z.string().min(1, "Full name is required"),
    fullName: z.string().min(1, "Full name is required"),
    email: z.email(),
    avatarLocalPath: z.string(),
    coverImageLocalPath: z.string().optional(),
    password: z.string(),
});

export const UserLoginSchema = UserSchema.pick({
    userName: true,
    email: true,
    password: true,
});

export const videoFileSchema = fileSchema.refine(
    (file) => file.mimetype.startsWith("video/"),
    { message: "invalid video file type" }
);

export const imageFileSchema = fileSchema.refine(
    (file) => file.mimetype.startsWith("image/"),
    { message: "invalid image file format" }
);

export const uploadVideoSchema = z.object({
    title: z.string().min(2),
    description: z.string().min(2),
    files: z
        .object({
            video: z.array(videoFileSchema).min(1),
            thumbnail: z.array(imageFileSchema).min(1),
        })
        .transform((data) => ({
            videoLocal: data.video[0],
            thumbnail: data.thumbnail[0],
        })),
});

export const createPlaylistSchema = z.object({
    name: z.string().min(1),
    description: z.string().trim().optional(),
    videos: z.string().trim(),
});
