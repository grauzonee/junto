import { Router, Request, Response } from 'express';
import { upload } from "@/config/multerConfig";

export const router = Router()

router.put(
    '/', upload.single('media'), async (req: Request, res: Response) => {
        res.status(201).json({ success: true, data: req.file })
    }
)
