import { getSupabase } from '../../db/supabaseClient.js';

export interface PrayerLog {
  id: string;
  userId: string;
  prayerName: string;
  religion: string;
  completedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface StreakInfo {
  id: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
}

export interface PrayerTrackerStats {
  todayCount: number;
  weekCount: number;
  monthCount: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
}

export interface CustomPrayer {
  id: string;
  userId: string;
  name: string;
  religion: string;
  createdAt: string;
}

const DEFAULT_PRAYERS: Record<string, string[]> = {
  orthodox: [
    'Morning Prayer (Kidan)',
    'Mid-day Prayer',
    'Evening Prayer (Sark)',
    'Night Prayer (Lelit)'
  ],
  muslim: [
    'Fajr (Dawn)',
    'Dhuhr (Noon)',
    'Asr (Afternoon)',
    'Maghrib (Sunset)',
    'Isha (Night)'
  ],
  protestant: [
    'Morning Devotion',
    'Midday Prayer',
    'Evening Meditation',
    'Night Prayer'
  ]
};

export class PrayerTrackerService {
  async logPrayer(userId: string, prayerName: string, religion: string): Promise<PrayerLog> {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('prayer_tracker')
      .insert({
        user_id: userId,
        prayer_name: prayerName,
        religion: religion,
        completed_date: new Date().toISOString(),
      })
      .select('*')
      .single();
    
    if (error || !data) throw new Error(error?.message || 'Failed to log prayer');
    return this.mapPrayerLog(data);
  }

  async getTodayPrayers(userId: string, religion: string): Promise<PrayerLog[]> {
    const supabase = getSupabase();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const { data, error } = await supabase
      .from('prayer_tracker')
      .select('*')
      .eq('user_id', userId)
      .eq('religion', religion)
      .gte('completed_date', today.toISOString())
      .lt('completed_date', tomorrow.toISOString())
      .order('completed_date', { ascending: false });
    
    if (error) throw new Error(error.message);
    return (data || []).map(this.mapPrayerLog);
  }

  async getWeekPrayers(userId: string, religion: string): Promise<PrayerLog[]> {
    const supabase = getSupabase();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const { data, error } = await supabase
      .from('prayer_tracker')
      .select('*')
      .eq('user_id', userId)
      .eq('religion', religion)
      .gte('completed_date', weekAgo.toISOString())
      .lte('completed_date', today.toISOString())
      .order('completed_date', { ascending: false });
    
    if (error) throw new Error(error.message);
    return (data || []).map(this.mapPrayerLog);
  }

  async getMonthPrayers(userId: string, religion: string): Promise<PrayerLog[]> {
    const supabase = getSupabase();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);
    
    const { data, error } = await supabase
      .from('prayer_tracker')
      .select('*')
      .eq('user_id', userId)
      .eq('religion', religion)
      .gte('completed_date', monthAgo.toISOString())
      .lte('completed_date', today.toISOString())
      .order('completed_date', { ascending: false });
    
    if (error) throw new Error(error.message);
    return (data || []).map(this.mapPrayerLog);
  }

  async getStats(userId: string, religion: string): Promise<PrayerTrackerStats> {
    const supabase = getSupabase();
    
    // Get counts for different periods
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);
    
    // Get today's count
    const { count: todayCount } = await supabase
      .from('prayer_tracker')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('religion', religion)
      .gte('completed_date', today.toISOString())
      .lt('completed_date', tomorrow.toISOString());
    
    // Get week's count
    const { count: weekCount } = await supabase
      .from('prayer_tracker')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('religion', religion)
      .gte('completed_date', weekAgo.toISOString())
      .lte('completed_date', today.toISOString());
    
    // Get month's count
    const { count: monthCount } = await supabase
      .from('prayer_tracker')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('religion', religion)
      .gte('completed_date', monthAgo.toISOString())
      .lte('completed_date', today.toISOString());
    
    // Get streak info
    const streak = await this.calculateStreak(userId, religion);
    
    return {
      todayCount: todayCount || 0,
      weekCount: weekCount || 0,
      monthCount: monthCount || 0,
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastCompletedDate: streak.lastCompletedDate
    };
  }

  async calculateStreak(userId: string, religion: string): Promise<StreakInfo> {
    const supabase = getSupabase();
    
    // Get all prayers in order
    const { data: allPrayers, error } = await supabase
      .from('prayer_tracker')
      .select('*')
      .eq('user_id', userId)
      .eq('religion', religion)
      .order('completed_date', { ascending: false });
    
    if (error || !allPrayers || allPrayers.length === 0) {
      return {
        id: '',
        currentStreak: 0,
        longestStreak: 0,
        lastCompletedDate: null
      };
    }
    
    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    let lastDate = new Date(allPrayers[0].completed_date);
    lastDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // If the last prayer wasn't today, current streak is 0
    if (lastDate.getTime() === today.getTime()) {
      currentStreak = 1;
    }
    
    for (let i = 1; i < allPrayers.length; i++) {
      const currentDate = new Date(allPrayers[i].completed_date);
      currentDate.setHours(0, 0, 0, 0);
      
      const prevDate = new Date(allPrayers[i - 1].completed_date);
      prevDate.setHours(0, 0, 0, 0);
      
      const diffTime = prevDate.getTime() - currentDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempStreak++;
        if (lastDate.getTime() === today.getTime()) {
          currentStreak = tempStreak;
        }
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }
    
    return {
      id: userId,
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      lastCompletedDate: allPrayers[0].completed_date
    };
  }

  async addCustomPrayer(userId: string, name: string, religion: string): Promise<CustomPrayer> {
    const supabase = getSupabase();
    
    // For now, we'll store custom prayers as regular prayers
    // In a real app, you might have a separate custom_prayers table
    const { data, error } = await supabase
      .from('prayer_tracker')
      .insert({
        user_id: userId,
        prayer_name: name,
        religion: religion,
        completed_date: null,
      })
      .select('*')
      .single();
    
    if (error || !data) throw new Error(error?.message || 'Failed to add custom prayer');
    
    return {
      id: data.id,
      userId: data.user_id,
      name: data.prayer_name,
      religion: data.religion,
      createdAt: data.created_at
    };
  }

  getDefaultPrayers(religion: string): string[] {
    return DEFAULT_PRAYERS[religion.toLowerCase()] || DEFAULT_PRAYERS['orthodox'];
  }

  private mapPrayerLog(data: Record<string, unknown>): PrayerLog {
    return {
      id: data.id as string,
      userId: data.user_id as string,
      prayerName: data.prayer_name as string,
      religion: data.religion as string,
      completedDate: data.completed_date as string,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  }
}

export const prayerTrackerService = new PrayerTrackerService();
