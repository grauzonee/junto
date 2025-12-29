import { Request, Response } from "express"
import { geoSearch } from "@/services/eventService";
import { setSuccessResponse } from "@/helpers/requestHelper";
import { asyncHandler } from "@/requests/asyncHandler";

export const geosearch = asyncHandler(async (req: Request, res: Response) => {
    const result = await geoSearch(req);
    setSuccessResponse(res, result.map(event => event.toJSON()));
});
