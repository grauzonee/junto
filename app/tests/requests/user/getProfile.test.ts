import { getProfile } from "@/requests/user/getProfile"
import { NextFunction, Request, Response } from "express"
import mongoose from "mongoose"
import messages from "@/constants/errorMessages"
import { getMockedResponse, getMockedRequest } from "../../utils"
import { User } from "@/models/User"
import { getUserByToken } from "@/helpers/jwtHelper"
import { setSuccessResponse, setErrorResponse } from "@/helpers/requestHelper"
jest.mock('@/helpers/jwtHelper');
jest.mock("@/helpers/requestHelper")


const res = getMockedResponse();
const next = jest.fn() as NextFunction;

describe("getProfile() tests: SUCCESS", () => {
    afterEach(() => {
        jest.resetAllMocks();
    })
    it("Should call User.findById if ID is provided in request parameters", async () => {
        const spy = jest.spyOn(User, "findById");
        const id = new mongoose.Types.ObjectId()
        const req = getMockedRequest({}, { id });
        await getProfile(req as Request, res as Response, next);

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(id);
    })
    it("Should call getUserByToken if ID is not provided in request parameters", async () => {
        const req = getMockedRequest();
        await getProfile(req as Request, res as Response, next);
        expect(getUserByToken).toHaveBeenCalledTimes(1);
        expect(getUserByToken).toHaveBeenCalledWith(req);
    })
    it("Should call setSuccessResponse if user was found", async () => {
        const user = new User();
        (getUserByToken as jest.Mock).mockImplementation(() => {
            return user;
        });
        const req = getMockedRequest();
        await getProfile(req as Request, res as Response, next);
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
        await getProfile(req as Request, res as Response, next);
        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(new Error("Invalid token"));
    })
    it("Should return status 404 if user not found", async () => {
        (getUserByToken as jest.Mock).mockImplementation(() => {
            return null;
        });
        const req = getMockedRequest();
        await getProfile(req as Request, res as Response, next);
        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(new Error("User not found"));

    })
})
