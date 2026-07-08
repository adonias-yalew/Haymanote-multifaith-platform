import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Star,
  Award,
  Book,
  Mail,
  MessageCircle,
  Filter,
  CheckCircle,
  GraduationCap,
  Clock
} from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import Badge from '../components/Badge';

interface Leader {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  credentials: string;
  yearsOfExperience: number;
  bio: string;
  isVerified: boolean;
  badge: 'NONE' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  rating: number;
  reviewCount: number;
  availability: string;
  languages: string[];
}

const mockLeaders: Leader[] = [
  {
    id: '1',
    name: 'Pastor Yohannes Alemu',
    email: 'yohannes@example.com',
    avatar: '',
    role: 'Senior Pastor',
    credentials: 'M.Div. in Theology',
    yearsOfExperience: 15,
    bio: 'Dedicated to teaching the word and guiding the congregation towards a deeper spiritual connection.',
    isVerified: true,
    badge: 'GOLD',
    rating: 4.9,
    reviewCount: 128,
    availability: 'Mon-Fri, 9AM-5PM',
    languages: ['English', 'Amharic'],
  },
  {
    id: '2',
    name: 'Teacher Sara Hailu',
    email: 'sara.hailu@example.com',
    avatar: '',
    role: 'Youth Ministry',
    credentials: 'B.A. in Christian Education',
    yearsOfExperience: 10,
    bio: 'Passionate about helping young adults navigate life transitions through faith and fellowship.',
    isVerified: true,
    badge: 'SILVER',
    rating: 4.7,
    reviewCount: 86,
    availability: 'Tue-Sat, 10AM-6PM',
    languages: ['English', 'Amharic', 'Oromiffa'],
  },
  {
    id: '3',
    name: 'Priest Lemma Bekele',
    email: 'lemma.bekele@example.com',
    avatar: '',
    role: 'Spiritual Guidance & Prayer',
    credentials: 'Dip. in Pastoral Studies',
    yearsOfExperience: 8,
    bio: 'Providing a safe space for spiritual guidance, confession, and prayer support for families.',
    isVerified: true,
    badge: 'BRONZE',
    rating: 4.8,
    reviewCount: 64,
    availability: 'Mon, Wed, Fri, 2PM-8PM',
    languages: ['Amharic', 'Oromiffa'],
  },
];

const badgeColors = {
  NONE: 'bg-gray-100 text-gray-600',
  BRONZE: 'bg-amber-100 text-amber-700',
  SILVER: 'bg-slate-100 text-slate-700',
  GOLD: 'bg-yellow-100 text-yellow-700',
  PLATINUM: 'bg-purple-100 text-purple-700',
};

const LeadersPage = () => {
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState<Leader[]>(mockLeaders);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const filteredLeaders = leaders.filter((leader) => {
    const matchesSearch = leader.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         leader.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'All' || leader.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const roles = ['All', ...new Set(leaders.map(l => l.role))];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Spiritual Leaders</h1>
          <p className="text-sm text-slate-600">
            Connect with verified leaders for guidance and support
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search by name or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {roles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Leaders Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse border border-slate-100">
              <div className="h-20 bg-slate-200 rounded-xl mb-4" />
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredLeaders.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeaders.map((leader) => (
            <div 
              key={leader.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
                  {leader.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 truncate">{leader.name}</h3>
                    {leader.isVerified && (
                      <CheckCircle className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{leader.role}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-medium text-slate-700">{leader.rating}</span>
                    <span className="text-sm text-slate-400">({leader.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Badge */}
              <Badge 
                variant="primary" 
                size="sm"
                className={`mb-3 ${badgeColors[leader.badge]}`}
              >
                <Award className="w-3 h-3 mr-1" />
                {leader.badge} Leader
              </Badge>

              {/* Details */}
              <div className="space-y-2 text-sm text-slate-600 mb-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-slate-400" />
                  <span className="truncate">{leader.credentials}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Book className="w-4 h-4 text-slate-400" />
                  <span>{leader.yearsOfExperience} years serving</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{leader.availability}</span>
                </div>
              </div>

              {/* Bio */}
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                {leader.bio}
              </p>

              {/* Languages */}
              <div className="flex flex-wrap gap-1 mb-4">
                {leader.languages.map((lang) => (
                  <span 
                    key={lang}
                    className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full"
                  >
                    {lang}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="flex-1"
                  leftIcon={<Mail className="w-4 h-4" />}
                >
                  Email
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1"
                  leftIcon={<MessageCircle className="w-4 h-4" />}
                >
                  Message
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No leaders found</h3>
          <p className="text-slate-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default LeadersPage;
