import { User } from "@/models/user/User";

export async function seed() {
    const users = [
        {
            username: "Admin",
            email: "admin123@test.com",
            password: "Admin123"
        },
        {
            username: "CoolChick",
            email: "coolchick123@test.com",
            password: "CoolChick123"
        },
        {
            username: "BrightStar",
            email: "brightstar123@test.com",
            password: "BrightStar123"
        },
        {
            username: "ArtSoul",
            email: "artsoul123@test.com",
            password: "ArtSoul123"
        },
    ];

    for (const user of users) {
        const newUser = await register(user.username, user.email, user.password);
        if (newUser && !process.env.JEST_WORKER_ID) {
            console.log(`Created user: ${user.username}`);
        }
    }
    if (!process.env.JEST_WORKER_ID) {
        console.log("Users seeding done.");
    }
}
async function register(username: string, email: string, password: string) {
    return await User.create({ username, email, password });
}
