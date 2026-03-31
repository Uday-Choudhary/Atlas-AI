import { prisma } from "../prisma";
import type { User, Prisma } from "@prisma/client";

export class UserRepository {
    static async createUser(data: Prisma.UserCreateInput): Promise<User> {
        return prisma.user.create({ data });
    }

    static async getUserById(id: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id },
        });
    }

    static async getUserByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email },
        });
    }

    static async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
        return prisma.user.update({
            where: { id },
            data,
        });
    }

    static async deleteUser(id: string): Promise<User> {
        return prisma.user.delete({
            where: { id },
        });
    }
}
