import { SiteSettings, ISiteSettings } from '../models/SiteSettings';

const DEFAULTS: Partial<ISiteSettings> = {
  metaTitle: 'Neza Designs',
  metaDescription: 'Premier architecture, civil engineering, and design firm in East Africa.',
  indexingEnabled: true,
  sitemapEnabled: true,
  primaryColor: '#B75E1A',
  secondaryColor: '#231F1C',
  accentColor: '#DAA119',
  font: 'Inter',
};

export async function getSettings(): Promise<ISiteSettings> {
  let settings = await SiteSettings.findOne().lean();
  if (!settings) {
    settings = await SiteSettings.create(DEFAULTS);
  }
  return settings as ISiteSettings;
}

export async function updateSettings(updates: Partial<ISiteSettings>): Promise<ISiteSettings> {
  const existing = await SiteSettings.findOne();
  if (!existing) {
    return SiteSettings.create({ ...DEFAULTS, ...updates });
  }
  Object.assign(existing, updates);
  return existing.save();
}
