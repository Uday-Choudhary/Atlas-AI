import type { IUserRepository } from "../repositories/UserRepository";
import bcrypt from "bcryptjs";

export interface IUserService {
    registerUser(data: { email: string; password?: string; firstName?: string; lastName?: string }): Promise<{ id: string; email: string }>;
    authenticateUser(email: string, password: string): Promise<{ id: string; email: string; name: string }>;
}

/**
 * UserService — Orchestrates user authentication and registration.
 *
 * SOLID Principles:
 * - Single Responsibility: handles only user auth/registration workflows
 * - Dependency Inversion: depends on IUserRepository abstraction, not concrete Prisma calls
 * - Interface Segregation: IUserService exposes only user-level operations
 */
export class UserService implements IUserService {
    constructor(private readonly userRepo: IUserRepository) {}

    async registerUser(data: { email: string; password?: string; firstName?: string; lastName?: string }) {
        const existingUser = await this.userRepo.getUserByEmail(data.email);
        if (existingUser) throw new Error("User already exists with this email.");

        const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : undefined;

        return this.userRepo.createUser({
            email: data.email,
            password: hashedPassword,
            firstName: data.firstName,
            lastName: data.lastName,
        });
    }

    async authenticateUser(email: string, passwordString: string) {
        const user = await this.userRepo.getUserByEmail(email);
        if (!user || !user.password) throw new Error("Invalid email or password.");

        const isMatch = await bcrypt.compare(passwordString, user.password);
        if (!isMatch) throw new Error("Invalid email or password.");

        return {
            id: user.id,
            email: user.email,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        };
    }
}
