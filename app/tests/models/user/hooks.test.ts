import { registerSaveHooks } from "@/models/user/hooks";
import bcrypt from 'bcrypt';
import { HydratedUserDoc } from "@/models/user/User";
import { getOneUser } from "../../getters";
const bcryptGenSalt = jest.fn().mockResolvedValue('salt');
const bcryptHash = jest.fn().mockResolvedValue('hashedPassword');
type UserPreSaveHook = (this: HydratedUserDoc, next: jest.Mock) => Promise<void>;

function getRegisteredHooks() {
    const schema = {
        pre: jest.fn()
    };

    registerSaveHooks(schema as never);

    return {
        preSaveHook: schema.pre.mock.calls.find(([hook]) => hook === "save")?.[1] as UserPreSaveHook
    };
}

describe("preSaveHook", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (bcrypt.genSalt as jest.Mock) = bcryptGenSalt;
        (bcrypt.hash as jest.Mock) = bcryptHash;
    });

    it("Should hash password before saving", async () => {
        const { preSaveHook } = getRegisteredHooks();
        const next = jest.fn();
        const user = await getOneUser();
        user.password = 'plainPassword';
        user.isModified = jest.fn().mockReturnValue(true);
        await preSaveHook.call(user, next);

        expect(bcryptGenSalt).toHaveBeenCalledWith(10);
        expect(bcryptHash).toHaveBeenCalledWith('plainPassword', 'salt');
        expect(user.password).toBe('hashedPassword');
        expect(next).toHaveBeenCalled();
    });

    it("Should call next without hashing if password is not modified", async () => {
        const { preSaveHook } = getRegisteredHooks();
        const next = jest.fn();
        const user = await getOneUser();
        user.password = 'plainPassword';
        user.isModified = jest.fn().mockReturnValue(false);
        await preSaveHook.call(user, next);
        expect(bcryptGenSalt).not.toHaveBeenCalled();
        expect(bcryptHash).not.toHaveBeenCalled();
        expect(user.password).toBe('plainPassword');
        expect(next).toHaveBeenCalled();
    });
});
