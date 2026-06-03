import cron from 'node-cron';
import { logger } from '../utils/logger';
import { Career } from '../models/Career';

/**
 * Start scheduled cron jobs for the application
 */
export function startCronJobs() {
  // Archive expired careers every night at 11 PM
  cron.schedule('0 23 * * *', () => {
    archiveExpiredCareers();
  });

  logger.info('Cron jobs scheduled successfully');
}

/**
 * Archive careers whose deadline has passed
 * Changes status to 'Closed' to hide from public view while keeping data intact
 */
export async function archiveExpiredCareers() {
  try {
    const now = new Date();

    const result = await Career.updateMany(
      {
        deadline: { $lt: now },
        status: 'Open',
        isDeleted: false,
      },
      {
        status: 'Closed',
        updatedAt: new Date(),
      }
    );

    if (result.modifiedCount > 0) {
      logger.info(`Archived ${result.modifiedCount} expired careers at ${now.toISOString()}`);
    }
  } catch (error) {
    logger.error('Error archiving expired careers:', error);
  }
}
