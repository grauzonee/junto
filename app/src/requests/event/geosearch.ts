import { Request, Response } from "express"
import { geoSearch } from "@/services/eventService";
import { setSuccessResponse } from "@/helpers/requestHelper";
import { asyncHandler } from "@/requests/asyncHandler";
import { CoordinatesSchema } from "@/schemas/http/Event";
import { buildRequestData } from "@/requests/utils";

export const geosearch = asyncHandler(async (req: Request, res: Response) => {
    const data = CoordinatesSchema.parse(req.query);
    const result = await geoSearch(data, buildRequestData(req));
    setSuccessResponse(res, result.map(event => event.toJSON()));
});
