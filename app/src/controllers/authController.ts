import { Request, Response } from "express"
import { User } from "@/models/User"
import { generateToken } from "@/helpers/jwtHelper";
import messages from "@/constants/errorMessages"
import { setErrorResponse, setSuccessResponse } from "@/helpers/requestHelper";

/**
 * Login user 
 * @param {Request} req 
 * @param {Response} res 
 */
export async function login(req: Request, res: Response) {
    const { email, password } = req.body
    const userFound = await User.findOne({ email });
    if (!userFound) {
        setErrorResponse(res, 404, {}, [messages.response.NOT_FOUND("User")]);
        return;
    }
    const passValid = await userFound.matchPassword(password);
    if (!passValid) {
        setErrorResponse(res, 400, { password: messages.response.INVALID("password") }, []);
        return;
    }
    const token = generateToken(userFound.id)
    setSuccessResponse(res, { token, ...userFound.toJSON() });
}

/**
 * Register user
 * @param {Request} req 
 * @param {Response} res 
 */
export async function register(req: Request, res: Response) {
    const { username, email, password } = req.body
    const userExistsEmail = await User.findOne({ email });
    if (userExistsEmail) {
        setErrorResponse(res, 400, { email: messages.response.IN_USE("email") }, []);
        return;
    }
    const userExistsUsername = await User.findOne({ username });
    if (userExistsUsername) {
        setErrorResponse(res, 400, { username: messages.response.IN_USE("username") }, []);
        return;
    }
    const user = await User.create({ username, email, password });

    if (user) {
        const token = generateToken(user.id);
        setSuccessResponse(res, { token, ...user.toJSON() }, 201);
        return;
    } else {
        setErrorResponse(res, 400, {}, [messages.response.INVALID("user data")]);
    }
}
