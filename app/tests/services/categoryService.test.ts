import { Types } from "mongoose"
import { list } from "@/services/categoryService"
import { Request } from "express"
import { Category } from "@/models/Category"

let req: Partial<Request>

describe("List categories tests SUCCESS", () => {
    it("Should call getTree method on Category and pass pagination params", async () => {
        const requestData = {
            pagination: {
                offset: 0,
                limit: 3
            }
        }
        const spy = jest.spyOn(Category, "getTree");

        await list(requestData);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(requestData.pagination.offset, requestData.pagination.limit);
    })
    it("Should return result", async () => {
        const requestData = {
            pagination: {
                offset: 0,
                limit: 3
            }
        }
        const result = await list(requestData);
        expect(result[0]).toMatchObject({
            _id: expect.any(Types.ObjectId),
            title: expect.any(String),
            subcategories: expect.arrayContaining([
                expect.objectContaining({
                    _id: expect.any(Types.ObjectId),
                    title: expect.any(String),
                    parent: expect.any(Types.ObjectId),
                })
            ])
        });
    })
})
