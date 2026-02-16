import { interestValidator } from "@/models/user/validators";
import { Types } from "mongoose";
import { Interest } from "@/models/Interest";

describe("User validators", () => {
    describe("interestValidator", () => {
        it("should return true if value is empty", async () => {
            const result = await interestValidator([]);
            expect(result).toBe(true);
        });

        it("should return true if all interests exist", async () => {
            const mockCountDocuments = jest.fn().mockResolvedValue(2);
            (Interest.countDocuments as jest.Mock) = mockCountDocuments;

            const result = await interestValidator([new Types.ObjectId(), new Types.ObjectId()]);
            expect(result).toBe(true);
        });

        it("should return false if some interests do not exist", async () => {
            const mockCountDocuments = jest.fn().mockResolvedValue(1);
            (Interest.countDocuments as jest.Mock) = mockCountDocuments;

            const result = await interestValidator([new Types.ObjectId(), new Types.ObjectId()]);
            expect(result).toBe(false);
        });
    });
});