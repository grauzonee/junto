import { login as serviceLogin } from "@/services/authService";
import { login } from "@/requests/auth/login";
import { Request, Response } from "express"
import messages from "@/constants/errorMessages";
import { getMockedRequest, getMockedResponse } from "../../utils";
import { BadInputError, NotFoundError } from "@/types/errors/InputError";
import { setSuccessResponse, setErrorResponse } from "@/helpers/requestHelper";
jest.mock("@/helpers/requestHelper")
jest.mock("@/services/authService")

let res: Partial<Response>;
const email = "email@email.com"
const password = "SeCrEtPassWORD"

const requestData = { email, password }

beforeEach(() => {
    jest.resetAllMocks();
    res = getMockedResponse();
})

describe("login SUCCESS", () => {
    beforeEach(() => {
        (serviceLogin as jest.Mock).mockResolvedValue(requestData);
    })
    it("Should call serviceLogin function", async () => {
        const req = getMockedRequest({ ...requestData })
        await login(req as Request, res as Response);
        expect(serviceLogin).toHaveBeenCalledTimes(1)
        expect(serviceLogin).toHaveBeenCalledWith(requestData)

    })
    it("Should call setSuccessResponse function", async () => {
        const req = getMockedRequest({ ...requestData })
        await login(req as Request, res as Response);
        expect(setSuccessResponse).toHaveBeenCalledTimes(1)
        expect(setSuccessResponse).toHaveBeenCalledWith(res, requestData)

    })
})
describe("login FAIL", () => {

    it("Should return 404 if user not found", async () => {

        (serviceLogin as jest.Mock).mockRejectedValue(
            new NotFoundError()
        );
        const req = getMockedRequest({ ...requestData })
        await login(req as Request, res as Response);
        expect(setErrorResponse).toHaveBeenCalledTimes(1)
        expect(setErrorResponse).toHaveBeenCalledWith(res, 404, {}, [messages.response.NOT_FOUND("User")])

    })
    it("Should return 400 in BadInputError", async () => {
        const errorField = "password";
        const errorMessage = messages.response.INVALID("password");

        (serviceLogin as jest.Mock).mockRejectedValue(
            new BadInputError(errorField, errorMessage)
        );
        const req = getMockedRequest({ ...requestData })
        await login(req as Request, res as Response);
        expect(setErrorResponse).toHaveBeenCalledTimes(1)
        expect(setErrorResponse).toHaveBeenCalledWith(res, 400, { [errorField]: errorMessage }, [])

    })
    it("Should return 500 on default error", async () => {

        (serviceLogin as jest.Mock).mockRejectedValue(
            new Error()
        );
        const req = getMockedRequest({ ...requestData })
        await login(req as Request, res as Response);
        expect(setErrorResponse).toHaveBeenCalledTimes(1)
        expect(setErrorResponse).toHaveBeenCalledWith(res, 500, {}, [messages.response.SERVER_ERROR()])

    })
})
