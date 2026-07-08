import { useState, useEffect } from "react";
import {
  Plus,
  Heart,
  MessageCircle,
  User,
  ArrowRight,
  Sparkles,
  HelpCircle,
  ChevronRight,
  FileText,
  Users,
  Bell,
  Clock,
  BookOpen,
  Calendar,
  Quote,
  Play,
  Bookmark,
  ChevronLeft,
  Store,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.tsx";
import { postsApi } from "../services/api";
import Button from "../components/Button";
import Badge from "../components/Badge";
import DashboardHero from "../components/DashboardHero";

interface Post {
  id: string;
  title: string;
  content: string;
  isAnonymous: boolean;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  viewCount: number;
  leaderResponsesCount: number;
  createdAt: string;
}

const themeStyles = {
  orthodox: {
    lightBg: "bg-amber-50/50",
    border: "border-amber-100",
    borderHover: "hover:border-amber-200",
    text: "text-amber-900",
    textMuted: "text-amber-700",
    accent: "bg-amber-600",
    accentHover: "hover:bg-amber-700",
    ring: "focus:ring-amber-500",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  muslim: {
    lightBg: "bg-emerald-50/50",
    border: "border-emerald-100",
    borderHover: "hover:border-emerald-200",
    text: "text-emerald-900",
    textMuted: "text-emerald-700",
    accent: "bg-emerald-600",
    accentHover: "hover:bg-emerald-700",
    ring: "focus:ring-emerald-500",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  protestant: {
    lightBg: "bg-blue-50/50",
    border: "border-blue-100",
    borderHover: "hover:border-blue-200",
    text: "text-blue-900",
    textMuted: "text-blue-700",
    accent: "bg-blue-600",
    accentHover: "hover:bg-blue-700",
    ring: "focus:ring-blue-500",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const religionKey = (user?.religion?.toLowerCase() ||
    "orthodox") as keyof typeof themeStyles;
  const theme = themeStyles[religionKey] || themeStyles.orthodox;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await postsApi.getAll();
      const allPosts = response.data.data || [];
      setPosts(allPosts.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const displayName = user?.email ? user.email.split("@")[0] : "Adoni";

  const formatTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const quickLinks = [
    { label: "Teachings", icon: BookOpen, to: "/sermons" },
    { label: "Discussions", icon: MessageCircle, to: "/community" },
    { label: "Ask AI", icon: Sparkles, to: "/copilot" },
    { label: "Prayer Tracker", icon: Clock, to: "/tracker" },
    { label: "Marketplace", icon: Store, to: "/marketplace" },
    { label: "Donations", icon: Heart, to: "/donate" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-0 font-sans selection:bg-slate-200 overflow-x-hidden">
      <DashboardHero
        displayName={displayName}
        religion={user?.religion || "orthodox"}
      />

      {/* Main Container - Pulls up over the hero */}
      <main className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-24 space-y-16 pb-16">
        {/* 1. Quick Access Panel */}
        <section className="animate-fade-in-up">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickLinks.map((link, i) => (
              <Link
                key={i}
                to={link.to}
                className="group flex flex-col items-center p-5 bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:bg-white"
              >
                <div
                  className={`w-12 h-12 rounded-full ${theme.iconBg} flex items-center justify-center mb-3 transition-transform group-hover:scale-110`}
                >
                  <link.icon className={`w-5 h-5 ${theme.iconColor}`} />
                </div>
                <span className="text-sm font-semibold text-slate-800 text-center">
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <div className="grid gap-8 lg:gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] w-full min-w-0">
          {/* Left Column */}
          <div className="space-y-8 lg:space-y-12 min-w-0 w-full">
            {/* 2. Live Community Activity Feed */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Community Pulse
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Live discussions and prayers
                  </p>
                </div>
                <Link
                  to="/community"
                  className={`text-sm font-semibold ${theme.text} hover:opacity-80 flex items-center gap-1`}
                >
                  View Feed <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-32 bg-white rounded-2xl" />
                    ))}
                  </div>
                ) : (
                  posts.map((post) => (
                    <Link
                      key={post.id}
                      to={`/post/${post.id}`}
                      className="block group"
                    >
                      <div
                        className={`p-6 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-md ${theme.borderHover}`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={`w-10 h-10 rounded-full ${theme.lightBg} flex items-center justify-center`}
                          >
                            <User className={`w-5 h-5 ${theme.iconColor}`} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {post.isAnonymous
                                ? "Anonymous"
                                : "Community Member"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatTime(post.createdAt)}
                            </p>
                          </div>
                          {post.leaderResponsesCount > 0 && (
                            <Badge variant="success" className="ml-auto">
                              Leader Responded
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-slate-950 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-slate-600 text-sm line-clamp-2 mb-4 leading-relaxed">
                          {post.content}
                        </p>

                        <div className="flex items-center gap-4 text-slate-500 text-sm">
                          <div className="flex items-center gap-1.5 group-hover:text-rose-600 transition-colors">
                            <Heart className="w-4 h-4" />{" "}
                            <span>{post.likesCount}</span>
                          </div>
                          <div className="flex items-center gap-1.5 group-hover:text-blue-600 transition-colors">
                            <MessageCircle className="w-4 h-4" />{" "}
                            <span>{post.commentsCount}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>

            {/* 3. Featured Content Carousel */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Featured Content
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Curated teachings and videos
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>

              <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide w-full min-w-0">
                {[1, 2, 3].map((item) => (
                  <Link
                    key={item}
                    to="/sermons"
                    className="snap-start min-w-[260px] sm:min-w-[300px] w-[80vw] sm:w-[300px] shrink-0 group relative overflow-hidden rounded-2xl"
                  >
                    <div className="aspect-[4/3] bg-slate-200 relative">
                      <img
                        src={`https://images.unsplash.com/photo-1444392061274-5df677d24268?q=80&w=600&auto=format&fit=crop&sig=${item}`}
                        alt="Featured"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                          <Play
                            className="w-5 h-5 text-white"
                            fill="currentColor"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-0 w-full p-4">
                      <Badge
                        variant="default"
                        className="mb-2 bg-white/20 text-white border-white/10 backdrop-blur-md"
                      >
                        Series
                      </Badge>
                      <h3 className="text-white font-semibold leading-tight text-lg drop-shadow-md">
                        Finding Peace in the Modern World
                      </h3>
                      <p className="text-white/80 text-xs mt-1 drop-shadow">
                        12 mins • Rev. David
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-8 min-w-0 w-full">
            {/* 4. Inspiration & Reflection */}
            <section
              className={`p-8 rounded-3xl ${theme.lightBg} border ${theme.border} relative overflow-hidden group`}
            >
              <Quote
                className={`absolute -top-4 -right-4 w-24 h-24 opacity-10 ${theme.iconColor} -rotate-12 transition-transform duration-500 group-hover:rotate-0`}
              />
              <h3
                className={`text-sm font-bold uppercase tracking-wider ${theme.text} mb-4`}
              >
                Daily Reflection
              </h3>
              <p className="text-lg font-serif italic text-slate-800 leading-relaxed mb-6">
                "Peace I leave with you; my peace I give you. I do not give to
                you as the world gives. Do not let your hearts be troubled and
                do not be afraid."
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">
                  John 14:27
                </span>
                <button
                  className={`p-2 rounded-full bg-white shadow-sm ${theme.iconColor} hover:scale-105 transition-transform`}
                >
                  <Play className="w-4 h-4" fill="currentColor" />
                </button>
              </div>
            </section>

            {/* 5. Events & Calendar */}
            <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Upcoming Events
                </h2>
                <Calendar className="w-5 h-5 text-slate-400" />
              </div>

              <div className="space-y-4">
                {[
                  {
                    title: "Youth Fellowship",
                    date: "Tomorrow, 6 PM",
                    type: "Community",
                  },
                  {
                    title: "Sunday Worship Service",
                    date: "Sunday, 10 AM",
                    type: "Worship",
                  },
                  {
                    title: "Leadership Training",
                    date: "Next Tuesday",
                    type: "Equipping",
                  },
                ].map((event, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer border border-transparent hover:border-slate-100"
                  >
                    <div
                      className={`w-14 h-14 rounded-xl ${theme.lightBg} flex flex-col items-center justify-center shrink-0`}
                    >
                      <span
                        className={`text-xs font-bold uppercase ${theme.textMuted}`}
                      >
                        Jun
                      </span>
                      <span className={`text-lg font-bold ${theme.text}`}>
                        2{idx + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="font-semibold text-slate-900 truncate group-hover:text-slate-700 transition-colors">
                        {event.title}
                      </h4>
                      <p className="text-sm text-slate-500 truncate">
                        {event.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                variant="secondary"
                className="w-full mt-6 rounded-xl border-slate-200"
              >
                View Full Calendar
              </Button>
            </section>
          </div>
        </div>
      </main>

      {/* 6. Simple Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-8 h-8 rounded-lg shadow-sm"
            />
            <span className="font-semibold text-slate-900">Haymanote</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
            <Link
              to="/settings"
              className="hover:text-slate-900 transition-colors"
            >
              Settings
            </Link>
            <Link
              to="/contact"
              className="hover:text-slate-900 transition-colors"
            >
              Help & Contact
            </Link>
          </div>
          <p className="text-sm text-slate-400">
            © 2026 Haymanote. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardPage;
