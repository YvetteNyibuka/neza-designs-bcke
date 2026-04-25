import { Project } from '../models/Project';
import { BlogPost } from '../models/BlogPost';
import { Service } from '../models/Service';
import { TeamMember } from '../models/TeamMember';
import { Contact } from '../models/Contact';
import { User } from '../models/User';

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function subMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() - months, 1);
}

export interface AnalyticsOverview {
  totals: {
    projects: number;
    ongoingProjects: number;
    completedProjects: number;
    posts: number;
    services: number;
    teamMembers: number;
    inquiries: number;
    unreadInquiries: number;
    admins: number;
  };
  monthlyInquiries: Array<{ month: string; count: number }>;
  recentInquiries: Array<{ id: string; name: string; subject: string; email: string; createdAt: Date }>;
  topCategories: Array<{ category: string; count: number }>;
}

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const [
    projects,
    ongoingProjects,
    completedProjects,
    posts,
    services,
    teamMembers,
    inquiries,
    unreadInquiries,
    admins,
    categoryAgg,
    recentInquiries,
  ] = await Promise.all([
    Project.countDocuments({ isDeleted: false }),
    Project.countDocuments({ isDeleted: false, status: 'Ongoing' }),
    Project.countDocuments({ isDeleted: false, status: 'Completed' }),
    BlogPost.countDocuments({ isDeleted: false }),
    Service.countDocuments({ isDeleted: false }),
    TeamMember.countDocuments({ isDeleted: false }),
    Contact.countDocuments({}),
    Contact.countDocuments({ isRead: false }),
    User.countDocuments({ role: 'admin' }),
    Project.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
    Contact.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select({ name: 1, subject: 1, email: 1, createdAt: 1 })
      .lean(),
  ]);

  const monthStarts = Array.from({ length: 6 }, (_, i) => startOfMonth(subMonths(new Date(), 5 - i)));
  const firstMonth = monthStarts[0];

  const monthlyAgg = await Contact.aggregate([
    { $match: { createdAt: { $gte: firstMonth } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const monthlyMap = new Map<string, number>();
  monthlyAgg.forEach((item) => {
    const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
    monthlyMap.set(key, item.count);
  });

  const monthlyInquiries = monthStarts.map((d) => {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return {
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      count: monthlyMap.get(key) || 0,
    };
  });

  return {
    totals: {
      projects,
      ongoingProjects,
      completedProjects,
      posts,
      services,
      teamMembers,
      inquiries,
      unreadInquiries,
      admins,
    },
    monthlyInquiries,
    recentInquiries: recentInquiries.map((inquiry) => ({
      id: inquiry._id.toString(),
      name: inquiry.name,
      subject: inquiry.subject,
      email: inquiry.email,
      createdAt: inquiry.createdAt,
    })),
    topCategories: categoryAgg.map((item) => ({ category: item._id as string, count: item.count as number })),
  };
}
