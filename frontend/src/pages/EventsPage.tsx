import { Calendar, MapPin, Clock, Users, ArrowRight, Share2, Plus } from 'lucide-react';
import { useAuth, useIsLeader } from '../hooks/useAuth.tsx';
import Button from '../components/Button';
import Badge from '../components/Badge';

const themeStyles = {
  orthodox: {
    bg: 'bg-amber-50',
    text: 'text-amber-900',
    textMuted: 'text-amber-700',
    accent: 'bg-amber-600',
    accentHover: 'hover:bg-amber-700',
    iconColor: 'text-amber-600',
    border: 'border-amber-100',
    gradient: 'from-amber-600 to-amber-800'
  },
  muslim: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-900',
    textMuted: 'text-emerald-700',
    accent: 'bg-emerald-600',
    accentHover: 'hover:bg-emerald-700',
    iconColor: 'text-emerald-600',
    border: 'border-emerald-100',
    gradient: 'from-emerald-600 to-emerald-800'
  },
  protestant: {
    bg: 'bg-blue-50',
    text: 'text-blue-900',
    textMuted: 'text-blue-700',
    accent: 'bg-blue-600',
    accentHover: 'hover:bg-blue-700',
    iconColor: 'text-blue-600',
    border: 'border-blue-100',
    gradient: 'from-blue-600 to-blue-800'
  }
};

const DUMMY_EVENTS = [
  // Orthodox Events
  {
    id: 1,
    title: 'Annual Youth Retreat',
    date: 'Aug 15, 2026',
    time: '09:00 AM - 04:00 PM',
    location: 'Main Community Center',
    attendees: 120,
    category: 'Retreat',
    religion: 'orthodox',
    image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 2,
    title: 'Weekly Bible Study',
    date: 'Every Wednesday',
    time: '06:30 PM - 08:00 PM',
    location: 'Online via Zoom',
    attendees: 45,
    category: 'Education',
    religion: 'orthodox',
    image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800'
  },
  // Muslim Events
  {
    id: 3,
    title: 'Community Iftar Gathering',
    date: 'Ramadan 15, 2026',
    time: '06:00 PM - 09:00 PM',
    location: 'Downtown Square',
    attendees: 200,
    category: 'Gathering',
    religion: 'muslim',
    image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 4,
    title: 'Weekly Halaqa',
    date: 'Every Friday',
    time: '07:00 PM - 08:30 PM',
    location: 'Main Mosque',
    attendees: 60,
    category: 'Education',
    religion: 'muslim',
    image: 'https://images.unsplash.com/photo-1593113512631-155e81fbd6d0?auto=format&fit=crop&q=80&w=800'
  },
  // Protestant Events
  {
    id: 5,
    title: 'Sunday Worship Service',
    date: 'Every Sunday',
    time: '10:00 AM - 12:00 PM',
    location: 'Grace Community Church',
    attendees: 350,
    category: 'Worship',
    religion: 'protestant',
    image: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 6,
    title: 'Youth Ministry Night',
    date: 'Sep 02, 2026',
    time: '06:00 PM - 08:30 PM',
    location: 'Church Hall',
    attendees: 85,
    category: 'Youth',
    religion: 'protestant',
    image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800'
  }
];

const EventsPage = () => {
  const { user } = useAuth();
  const isLeader = useIsLeader();
  const religionKey = (user?.religion?.toLowerCase() || 'orthodox') as keyof typeof themeStyles;
  const theme = themeStyles[religionKey] || themeStyles.orthodox;
  
  const filteredEvents = DUMMY_EVENTS.filter(event => event.religion === religionKey);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className={`bg-gradient-to-r ${theme.gradient} rounded-3xl p-8 sm:p-12 text-white mb-10 shadow-lg relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <Badge className="bg-white/20 text-white border-white/10 mb-4 backdrop-blur-md">Community Events</Badge>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight">Gather & Grow Together</h1>
            <p className="text-white/80 max-w-xl text-lg">
              Discover upcoming gatherings, volunteer opportunities, and study sessions in your community.
            </p>
          </div>
          {isLeader && (
            <button className="px-6 py-3 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap">
              <Plus className="w-5 h-5" /> Host Event
            </button>
          )}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredEvents.map((event) => (
          <div key={event.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
            <div className="h-48 relative overflow-hidden">
              <img 
                src={event.image} 
                alt={event.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4">
                <Badge className="bg-white/90 text-slate-900 border-none shadow-sm backdrop-blur-md font-semibold">
                  {event.category}
                </Badge>
              </div>
            </div>
            
            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-slate-700 transition-colors">
                {event.title}
              </h3>
              
              <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-center text-slate-600 gap-3">
                  <div className={`w-8 h-8 rounded-full ${theme.bg} flex items-center justify-center shrink-0`}>
                    <Calendar className={`w-4 h-4 ${theme.iconColor}`} />
                  </div>
                  <span className="text-sm font-medium">{event.date}</span>
                </div>
                
                <div className="flex items-center text-slate-600 gap-3">
                  <div className={`w-8 h-8 rounded-full ${theme.bg} flex items-center justify-center shrink-0`}>
                    <Clock className={`w-4 h-4 ${theme.iconColor}`} />
                  </div>
                  <span className="text-sm font-medium">{event.time}</span>
                </div>
                
                <div className="flex items-center text-slate-600 gap-3">
                  <div className={`w-8 h-8 rounded-full ${theme.bg} flex items-center justify-center shrink-0`}>
                    <MapPin className={`w-4 h-4 ${theme.iconColor}`} />
                  </div>
                  <span className="text-sm font-medium truncate">{event.location}</span>
                </div>
                
                <div className="flex items-center text-slate-600 gap-3">
                  <div className={`w-8 h-8 rounded-full ${theme.bg} flex items-center justify-center shrink-0`}>
                    <Users className={`w-4 h-4 ${theme.iconColor}`} />
                  </div>
                  <span className="text-sm font-medium">{event.attendees} attending</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button className={`flex-1 py-2.5 rounded-xl text-white font-medium transition-colors ${theme.accent} ${theme.accentHover}`}>
                  RSVP
                </button>
                <button className="w-11 h-11 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600 shrink-0">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsPage;
