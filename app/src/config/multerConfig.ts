import multer from "multer"
import path from 'path';
import { Request } from 'express';
import fs from 'fs';

export const getImageUploadPath = (): string => {
    const uploadPath = path.join(__dirname, '../../', 'uploads');
    fs.mkdirSync(uploadPath, { recursive: true });
    return `uploads/`;
}

export const upload = multer({
    storage: multer.diskStorage({
        destination: (req: Request, file, cb) => {

            cb(null, getImageUploadPath());
        },
        filename: (req, file, cb) => {
            const uniqueName = `${Date.now()}-${file.originalname}`;
            cb(null, uniqueName);
        }
    })
});
