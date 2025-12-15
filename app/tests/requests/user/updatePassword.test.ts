import { getMockedRequest, getMockedResponse } from "../../utils";
import { updatePassword } from "@/requests/user/updatePassword";
import { Request, Response } from "express"
import messages from "@/constants/errorMessages"
import { BadInputError } from "@/types/errors/InputError";
import { setErrorResponse } from "@/helpers/requestHelper";

jest.mock("@/helpers/requestHelper")

let res: Partial<Response>;
const password = "newPassword"
const field = "password"
const message = "message"
beforeEach(() => {
    res = getMockedResponse()
})
describe("updatePassword() SUCCESS", () => {
    afterEach(() => {
        jest.resetAllMocks();
    })
    it("Should call updatePassword function", async () => {
        const mockedUser = {
            updatePassword: jest.fn()
        }
        const req = getMockedRequest({ password }, {}, { user: mockedUser })
        await updatePassword(req as Request, res as Response);
        expect(mockedUser.updatePassword).toHaveBeenCalledTimes(1)
        expect(mockedUser.updatePassword).toHaveBeenCalledWith({ password })
    })
    it("Should call setSuccessResponse function if password was updated", async () => {
        const mockedUser = {
            updatePassword: jest.fn()
        }
        const req = getMockedRequest({ password }, {}, { user: mockedUser })
        await updatePassword(req as Request, res as Response);
        expect(mockedUser.updatePassword).toHaveBeenCalledTimes(1)
        expect(mockedUser.updatePassword).toHaveBeenCalledWith({ password })
    })
})
describe("updatePassword() FAIL", () => {
    afterEach(() => {
        jest.resetAllMocks();
    })
    it("Should return status 400 if BadInputError catched", async () => {
        const mockedUser = {
            updatePassword: jest.fn().mockImplementation(() => {
                throw new BadInputError(field, message)
            })
        }
        const req = getMockedRequest({ password }, {}, { user: mockedUser })
        await updatePassword(req as Request, res as Response);
        expect(setErrorResponse).toHaveBeenCalledTimes(1)
        expect(setErrorResponse).toHaveBeenCalledWith(res, 400, {}, [message])
    })
    it("Should return status 500 by default error", async () => {
        const mockedUser = {
            updatePassword: jest.fn().mockImplementation(() => {
                throw new Error(message)
            })
        }
        const req = getMockedRequest({ password }, {}, { user: mockedUser })
        await updatePassword(req as Request, res as Response);
        expect(setErrorResponse).toHaveBeenCalledTimes(1)
        expect(setErrorResponse).toHaveBeenCalledWith(res, 500, {}, [messages.response.SERVER_ERROR()])
    })

})

