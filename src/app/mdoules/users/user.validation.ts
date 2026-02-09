
import { z } from "zod";


const emailSchema = z
  .string()
  .nonempty("Email is required")
  .email("Invalid email address");

const passwordSchema = z
  .string()
  .nonempty("Password is required")
  .min(6, "Password must be at least 6 characters");


const avatarUrlSchema = z
  .string()
  .url("Invalid URL format")
  .optional();


export const createAdminSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: emailSchema,
    password: passwordSchema,
    avatarUrl: avatarUrlSchema,
    roleLabel: z
      .enum(["Super Admin", "Admin"])
      .optional()
      .default("Super Admin"),
  }),
});


export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: emailSchema,
    password: passwordSchema,
    avatarUrl: avatarUrlSchema,
    phone: z.string().min(6, "Phone must be at least 6 digits").max(15, "Phone cannot exceed 15 digits").optional(),
    address: z.string().max(200, "Address too long").optional(),
    city: z.string().max(100, "City too long").optional(),
    country: z.string().max(100, "Country too long").optional(),
  }),
});


export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    email: z.string().email("Invalid email address").optional(),
    phone: z.string().min(6, "Phone must be at least 6 digits").max(15).optional(),
    address: z.string().max(200, "Address too long").optional(),
    city: z.string().max(100, "City too long").optional(),
    country: z.string().max(100, "Country too long").optional(),
    avatarUrl: z.string().url("Invalid URL").optional(),
  }),
});