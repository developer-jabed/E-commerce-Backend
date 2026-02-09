import bcrypt from 'bcryptjs';
import config from '../../config';
import { prisma } from '../shared/prisma';

export const seedAdmin = async () => {
  try {
    if (!config.admin_email || !config.admin_password) {
      throw new Error('Missing ADMIN_EMAIL or ADMIN_PASSWORD');
    }

    const hashedPassword = await bcrypt.hash(config.admin_password, 10);

    // 1️⃣ Check existing user
    const existingUser = await prisma.user.findUnique({
      where: { email: config.admin_email },
      include: { admin: true },
    });

    // 2️⃣ User + Admin already exists
    if (existingUser?.admin) {
      console.log('✅ Admin already exists');
      return;
    }

    // 3️⃣ User exists but Admin profile missing
    if (existingUser && !existingUser.admin) {
      await prisma.admin.create({
        data: {
          userId: existingUser.id,
          roleLabel: 'Super Admin',
        },
      });

      console.log('✅ Admin profile attached to existing user');
      return;
    }

    // 4️⃣ Create fresh User + Admin
    await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: config.admin_email,
        password: hashedPassword,
        role: 'ADMIN',

        admin: {
          create: {
            roleLabel: 'Super Admin',
          },
        },
      },
    });

    console.log('🎉 Admin created successfully');
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
  } finally {
    await prisma.$disconnect();
  }
};
