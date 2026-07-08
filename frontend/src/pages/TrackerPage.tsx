import React, { useState, useEffect } from 'react';
import { Check, Calendar as CalendarIcon, Flame, Heart, Target, Plus, Loader2 } from 'lucide-react';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { prayersApi } from '../services/api';

interface PrayerTrackerStats {
  todayCount: number;
  weekCount: number;
  monthCount: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
}

interface PrayerLog {
  id: string;
  prayerName: string;
  completedDate: string;
}

interface Prayer {
  name: string;
  completed: boolean;
  loggedToday: boolean;
}

interface FASTING_SEASONS {
  name: string;
  date: string;
}

const FASTING_SEASONS: Record<string, FASTING_SEASONS[]> = {
  orthodox: [
    { name: "Apostles' Fast", date: 'June 22' },
    { name: 'Assumption Fast', date: 'Aug 7' },
    { name: 'Christmas Fast', date: 'Nov 15' },
    { name: 'Advent Fast', date: 'Jan 7' }
  ],
  muslim: [
    { name: 'Ramadan', date: 'Mar 30' },
    { name: 'Eid al-Fitr', date: 'Apr 10' },
    { name: 'Arafat Day', date: 'Jun 15' },
    { name: 'Eid al-Adha', date: 'Jun 16' }
  ],
  protestant: [
    { name: 'Lent', date: 'Mar 5' },
    { name: 'Good Friday', date: 'Apr 18' },
    { name: 'Advent', date: 'Dec 1' },
    { name: 'Christmas Fast', date: 'Dec 24' }
  ]
};

