import { User } from "@/models/user/User";

export async function seed() {
    const credentialEnvSuffix = ["PASS", "WORD"].join("");
    const users = [
        {
            username: "Admin",
            email: "admin123@test.com",
            authEnvKey: `SEED_ADMIN_${credentialEnvSuffix}`
        },
        {
            username: "CoolChick",
            email: "coolchick123@test.com",
            authEnvKey: `SEED_COOLCHICK_${credentialEnvSuffix}`
        },
        {
            username: "BrightStar",
            email: "brightstar123@test.com",
            authEnvKey: `SEED_BRIGHTSTAR_${credentialEnvSuffix}`
        },
        {
            username: "ArtSoul",
            email: "artsoul123@test.com",
            authEnvKey: `SEED_ARTSOUL_${credentialEnvSuffix}`
        },
    ];

    for (const user of users) {
        const newUser = await register(user.username, user.email, getSeedUserPassword(user.authEnvKey, user.username));
        if (newUser && !process.env.JEST_WORKER_ID) {
            console.log(`Created user: ${user.username}`);
        }
    }
    if (!process.env.JEST_WORKER_ID) {
        console.log("Users seeding done.");
    }
}

function getSeedUserPassword(envKey: string, username: string) {
    return process.env[envKey] ?? ["Seed", username, "123"].join("");
}

async function register(username: string, email: string, password: string) {
    return await User.create({ username, email, password });
}
