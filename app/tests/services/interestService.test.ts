import { list } from "@/services/interestService"
import { Request } from "express"

let req: Partial<Request>

describe("List interests tests SUCCESS", () => {
    it("Should return exactly 3 interests when limit parameter specified", async () => {
        req = {
            offset: 0,
            limit: 3
        }
        const result = await list(req as Request);
        expect(result.length).toBe(3);
        result.forEach((interest) => {
            expect(typeof interest.title).toBe("string")
        })
    })
    it("Should return filtered interests", async () => {
        req = {
            dbFilter: [{
                prefix: "eq",
                field: "title",
                value: "art",
            }]
        }
        const result = await list(req as Request);
        expect(result.length).toBe(1);
        result.forEach((interest) => {
            expect(interest.title).toBe("Art")
        })
    })
})
