import { User } from "@/models/User"
import { BadInputError, NotFoundError } from "@/types/errors/InputError";
import messages from "@/constants/errorMessages";
import { generateToken } from "@/helpers/jwtHelper";
import { IUser } from "@/models/User";

export async function login(data: Pick<IUser, "email" | "password">) {
    const userFound = await User.findOne({ email: data.email });
    if (!userFound) {
        throw new NotFoundError("user");
    }
    const passValid = await userFound.matchPassword(data.password);
    if (!passValid) {
        throw new BadInputError("password", messages.response.INVALID("password"));
    }
    const token = generateToken(userFound.id)
    return { token, ...userFound.toJSON() }
}

export async function register(data: Pick<IUser, "email" | "password" | "username">) {
    const userExistsEmail = await User.findOne({ email: data.email });
    if (userExistsEmail) {
        throw new BadInputError("email", messages.response.IN_USE("email"));
    }
    const userExistsUsername = await User.findOne({ username: data.username });
    if (userExistsUsername) {
        throw new BadInputError("username", messages.response.IN_USE("username"));
    }
    const user = await User.create(data);
    const token = generateToken(user.id);
    return { token, ...user.toJSON() };
}
