import { Request, Response } from "express";
import { list } from "@/services/categoryService";

export async function listCategories(req: Request, res: Response) {
  const categories = await list(req);
  res.status(200).json({
    success: true,
    data: categories.map(category => category.toJSON()),
  });
}
