// src/modules/user/user.service.ts
import { Role } from "@prisma/client";
import config from "../../../config";
import { fileUploader } from "../../helper/fileUploader";
import { prisma } from "../../shared/prisma";
import { ICreateAdminPayload } from "./user.interface";
import bcrypt from "bcryptjs";
import { Request } from "express";


export const userService = {
  createAdmin: async (req: Request) => {
    const { name, email, password, roleLabel } = req.body; // now correct

    if (!name || !email || !password) {
      throw new Error("Name, email, and password are required");
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) throw new Error("User with this email already exists");

    const hashedPassword = await bcrypt.hash(password, Number(config.salt_round));

    let avatarUrl: string | null = null;
    if (req.file) {
      const uploadResult = await fileUploader.uploadToCloudinary(req.file);
      avatarUrl = uploadResult?.secure_url || null;
    }

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: Role.ADMIN,
        isBlocked: false,
        avatarUrl,
        admin: {
          create: {
            roleLabel: roleLabel || "Super Admin",
            lastLogin: null,
          },
        },
      },
      include: { admin: true },
    });

    return user;
  },


  createCustomer: async (req: Request) => {
    const { name, email, password, avatarUrl, phone, address, city, country } = req.body;

    if (!name || !email || !password) {
      throw new Error("Name, email, and password are required");
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) throw new Error("User with this email already exists");

    const hashedPassword = await bcrypt.hash(password, Number(config.salt_round));

    let uploadedAvatar: string | null = avatarUrl || null;
    if (req.file) {
      const uploadResult = await fileUploader.uploadToCloudinary(req.file);
      uploadedAvatar = uploadResult?.secure_url || uploadedAvatar;
    }

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: Role.CUSTOMER,
        isBlocked: false,
        avatarUrl: uploadedAvatar,
        customer: {
          create: {
            phone,
            address,
            city,
            country,
          },
        },
      },
      include: { customer: true },
    });

    return user;
  },

  updateProfile: async (req: Request) => {
    const userId = req.params.id;
    const { name, email, phone, address, city, country } = req.body;

    let avatarUrl: string | null = req.body.avatarUrl || null;

    if (req.file) {
      const uploadResult = await fileUploader.uploadToCloudinary(req.file);
      avatarUrl = uploadResult?.secure_url || avatarUrl;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email: email?.toLowerCase(),
        avatarUrl,
        customer: phone || address || city || country ? {
          update: {
            phone,
            address,
            city,
            country,
          },
        } : undefined,
      },
      include: { customer: true, admin: true },
    });

    return updatedUser;
  },


};
