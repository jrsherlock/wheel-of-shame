
import { Punishment } from './types';

// Vibrant, high-contrast colors for dark mode
export const COLORS = [
  '#ef4444', // Red 500
  '#3b82f6', // Blue 500
  '#10b981', // Emerald 500
  '#f59e0b', // Amber 500
  '#8b5cf6', // Violet 500
  '#ec4899', // Pink 500
  '#06b6d4', // Cyan 500
  '#f97316', // Orange 500
  '#6366f1', // Indigo 500
  '#d946ef', // Fuchsia 500
  '#84cc16', // Lime 500
  '#14b8a6', // Teal 500
];

export const DEFAULT_PUNISHMENTS: Punishment[] = [
  { id: '1', title: 'Beer Mile', description: 'Run a mile. Drink 4 beers. Don\'t vomit.', color: COLORS[0] },
  { id: '2', title: 'Waffle House', description: '24 Hours in Waffle House. -1 hour for every waffle eaten.', color: COLORS[1] },
  { id: '3', title: 'Open Mic Standup', description: 'Perform a 5-minute standup comedy set at a local open mic.', color: COLORS[2] },
  { id: '4', title: 'SAT Exam', description: 'Register for and take the SATs with high schoolers.', color: COLORS[3] },
  { id: '5', title: 'Lemonade Stand', description: 'Run a lemonade stand until you make $50 profit.', color: COLORS[4] },
  { id: '6', title: 'Calendar Shoot', description: 'Pose for a 12-month calendar. Distribution is mandatory.', color: COLORS[5] },
  { id: '7', title: 'Sign Holder', description: 'Stand on a busy corner with an embarrassing sign for 2 hours.', color: COLORS[6] },
  { id: '8', title: 'Toilet Trophy', description: 'Display a golden toilet seat in your living room for a year.', color: COLORS[7] },
];
