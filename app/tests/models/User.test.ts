import { User } from "@/models/User"
import { Interest } from "@/models/Interest";
import mongoose, { Types } from "mongoose";

describe("Validation", () => {
    it("Interests: Should pass validation if interests array is empty", async () => {
        const user = await User.findOne();
        if (!user) {
            throw new Error("No user found, please check your seeders");
        }
        const updateData = {
            interests: []
        }
        await user.updateProfile(updateData);
        const foundUpdatedUser = await User.findById(user._id);
        if (!foundUpdatedUser) {
            throw new Error("User could not be found after update, check User.test.ts");
        }
        expect(foundUpdatedUser.interests).toEqual([]);
    })

    it("Interests: Should throw exception if interest doesn't exist", async () => {
        const user = await User.findOne();
        if (!user) {
            throw new Error("No user found, please check your seeders");
        }
        const updateData = {
            interests: [new Types.ObjectId()]
        }
        try {
            await user.updateProfile(updateData);
        } catch (error) {

            expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
        }
    })
    it("Interests: Should throw exception if one of interests doesn't exist", async () => {
        const user = await User.findOne();
        if (!user) {
            throw new Error("No user found, please check your seeders");
        }
        const interest = await Interest.findOne();
        if (!interest) {
            throw new Error("No interest found, please check your seeders");
        }
        const updateData = {
            interests: [interest._id, new Types.ObjectId()]
        }
        try {
            await user.updateProfile(updateData);
        } catch (error) {

            expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
        }
    })
    it("Interests: Should update interests if updateData is valid", async () => {
        const user = await User.findOne();
        if (!user) {
            throw new Error("No user found, please check your seeders");
        }
        const interests = await Interest.find().limit(2);
        if (!interests) {
            throw new Error("No interest found, please check your seeders");
        }
        const updateData = {
            interests: interests.map(i => i._id)
        };
        await user.updateProfile(updateData);
        const foundUpdatedUser = await User.findById(user._id);
        if (!foundUpdatedUser) {
            throw new Error("User could not be found after update, check User.test.ts");
        }
        expect(foundUpdatedUser.interests).toEqual(updateData.interests);
    })
})
