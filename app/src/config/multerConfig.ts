/**
 * Module for configuring Multer for file uploads.
 *
 * Responsibilities:
 * - Define storage strategy for uploaded files
 * - Generate unique filenames for uploads
 * - Create user-specific upload directories
 * 
 * @packageDocumentation
 */

import multer from "multer"
import path from 'path';
import { Request } from 'express';
import fs from 'fs';
import crypto from "node:crypto"

/**
 * Generates the upload path for a user's images under the `uploads/{userId}` directory.
 * 
 * @param {Request} req 
 * @returns path - Path to the user's upload directory
 */
export const getImageUploadPath = (req: Request): string => {
    const userId = req.user?.id;
    const uploadPath = path.join(__dirname, '../../', 'uploads', userId);
    fs.mkdirSync(uploadPath, { recursive: true });
    return `uploads/${userId}`;
}

/**
 * Multer upload configuration.
 */
export const upload = multer({
    storage: multer.diskStorage({
        destination: (req: Request, file, cb) => {
            cb(null, getImageUploadPath(req));
        },
        filename: (req, file, cb) => {
            const suffix = crypto.randomBytes(5).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 5);
            const ext = path.extname(file.originalname) || "";
            const uniqueName = `${Date.now()}_${suffix}${ext}`;
            cb(null, uniqueName);
        }
    })
});
