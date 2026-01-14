import { User } from "@/models/User";

export async function createUser(overriders = {}, save = false) {
    const userData = {
        username: "testuser" + Date.now(),
        email: `testuser${Date.now()}@example.com`,
        password: "password123",
        ...overriders,
    };
    const user = new User(userData);
    if (save) {
        await user.save();
    }
    return user;
}