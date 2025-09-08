import { Router, Request, Response } from 'express';
import { upload } from "@/config/multerConfig";

export const router = Router()

router.put(
    '/media', upload.single('media'), async (req: Request, res: Response) => {
        res.json({ success: true, data: req.file })
    }
)
