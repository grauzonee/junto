import { Request, Response } from "express";
import { list } from "@/services/interestService";

export async function listInterests(req: Request, res: Response) {
  const interests = await list(req);
  res.status(200).json({
    success: true,
    data: interests.map(interest => interest.toJSON()),
  });
}
