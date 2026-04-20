import { prisma } from "../prisma";
import type { User, Prisma } from "@prisma/client";

/**
 * Interface for User data access — follows Interface Segregation Principle.
 * Any data source (DB, API, cache) can implement this contract.
 */
export interface IUserRepository {
    createUser(data: Prisma.UserCreateInput): Promise<User>;
    getUserById(id: string): Promise<User | null>;
    getUserByEmail(email: string): Promise<User | null>;
    updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User>;
    deleteUser(id: string): Promise<User>;
}

/**
 * UserRepository — Prisma-backed implementation of IUserRepository.
 * Single Responsibility: only handles data persistence for User entities.
 */
export class UserRepository implements IUserRepository {
    async createUser(data: Prisma.UserCreateInput): Promise<User> {
        return prisma.user.create({ data });
    }

    async getUserById(id: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id },
        });
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email },
        });
    }

    async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
        return prisma.user.update({
            where: { id },
            data,
        });
    }

    async deleteUser(id: string): Promise<User> {
        return prisma.user.delete({
            where: { id },
        });
    }
}
