import bcrypt from "bcryptjs";
import config from "../../config";
import { prisma } from "../shared/prisma";

export const seedAdmin = async () => {
  try {
    if (!config.admin_email || !config.admin_password) {
      throw new Error("❌ Missing ADMIN_EMAIL or ADMIN_PASSWORD in config");
    }

    // ✅ Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: config.admin_email },
      include: { admin: true },
    });

    if (existingAdmin?.admin) {
      console.log("✅ Admin already exists!");
      return;
    }

    console.log("🛠️ Creating Admin User...");

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(config.admin_password, 10);

    // ✅ Create User + Admin profile in ONE query
    await prisma.user.create({
      data: {
        name: "Super Admin",
        email: config.admin_email,
        password: hashedPassword,
        avatarUrl: null,
        role: "ADMIN", // important for role-based access

        admin: {
          create: {
            roleLabel: "Super Admin",
            lastLogin: null, // fixed field name
          },
        },
      },
    });

    console.log("🎉 Admin created successfully!");
    console.log({
      email: config.admin_email,
      password: config.admin_password,
    });
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
  } finally {
    await prisma.$disconnect();
  }
};
