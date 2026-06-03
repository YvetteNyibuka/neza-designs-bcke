import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { CareerCategory } from '../models/CareerCategory';
import { BlogCategory } from '../models/BlogCategory';
import { ProjectCategory } from '../models/ProjectCategory';
import { slugify } from '../utils/slugify';
import { env } from '../config/env';

interface CategoryData {
  name: string;
  description?: string;
  order: number;
}

async function seedCategories(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to MongoDB');

  try {
    // Seed Career Categories (Departments)
    const careerCategories: CategoryData[] = [
      { name: 'Architecture', description: 'Architecture department', order: 1 },
      { name: 'Civil Engineering', description: 'Civil Engineering department', order: 2 },
      { name: 'Project Management', description: 'Project Management department', order: 3 },
      { name: 'Interior Design', description: 'Interior Design department', order: 4 },
    ];

    console.log('\nSeeding Career Categories (Departments)...');
    for (const cat of careerCategories) {
      const existing = await CareerCategory.findOne({ slug: slugify(cat.name) });
      if (!existing) {
        await CareerCategory.create({
          name: cat.name,
          slug: slugify(cat.name),
          description: cat.description,
          order: cat.order,
          isDeleted: false,
        });
        console.log(`✓ Created Career Category: ${cat.name}`);
      } else {
        console.log(`⊘ Career Category already exists: ${cat.name}`);
      }
    }

    // Seed Blog Categories
    const blogCategories: CategoryData[] = [
      { name: 'Sustainability', description: 'Sustainable building practices', order: 1 },
      { name: 'Urbanization', description: 'Urban development and planning', order: 2 },
      { name: 'Design Trends', description: 'Latest design trends', order: 3 },
      { name: 'Rwanda Projects', description: 'Projects in Rwanda', order: 4 },
      { name: 'FEATURED INSIGHTS', description: 'Featured insights and analysis', order: 5 },
    ];

    console.log('\nSeeding Blog Categories...');
    for (const cat of blogCategories) {
      const existing = await BlogCategory.findOne({ slug: slugify(cat.name) });
      if (!existing) {
        await BlogCategory.create({
          name: cat.name,
          slug: slugify(cat.name),
          description: cat.description,
          order: cat.order,
          isDeleted: false,
        });
        console.log(`✓ Created Blog Category: ${cat.name}`);
      } else {
        console.log(`⊘ Blog Category already exists: ${cat.name}`);
      }
    }

    // Seed Project Categories
    const projectCategories: CategoryData[] = [
      { name: 'Architecture', description: 'Architectural projects', order: 1 },
      { name: 'Construction', description: 'Construction projects', order: 2 },
      { name: 'Project Management', description: 'Project management initiatives', order: 3 },
      { name: 'Land Acquisition', description: 'Land acquisition projects', order: 4 },
    ];

    console.log('\nSeeding Project Categories...');
    for (const cat of projectCategories) {
      const existing = await ProjectCategory.findOne({ slug: slugify(cat.name) });
      if (!existing) {
        await ProjectCategory.create({
          name: cat.name,
          slug: slugify(cat.name),
          description: cat.description,
          order: cat.order,
          isDeleted: false,
        });
        console.log(`✓ Created Project Category: ${cat.name}`);
      } else {
        console.log(`⊘ Project Category already exists: ${cat.name}`);
      }
    }

    console.log('\n✓ All categories seeded successfully!');
  } catch (error) {
    console.error('Error seeding categories:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedCategories().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
