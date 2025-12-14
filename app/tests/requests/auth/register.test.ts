import { getMockedRequest, getMockedResponse } from "../../utils";
import { register } from "@/requests/auth/register";
import messages from "@/constants/errorMessages";
import { Request, Response } from "express"
import { setSuccessResponse, setErrorResponse } from "@/helpers/requestHelper";
import { register as serviceRegister } from "@/services/authService";
import { BadInputError } from "@/types/errors/InputError";
jest.mock("@/helpers/requestHelper")
jest.mock("@/services/authService")

let res: Partial<Response>;
const username = "Username";
const email = "email@email.com"
const password = "SeCrEtPassWORD"

const requestData = { username, email, password }

beforeEach(() => {
    jest.resetAllMocks();
    res = getMockedResponse();
})

describe("register SUCCESS", () => {
    beforeEach(() => {
        (serviceRegister as jest.Mock).mockResolvedValue(requestData);
    })
    it("Should call serviceRegister function", async () => {
        const req = getMockedRequest({ ...requestData })
        await register(req as Request, res as Response);
        expect(serviceRegister).toHaveBeenCalledTimes(1)
        expect(serviceRegister).toHaveBeenCalledWith(requestData)
    })
    it("Should call setSuccessResponse function", async () => {
        const req = getMockedRequest({ ...requestData })
        await register(req as Request, res as Response);
        expect(setSuccessResponse).toHaveBeenCalledTimes(1)
        expect(setSuccessResponse).toHaveBeenCalledWith(res, requestData, 201)

    })
})
describe("register FAIL", () => {
    it("Should return 400 on BadInputError", async () => {
        const errorField = "username";
        const errorMessage = messages.response.IN_USE("Username");

        (serviceRegister as jest.Mock).mockRejectedValue(
            new BadInputError(errorField, errorMessage)
        );
        const req = getMockedRequest({ ...requestData })
        await register(req as Request, res as Response);
        expect(setErrorResponse).toHaveBeenCalledTimes(1)
        expect(setErrorResponse).toHaveBeenCalledWith(res, 400, { [errorField]: errorMessage }, [])

    })
    it("Should return 500 on default error", async () => {

        (serviceRegister as jest.Mock).mockRejectedValue(
            new Error("error")
        );
        const req = getMockedRequest({ ...requestData })
        await register(req as Request, res as Response);
        expect(setErrorResponse).toHaveBeenCalledTimes(1)
        expect(setErrorResponse).toHaveBeenCalledWith(res, 500, {}, [messages.response.SERVER_ERROR()])
    })

})
