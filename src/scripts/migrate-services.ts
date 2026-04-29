import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { env } from '../config/env';
import { Service } from '../models/Service';

const CORRECT_SERVICES = [
  {
    title: 'Architecture',
    shortDescription: 'Designing functional, aesthetic, and sustainable buildings tailored to client needs.',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
    buttonTitle: 'Request Architecture Services',
    features: [
      { name: 'Concept Design & Visualization', meaning: '3D renders, drawings, and models that bring your vision to life before construction begins.', icon: 'mdi:pencil-ruler' },
      { name: 'Space Planning & Optimization', meaning: 'Intelligent layout design that maximises functionality and flow for every room and floor.', icon: 'mdi:floor-plan' },
      { name: 'Sustainable Design Solutions', meaning: 'Energy-efficient, environmentally responsible architecture using modern and local materials.', icon: 'mdi:leaf' },
      { name: 'Regulatory Compliance & Approvals', meaning: 'Full management of permits, zoning, and building authority submissions in Rwanda.', icon: 'mdi:file-certificate-outline' },
      { name: 'Custom Design to Client Vision', meaning: 'Every project is bespoke — shaped entirely around your brief, budget, and lifestyle.', icon: 'mdi:account-heart-outline' },
    ],
    order: 1,
  },
  {
    title: 'Construction',
    shortDescription: 'Executing building projects by turning designs into physical structures with quality and precision.',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2076&auto=format&fit=crop',
    buttonTitle: 'Request Construction Services',
    features: [
      { name: 'High-Quality Material Sourcing', meaning: 'We procure durable, certified materials from trusted local and international suppliers.', icon: 'mdi:package-variant-closed' },
      { name: 'Skilled Workforce & Site Supervision', meaning: 'Experienced site teams oversee every trade to maintain workmanship standards daily.', icon: 'mdi:hard-hat' },
      { name: 'Cost Control & Budgeting', meaning: 'Transparent budgeting with real-time cost tracking to keep projects within financial targets.', icon: 'mdi:calculator-variant-outline' },
      { name: 'Timely Project Execution', meaning: 'Robust scheduling and milestone management to deliver on time, every time.', icon: 'mdi:clock-check-outline' },
      { name: 'Safety & Quality Assurance', meaning: 'Strict HSE protocols and quality inspections at every stage of the build.', icon: 'mdi:shield-check-outline' },
    ],
    order: 2,
  },
  {
    title: 'Project Management',
    shortDescription: 'Coordinating all aspects of a project to ensure it is completed on time, within budget, and to required standards.',
    imageUrl: 'https://images.unsplash.com/photo-1455849318743-b2233052fcff?q=80&w=2069&auto=format&fit=crop',
    buttonTitle: 'Request Project Management',
    features: [
      { name: 'Planning, Scheduling & Coordination', meaning: 'End-to-end programme management from pre-construction to handover.', icon: 'mdi:calendar-check-outline' },
      { name: 'Budget Monitoring & Cost Efficiency', meaning: 'Continuous cost tracking and value-engineering to protect project budgets.', icon: 'mdi:chart-line' },
      { name: 'Risk Assessment & Mitigation', meaning: 'Proactive identification and management of project risks before they become issues.', icon: 'mdi:alert-circle-outline' },
      { name: 'Stakeholder Communication', meaning: 'Clear, regular reporting to keep all parties aligned and informed throughout.', icon: 'mdi:account-group-outline' },
      { name: 'Quality Control & Reporting', meaning: 'Inspection regimes and milestone sign-offs to ensure specification compliance.', icon: 'mdi:clipboard-check-outline' },
    ],
    order: 3,
  },
  {
    title: 'Land Acquisition',
    shortDescription: 'Helping clients identify, evaluate, and legally secure suitable land for development.',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2064&auto=format&fit=crop',
    buttonTitle: 'Request Land Acquisition',
    features: [
      { name: 'Land Sourcing & Market Analysis', meaning: 'We identify available parcels and assess market value to find the best opportunities.', icon: 'mdi:map-search-outline' },
      { name: 'Due Diligence & Legal Verification', meaning: 'Thorough checks on title, encumbrances, zoning, and ownership history.', icon: 'mdi:magnify-scan' },
      { name: 'Title Processing & Documentation', meaning: 'Full support through Rwanda Land Authority processes and title transfer.', icon: 'mdi:file-document-edit-outline' },
      { name: 'Site Feasibility Studies', meaning: 'Technical assessment of terrain, access, utilities, and planning constraints.', icon: 'mdi:terrain' },
      { name: 'Investment Advisory & Valuation', meaning: 'Data-driven insights on land value, growth potential, and acquisition strategy.', icon: 'mdi:trending-up' },
    ],
    order: 4,
  },
];

async function migrate(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to MongoDB\n');

  // Delete all existing services
  const deleted = await Service.deleteMany({});
  console.log(`  🗑   Deleted ${deleted.deletedCount} existing service(s)\n`);

  // Insert correct services
  for (const svc of CORRECT_SERVICES) {
    await Service.create(svc);
    console.log(`  ✅  Inserted: ${svc.title}`);
  }

  console.log('\nDone. Services replaced with correct data.');
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
