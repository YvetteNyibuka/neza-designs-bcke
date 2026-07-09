import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { env } from '../config/env';
import { User } from '../models/User';
import { ROLES } from '../constants/roles';

async function seedUser(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to MongoDB\n');

  const email = 'izanyibukayvette@gmail.com';
  const password = 'Test@123';

  try {
    // Check if user exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log(`Found existing user: ${email}`);
      console.log('Updating credentials...\n');

      // Update password and settings
      existingUser.password = password;
      existingUser.role = ROLES.ADMIN;
      existingUser.isVerified = true;
      existingUser.twoFAEnabled = false;

      await existingUser.save();
      console.log('✅ User credentials updated successfully');
    } else {
      console.log(`Creating new user: ${email}\n`);

      // Create new user
      const newUser = await User.create({
        email,
        password,
        role: ROLES.ADMIN,
        isVerified: true,
        twoFAEnabled: false,
        loginAlerts: true,
      });

      console.log('✅ User created successfully');
      console.log(`\nUser ID: ${newUser._id}`);
    }

    console.log(`\n📧 Email: ${email}`);
    console.log(`🔐 Password: ${password}`);
    console.log(`👤 Role: ${ROLES.ADMIN}`);
    console.log(`✔️  Verified: true`);

    await mongoose.disconnect();
    console.log('\nDone.');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedUser();
