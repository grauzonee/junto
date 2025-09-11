import express from "express";
import { router } from '@/routes/main'
import cors from 'cors'
import { Request, Response } from "express"
import path from "path";

const app = express();

app.use(cors())
app.use(express.json());

app.get("/status", (req: Request, res: Response) => {
    res.json({ message: "Junto API is runnning!" });
});
app.use('/api', router)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
export default app
