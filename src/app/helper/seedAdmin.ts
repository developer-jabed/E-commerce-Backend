import bcrypt from "bcryptjs";
import { prisma } from "../shared/prisma";
import config from "../../config";

export const seedAdmin = async () => {
  try {
    // ✅ Check ENV values
    if (!config.admin_email || !config.admin_password) {
      throw new Error("❌ Missing ADMIN_EMAIL or ADMIN_PASSWORD in config.");
    }

    // ✅ Check if admin account already exists
    const existingAccount = await prisma.account.findUnique({
      where: { email: config.admin_email },
      include: { admin: true },
    });

    if (existingAccount?.admin) {
      console.log("✅ Admin already exists!");
      return;
    }

    console.log("🛠️ Creating Admin Account...");

    // ✅ Hash password
    const saltRounds = Number(10);
    const hashedPassword = await bcrypt.hash(
      config.admin_password,
      saltRounds
    );

    // ✅ Create Account
    const account = await prisma.account.create({
      data: {
        email: config.admin_email,
        password: hashedPassword,
        needPassChange: false,
        isVerified: true,
      },
    });

    // ✅ Create Admin Profile
    await prisma.admin.create({
      data: {
        accountId: account.id,
        superAdmin: true,
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
