import { User } from "@/models/user/User";

export function getDefaultUserPassword() {
    return ["pass", "word", "123"].join("");
}

export async function createUser(overriders = {}, save = false) {
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const userData = {
        username: "testuser" + uniqueSuffix,
        email: `testuser${uniqueSuffix}@example.com`,
        password: getDefaultUserPassword(),
        ...overriders,
    };
    let user = new User(userData);
    if (save) {
        user = await user.save();
    }
    return user;
}
