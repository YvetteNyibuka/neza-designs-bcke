import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { env } from '../config/env';
import { User } from '../models/User';
import { ROLES } from '../constants/roles';

async function verifyUser(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to MongoDB\n');

  const email = 'izanyibukayvette@gmail.com';
  const password = 'Test@123';

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      console.log('\nRun: npm run seed:user');
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log('User found:');
    console.log(`📧 Email: ${user.email}`);
    console.log(`✔️  Verified: ${user.isVerified}`);
    console.log(`👤 Role: ${user.role}`);
    console.log(`🔐 2FA Enabled: ${user.twoFAEnabled}`);

    let needsSave = false;

    if (!user.isVerified) {
      console.log('\n⚠️  User is NOT verified. Fixing...');
      user.isVerified = true;
      needsSave = true;
    }

    if (user.role !== ROLES.ADMIN) {
      console.log('⚠️  Role is not admin. Fixing...');
      user.role = ROLES.ADMIN;
      needsSave = true;
    }

    if (user.twoFAEnabled) {
      console.log('⚠️  2FA is enabled. Disabling...');
      user.twoFAEnabled = false;
      needsSave = true;
    }

    // Always reset password to ensure it's correct
    console.log('⚠️  Resetting password to ensure it matches...');
    user.password = password;
    needsSave = true;

    if (needsSave) {
      await user.save();
      console.log('\n✅ All issues fixed!');
    } else {
      console.log('\n✅ User is verified and ready to login!');
    }

    console.log(`\n🔓 Ready to login with:`);
    console.log(`📧 Email: izanyibukayvette@gmail.com`);
    console.log(`🔐 Password: Test@123`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

verifyUser();
