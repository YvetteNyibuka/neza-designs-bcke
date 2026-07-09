import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { User } from '../models/User';

async function debugPassword(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to MongoDB\n');

  const email = 'izanyibukayvette@gmail.com';
  const passwordToTest = 'Test@123';

  try {
    // Get user with password field selected
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log('User found:');
    console.log(`📧 Email: ${user.email}`);
    console.log(`✔️  Verified: ${user.isVerified}`);
    console.log(`👤 Role: ${user.role}`);
    console.log(`🔐 Password Hash in DB: ${user.password.substring(0, 30)}...`);
    console.log(`🔐 Password Hash Length: ${user.password.length}\n`);

    // Test password
    console.log('Testing password...\n');
    const isValid = await user.comparePassword(passwordToTest);

    if (isValid) {
      console.log(`✅ Password is CORRECT!`);
      console.log(`   "${passwordToTest}" matches the hash in database`);
    } else {
      console.log(`❌ Password is WRONG!`);
      console.log(`   "${passwordToTest}" does NOT match the hash in database`);
      console.log(`\n⚠️  Fixing password now...\n`);

      user.password = passwordToTest;
      await user.save();

      console.log('✅ Password updated and hashed');
      console.log(`🔐 New Password Hash: ${user.password.substring(0, 30)}...`);
    }

    console.log(`\n🔓 You can now login with:`);
    console.log(`📧 Email: izanyibukayvette@gmail.com`);
    console.log(`🔐 Password: Test@123`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

debugPassword();
