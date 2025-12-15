import { Request, Response } from "express"
import { geoSearch } from "@/services/eventService";
import { setErrorResponse, setSuccessResponse } from "@/helpers/requestHelper";
import { ZodError } from "zod";
import messages from "@/constants/errorMessages"
import * as z from "zod"

export async function geosearch(req: Request, res: Response) {
    try {
        const result = await geoSearch(req);
        setSuccessResponse(res, result.map(event => event.toJSON()));
    } catch (error) {
        if (error instanceof ZodError) {
            const flattenedError = z.flattenError(error);
            setErrorResponse(res, 400, flattenedError.fieldErrors, flattenedError.formErrors);
            return;
        }
        setErrorResponse(res, 500, {}, [messages.response.SERVER_ERROR()]);
    }
}
