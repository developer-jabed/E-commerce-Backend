// src/modules/user/user.interface.ts

import { Role } from "@prisma/client";


export interface IAuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  isBlocked: boolean;
}

export interface ICreateAdminPayload {
  name: string;
  email: string;
  password: string;
  superAdmin?: boolean;
  roleLabel?: "Super Admin" | "Admin";
}
