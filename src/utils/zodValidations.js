import { z } from "zod";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB

const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
];

const imageSchema = z
    .instanceof(File, { message: "File is required." })
    .refine((file) => file.size <= MAX_UPLOAD_SIZE, {
        message: "Max image size is 5MB.",
    })
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
        message: "Only .jpg, .jpeg, .png and .webp formats are accepted.",
    });

export const UserSchema = z.object({
    fullname: z.string().min(1, "Full name is required"),
    email: z.email(),
    avatar: z.string(),
    coverImage: imageSchema.optional(),
    password: z.string(),
});
