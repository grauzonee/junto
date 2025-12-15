import { getProfile } from "@/requests/user/getProfile"
import { Request, Response } from "express"
import mongoose from "mongoose"
import messages from "@/constants/errorMessages"
import { getMockedResponse, getMockedRequest } from "../../utils"
import { User } from "@/models/User"
import { getUserByToken } from "@/helpers/jwtHelper"
import { setSuccessResponse, setErrorResponse } from "@/helpers/requestHelper"
jest.mock('@/helpers/jwtHelper');
jest.mock("@/helpers/requestHelper")


const res = getMockedResponse();

describe("getProfile() tests: SUCCESS", () => {
    afterEach(() => {
        jest.resetAllMocks();
    })
    it("Should call User.findById if ID is provided in request parameters", async () => {
        const spy = jest.spyOn(User, "findById");
        const id = new mongoose.Types.ObjectId()
        const req = getMockedRequest({}, { id });
        await getProfile(req as Request, res as Response);

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(id);
    })
    it("Should call getUserByToken if ID is not provided in request parameters", async () => {
        const req = getMockedRequest();
        await getProfile(req as Request, res as Response);
        expect(getUserByToken).toHaveBeenCalledTimes(1);
        expect(getUserByToken).toHaveBeenCalledWith(req);
    })
    it("Should call setSuccessResponse if user was found", async () => {
        const user = new User();
        (getUserByToken as jest.Mock).mockImplementation(() => {
            return user;
        });
        const req = getMockedRequest();
        await getProfile(req as Request, res as Response);
        expect(setSuccessResponse).toHaveBeenCalledTimes(1);
        expect(setSuccessResponse).toHaveBeenCalledWith(res, user);
    })
})
describe("getProfile() tests: FAIL", () => {
    afterEach(() => {
        jest.resetAllMocks();
    })
    it("Should return status 500 if exception catched", async () => {
        (getUserByToken as jest.Mock).mockImplementation(() => {
            throw new Error("Invalid token");
        });
        const req = getMockedRequest();
        await getProfile(req as Request, res as Response);
        expect(setErrorResponse).toHaveBeenCalledTimes(1);
        expect(setErrorResponse).toHaveBeenCalledWith(res, 500, {}, [messages.response.SERVER_ERROR()]);
    })
    it("Should return status 404 if user not found", async () => {
        (getUserByToken as jest.Mock).mockImplementation(() => {
            return null;
        });
        const req = getMockedRequest();
        await getProfile(req as Request, res as Response);
        expect(setErrorResponse).toHaveBeenCalledTimes(1);
        expect(setErrorResponse).toHaveBeenCalledWith(res, 404, {}, [messages.response.NOT_FOUND("User")]);

    })
})