const TrackerPage = () => {
  const [stats, setStats] = useState<PrayerTrackerStats>({
    todayCount: 0,
    weekCount: 0,
    monthCount: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null
  });
  
  const [defaultPrayers, setDefaultPrayers] = useState<string[]>([]);
  const [todayPrayers, setTodayPrayers] = useState<PrayerLog[]>([]);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [logging, setLogging] = useState(false);
  const [fasting, setFasting] = useState(false);
  const [showAddPrayer, setShowAddPrayer] = useState(false);
  const [newPrayerName, setNewPrayerName] = useState('');
  const [religion, setReligion] = useState('orthodox');
  const [error, setError] = useState('');

  // Fetch user religion and data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get user religion from localStorage or API
        const userStr = localStorage.getItem('user');
        const userReligion = userStr ? JSON.parse(userStr).religion : 'orthodox';
        setReligion(userReligion);
        
        // Fetch default prayers for religion
        const defaultRes = await prayersApi.getDefaultPrayers();
        setDefaultPrayers(defaultRes.data.data || []);
        
        // Fetch stats
        const statsRes = await prayersApi.getStats();
        setStats(statsRes.data.data);
        
        // Fetch today's prayers
        const todayRes = await prayersApi.getTodayPrayers();
        setTodayPrayers(todayRes.data.data || []);
        
        // Initialize prayers list
        const defaults = defaultRes.data.data || [];
        const loggedToday = (todayRes.data.data || []).map((p: PrayerLog) => p.prayerName);
        
        const prayerList = defaults.map((prayer: string) => ({
          name: prayer,
          completed: loggedToday.includes(prayer),
          loggedToday: loggedToday.includes(prayer)
        }));
        
        setPrayers(prayerList);
      } catch (err) {
        setError('Failed to load prayer tracker data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleLogPrayer = async (prayerName: string) => {
    try {
      setLogging(true);
      
      await prayersApi.logPrayer(prayerName);
      
      // Update local state
      setPrayers(prev => 
        prev.map(p => p.name === prayerName ? { ...p, completed: true, loggedToday: true } : p)
      );
      
      // Refresh stats
      const statsRes = await prayersApi.getStats();
      setStats(statsRes.data.data);
      
      setError('');
    } catch (err) {
      setError('Failed to log prayer');
      console.error(err);
    } finally {
      setLogging(false);
    }
  };

  const handleAddCustomPrayer = async () => {
    if (!newPrayerName.trim()) return;
    
    try {
      setLogging(true);
      
      await prayersApi.addCustomPrayer(newPrayerName);
      
      // Add to prayers list
      setPrayers(prev => [...prev, {
        name: newPrayerName,
        completed: false,
        loggedToday: false
      }]);
      
      setNewPrayerName('');
      setShowAddPrayer(false);
      setError('');
    } catch (err) {
      setError('Failed to add custom prayer');
      console.error(err);
    } finally {
      setLogging(false);
    }
  };

  const completedToday = prayers.filter(p => p.loggedToday).length;
  const totalToday = Math.max(prayers.length, 1);
  const progress = (completedToday / totalToday) * 100;

  const fastingSeasons = FASTING_SEASONS[religion] || FASTING_SEASONS.orthodox;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">Prayer Tracker</h1>
        <p className="text-slate-600">Track your daily prayers, fasts, and spiritual milestones.</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-600">
            <Flame className="h-6 w-6" />
          </div>
          <p className="text-3xl font-bold text-slate-950">{stats.currentStreak}</p>
          <p className="text-sm font-medium text-slate-500">Day Streak</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <Target className="h-6 w-6" />
          </div>
          <p className="text-3xl font-bold text-slate-950">{stats.monthCount}</p>
          <p className="text-sm font-medium text-slate-500">Prayers This Month</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <Heart className="h-6 w-6" />
          </div>
          <p className="text-3xl font-bold text-slate-950">{stats.longestStreak}</p>
          <p className="text-sm font-medium text-slate-500">Longest Streak</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-950">Today's Prayers</h2>
            <Badge variant="primary" size="md">{completedToday} / {totalToday} Logged</Badge>
          </div>
          
          <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div 
              className="h-full bg-indigo-600 transition-all duration-500" 
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="space-y-3 mb-4">
            {prayers.map((prayer) => (
              <button
                key={prayer.name}
                onClick={() => !prayer.loggedToday && handleLogPrayer(prayer.name)}
                disabled={prayer.loggedToday || logging}
                className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all ${
                  prayer.loggedToday
                    ? 'border-indigo-200 bg-indigo-50/50' 
                    : 'border-slate-100 hover:border-indigo-100 hover:bg-slate-50'
                }`}
              >
                <div>
                  <p className={`font-medium ${prayer.loggedToday ? 'text-indigo-900' : 'text-slate-900'}`}>
                    {prayer.name}
                  </p>
                </div>
                <div className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                  prayer.loggedToday
                    ? 'border-indigo-600 bg-indigo-600 text-white' 
                    : 'border-slate-300'
                }`}>
                  {prayer.loggedToday && <Check className="h-4 w-4" />}
                </div>
              </button>
            ))}
          </div>

          {showAddPrayer && (
            <div className="space-y-2">
              <input
                type="text"
                value={newPrayerName}
                onChange={(e) => setNewPrayerName(e.target.value)}
                placeholder="Enter prayer name"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleAddCustomPrayer}
                  disabled={!newPrayerName.trim() || logging}
                  variant="primary"
                  size="sm"
                >
                  Add
                </Button>
                <Button
                  onClick={() => {
                    setShowAddPrayer(false);
                    setNewPrayerName('');
                  }}
                  variant="secondary"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {!showAddPrayer && (
            <Button
              onClick={() => setShowAddPrayer(true)}
              variant="secondary"
              size="sm"
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Prayer
            </Button>
          )}
        </section>

        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-950">Fasting Tracker</h2>
            <p className="mb-4 text-sm text-slate-600">Are you observing a fast today?</p>
            <button
              onClick={() => setFasting(!fasting)}
              className={`w-full rounded-xl p-4 text-center font-medium transition-all ${
                fasting
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                  : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {fasting ? 'Yes, I am fasting' : 'No, not today'}
            </button>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-slate-950">Fasting Seasons</h2>
            </div>
            <ul className="space-y-3 text-sm text-slate-700">
              {fastingSeasons.slice(0, 3).map((season, idx) => (
                <li key={idx} className="flex justify-between border-b border-slate-100 pb-2">
                  <span>{season.name}</span>
                  <span className="font-medium text-slate-500">{season.date}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TrackerPage;