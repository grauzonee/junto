import { IUser } from "@/models/User";

export type LoginData = Pick<IUser, "email" | "password">;

export type RegisterData = Pick<IUser, "email" | "password" | "username">;