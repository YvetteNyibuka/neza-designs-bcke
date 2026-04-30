import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { env } from '../config/env';
import { Project } from '../models/Project';

const CATEGORY_MAP: Record<string, string> = {
  'Civil Engineering': 'Construction',
  'Masterplanning': 'Land Acquisition',
  'Interior': 'Architecture',
};

async function migrate(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to MongoDB\n');

  let total = 0;

  for (const [oldCat, newCat] of Object.entries(CATEGORY_MAP)) {
    const result = await Project.updateMany(
      { category: oldCat },
      { $set: { category: newCat } }
    );
    if (result.modifiedCount > 0) {
      console.log(`  ✅  "${oldCat}" → "${newCat}": updated ${result.modifiedCount} project(s)`);
    } else {
      console.log(`  ⏭  "${oldCat}": no projects found — skipping`);
    }
    total += result.modifiedCount;
  }

  console.log(`\nDone. ${total} project(s) updated.`);
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
