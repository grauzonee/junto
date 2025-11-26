import { User } from "@/models/User";

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
        if (newUser) {
            if (!process.env.JEST_WORKER_ID) {
                // eslint-disable-next-line
                console.log(`Created user: ${user.username}`);
            }
        }
    }
    if (!process.env.JEST_WORKER_ID) {
        // eslint-disable-next-line
        console.log("Users seeding done.");
    }
}
async function register(username: string, email: string, password: string) {
    const userExistsEmail = await User.findOne({ email });
    if (userExistsEmail) {
        return;
    }
    const userExistsUsername = await User.findOne({ username });
    if (userExistsUsername) {
        return;
    }
    const user = await User.create({ username, email, password });

    if (user) {
        return user;
    } else {
        return;
    }
}
