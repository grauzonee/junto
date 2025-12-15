import { validateUpdateData } from "@/requests/user/utils"
import { getMockedRequest } from "../../utils"
import { User } from "@/models/User"
import { Request } from "express"
import mongoose from "mongoose"
import messages from "@/constants/errorMessages"

const username = "newUsername"
const email = "newEmail"
const id = new mongoose.Types.ObjectId()
const mockedUser = {
    id
}
beforeEach(() => {
    jest.resetAllMocks();
})
describe("validateUpdateData SUCCESS", () => {
    it("Should call findOne method in user model", async () => {
        const spy = jest.spyOn(User, "findOne");
        const requestData = { username, email };
        const req = getMockedRequest({ ...requestData })
        await validateUpdateData(req as Request)
        expect(spy).toHaveBeenCalledTimes(2);
    })
    it("Should not return error if username doesn't exists", async () => {
        const spy = jest.spyOn(User, "findOne");
        spy.mockImplementation(() => { return undefined })
        const requestData = { username };
        const req = getMockedRequest({ ...requestData })
        const result = await validateUpdateData(req as Request)
        expect(result.error).toBe(null);
        expect(result.field).toBe(null);

    })
    it("Should not return error if email doesn't exists", async () => {
        const spy = jest.spyOn(User, "findOne");
        spy.mockImplementation(() => { return undefined })
        const requestData = { email };
        const req = getMockedRequest({ ...requestData })
        const result = await validateUpdateData(req as Request)
        expect(result.error).toBe(null);
        expect(result.field).toBe(null);

    })
})
describe("validateUpdateData FAIL", () => {

    it("Should return error if username exists", async () => {
        const spy = jest.spyOn(User, "findOne");
        spy.mockResolvedValue(() => { return mockedUser })
        const requestData = { username };
        const req = getMockedRequest({ ...requestData }, {}, { user: mockedUser })
        const result = await validateUpdateData(req as Request)
        expect(result.error).toBe(messages.response.IN_USE("Username"));
        expect(result.field).toBe("username");

    })
    it("Should return error if email exists", async () => {
        const spy = jest.spyOn(User, "findOne");
        spy.mockResolvedValue(() => { return mockedUser })
        const requestData = { email };
        const req = getMockedRequest({ ...requestData }, {}, { user: mockedUser })
        const result = await validateUpdateData(req as Request)
        expect(result.error).toBe(messages.response.IN_USE("Email"));
        expect(result.field).toBe("email");

    })
})
