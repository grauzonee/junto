import { IUser } from "@/models/user/User";

export type LoginData = Pick<IUser, "email" | "password">;

export type RegisterData = Pick<IUser, "email" | "password" | "username">;