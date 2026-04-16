import { UserRepository } from "../repositories/UserRepository";
import bcrypt from "bcryptjs";

export class UserService {
    /**
     * Registers a new user with email and password
     */
    static async registerUser(data: { email: string; password?: string; firstName?: string; lastName?: string }) {
        const existingUser = await UserRepository.getUserByEmail(data.email);

        if (existingUser) {
            throw new Error("User already exists with this email.");
        }

        let hashedPassword = undefined;
        if (data.password) {
            hashedPassword = await bcrypt.hash(data.password, 10);
        }

        return UserRepository.createUser({
            email: data.email,
            password: hashedPassword,
            firstName: data.firstName,
            lastName: data.lastName,
        });
    }

    /**
     * Authenticates a user by email and password
     * Returns user object if valid, throws error if invalid.
     */
    static async authenticateUser(email: string, passwordString: string) {
        const user = await UserRepository.getUserByEmail(email);

        if (!user || !user.password) {
            throw new Error("Invalid email or password.");
        }

        const isMatch = await bcrypt.compare(passwordString, user.password);
        if (!isMatch) {
            throw new Error("Invalid email or password.");
        }

        return {
            id: user.id,
            email: user.email,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        };
    }
}
