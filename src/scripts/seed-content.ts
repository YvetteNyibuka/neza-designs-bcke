import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { env } from '../config/env';
import { Project } from '../models/Project';
import { BlogPost } from '../models/BlogPost';
import { TeamMember } from '../models/TeamMember';
import { Service } from '../models/Service';

function readJson<T>(filename: string): T[] {
  const filePath = path.join(__dirname, '..', 'data-backup', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function seedCollection(name: string, model: mongoose.Model<any>, data: unknown[], uniqueKey: string): Promise<void> {
  let inserted = 0;
  let skipped = 0;

  for (const item of data as Record<string, unknown>[]) {
    const filter = { [uniqueKey]: item[uniqueKey] };
    const existing = await model.findOne(filter);
    if (existing) {
      skipped++;
    } else {
      await model.create(item);
      inserted++;
    }
  }

  if (inserted === 0) {
    console.log(`  ⏭  ${name}: all ${skipped} record(s) already exist — skipping`);
  } else {
    console.log(`  ✅  ${name}: inserted ${inserted} new record(s) (${skipped} already existed)`);
  }
}

async function seed(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to MongoDB\n');

  await seedCollection('Projects', Project, readJson('projects.json'), 'slug');
  await seedCollection('BlogPosts', BlogPost, readJson('posts.json'), 'slug');
  await seedCollection('TeamMembers', TeamMember, readJson('team.json'), 'name');
  await seedCollection('Services', Service, readJson('services.json'), 'title');

  console.log('\nDone.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
