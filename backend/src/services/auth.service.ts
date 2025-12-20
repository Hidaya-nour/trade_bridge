import User, { UserRole } from "../models/user.model";
import { hashPassword, comparePassword } from "../utils/password";
import { signAccessToken } from "../utils/jwt";
import { v4 as uuidv4 } from "uuid";;

interface RegisterInput {
    full_name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
}

export class AuthService {
    static async register(data: RegisterInput) {
        const existingUser = await User.findOne({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new Error("Email already registered");
        }

        const password_hash = await hashPassword(data.password);

        const user = await User.create({
            user_id: uuidv4(),
            full_name: data.full_name,
            email: data.email,
            phone: data.phone,
            role: data.role,
            password_hash,
            status: "active",
        });

        const token = signAccessToken({
            user_id: user.user_id,
            role: user.role,
        });

        return {
            token,
            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
            },
        };
    }

    static async login(email: string, password: string) {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            throw new Error("Invalid email or password");
        }

        if (user.status !== "active") {
            throw new Error(`Account is ${user.status}`);
        }

        const isMatch = await comparePassword(password, user.password_hash);

        if (!isMatch) {
            throw new Error("Invalid email or password");
        }

        const token = signAccessToken({
            user_id: user.user_id,
            role: user.role,
        });

        return {
            token,
            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
            },
        };
    }

    static async getProfile(user_id: string) {
        const user = await User.findOne({
            where: { user_id },
            attributes: { exclude: ["password_hash", "deleted_at"] },
        });

        if (!user) {
            throw new Error("User not found");
        }

        return user;
    }
}
