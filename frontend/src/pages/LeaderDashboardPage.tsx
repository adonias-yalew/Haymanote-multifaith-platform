import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Clock,
  FileText,
  HandHeart,
  MessageSquare,
  PenLine,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react';
import Badge from '../components/Badge';
import DashboardHero from '../components/DashboardHero';
import { useAuth } from '../hooks/useAuth.tsx';
import { postsApi, sermonsApi } from '../services/api';
import type { Post, Sermon } from '../types';

const pageTitles: Record<string, string> = {
  dashboard: 'Leader Dashboard',
  members: 'Members',
  meetings: 'Meetings',
  messages: 'Messages',
  calendar: 'Calendar',
  notes: 'Notes',
};

const sectionFromPath = (pathname: string) => {
  const section = pathname.split('/')[2] || 'dashboard';
  return pageTitles[section] ? section : 'dashboard';
};

const themeStyles = {
  orthodox: {
    accent: 'bg-amber-600',
    accentHover: 'hover:bg-amber-700',
    text: 'text-amber-900',
    textMuted: 'text-amber-700',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-700',
    borderHover: 'hover:border-amber-200',
  },
  muslim: {
    accent: 'bg-emerald-600',
    accentHover: 'hover:bg-emerald-700',
    text: 'text-emerald-900',
    textMuted: 'text-emerald-700',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-700',
    borderHover: 'hover:border-emerald-200',
  },
  protestant: {
    accent: 'bg-blue-600',
    accentHover: 'hover:bg-blue-700',
    text: 'text-blue-900',
    textMuted: 'text-blue-700',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-700',
    borderHover: 'hover:border-blue-200',
  },
};

const LeaderDashboardPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const section = sectionFromPath(location.pathname);
  const displayName = user?.email ? user.email.split('@')[0] : 'Leader';

  if (section !== 'dashboard') {
    return (
      <div className="mx-auto max-w-7xl space-y-6 pb-8">
        <PageHeader title={pageTitles[section]} />
        <UnavailablePanel title={pageTitles[section]} />
      </div>
    );
  }

  return <DashboardHome displayName={displayName} religion={user?.religion || 'orthodox'} />;
};

const DashboardHome = ({ displayName, religion }: { displayName: string; religion: string }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const religionKey = (religion.toLowerCase() || 'orthodox') as keyof typeof themeStyles;
  const theme = themeStyles[religionKey] || themeStyles.orthodox;

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [postsResponse, sermonsResponse] = await Promise.all([
          postsApi.getAll(),
          sermonsApi.getAll(),
        ]);
        setPosts(postsResponse.data.data || []);
        setSermons(sermonsResponse.data.data || []);
      } catch (error) {
        console.error('Failed to fetch leader dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const unansweredPosts = useMemo(
    () => posts.filter((post) => (post.leaderResponsesCount || 0) === 0),
    [posts],
  );
  const answeredPosts = useMemo(
    () => posts.filter((post) => (post.leaderResponsesCount || 0) > 0),
    [posts],
  );
  const totalSermonViews = sermons.reduce((total, sermon) => total + (sermon.viewCount || 0), 0);

  const stats = [
    { label: 'Community Questions', value: posts.length, icon: MessageSquare, tone: theme.iconBg, iconTone: theme.iconColor },
    { label: 'Awaiting Leader Reply', value: unansweredPosts.length, icon: Clock, tone: theme.iconBg, iconTone: theme.iconColor },
    { label: 'Published Sermons', value: sermons.length, icon: BookOpen, tone: theme.iconBg, iconTone: theme.iconColor },
    { label: 'Sermon Views', value: totalSermonViews, icon: Users, tone: theme.iconBg, iconTone: theme.iconColor },
  ];

  const quickLinks = [
    { label: 'Answer Questions', icon: MessageSquare, to: '/community' },
    { label: 'Create Question', icon: PenLine, to: '/create-post' },
    { label: 'My Teachings', icon: FileText, to: '/leader/my-teachings' },
    { label: 'Sermons', icon: BookOpen, to: '/sermons' },
    { label: 'AI Copilot', icon: Sparkles, to: '/copilot' },
    { label: 'Help & Contact', icon: HandHeart, to: '/contact' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-0 font-sans selection:bg-slate-200 overflow-x-hidden">
      <DashboardHero
        displayName={displayName}
        religion={religion}
        eyebrow="Leader workspace"
        title={`Welcome back, ${displayName}`}
        subtitle={`Guide questions, publish teachings, and serve your ${religion} community from one focused workspace.`}
      >
        <div className="grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 backdrop-blur-sm">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="mt-1 text-xs font-medium text-white/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </DashboardHero>

      <main className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-24 space-y-16 pb-16">
        <section className="animate-fade-in-up">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="group flex flex-col items-center rounded-2xl border border-white/40 bg-white/75 p-5 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-1 hover:bg-white hover:shadow-md"
              >
                <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${theme.iconBg} transition-transform group-hover:scale-110`}>
                  <link.icon className={`h-5 w-5 ${theme.iconColor}`} />
                </div>
                <span className="text-center text-sm font-semibold text-slate-800">{link.label}</span>
              </Link>
            ))}
          </div>
        </section>

        <div className="grid w-full min-w-0 gap-8 lg:gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
          <div className="min-w-0 space-y-8 lg:space-y-12">
            <section>
              <SectionHeader
                title="Questions Needing Guidance"
                description="Community questions without a leader response"
                link="/community"
                linkLabel="View Community"
                themeText={theme.text}
              />
              <div className="space-y-4">
                {isLoading ? (
                  <LoadingCards />
                ) : unansweredPosts.length > 0 ? (
                  unansweredPosts.slice(0, 4).map((post) => (
                    <QuestionCard key={post.id} post={post} borderHover={theme.borderHover} />
                  ))
                ) : (
                  <EmptyState
                    icon={MessageSquare}
                    title="No questions are waiting"
                    description="When community questions need a leader response, they will appear here."
                  />
                )}
              </div>
            </section>

            <section>
              <SectionHeader
                title="Recent Sermons"
                description="Published teaching content from the sermon library"
                link="/sermons"
                linkLabel="Open Sermons"
                themeText={theme.text}
              />
              <div className="grid gap-4 md:grid-cols-2">
                {isLoading ? (
                  <LoadingCards />
                ) : sermons.length > 0 ? (
                  sermons.slice(0, 4).map((sermon) => (
                    <SermonCard key={sermon.id} sermon={sermon} borderHover={theme.borderHover} />
                  ))
                ) : (
                  <EmptyState
                    icon={BookOpen}
                    title="No sermons published yet"
                    description="Published sermons from the existing sermon library will appear here."
                  />
                )}
              </div>
            </section>
          </div>

          <div className="min-w-0 space-y-8">
            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Leader Overview</h2>
              <div className="mt-5 space-y-4">
                {stats.map((stat) => (
                  <StatRow key={stat.label} {...stat} />
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Answered Discussions</h2>
              <p className="mt-1 text-sm text-slate-500">Questions that already have leader responses.</p>
              <div className="mt-5 space-y-3">
                {answeredPosts.length > 0 ? (
                  answeredPosts.slice(0, 3).map((post) => (
                    <Link key={post.id} to={`/post/${post.id}`} className="block rounded-xl border border-slate-100 p-3 transition-colors hover:bg-slate-50">
                      <p className="line-clamp-1 text-sm font-semibold text-slate-900">{post.title || 'Question'}</p>
                      <p className="mt-1 text-xs text-slate-500">{post.leaderResponsesCount} leader response{post.leaderResponsesCount === 1 ? '' : 's'}</p>
                    </Link>
                  ))
                ) : (
                  <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                    Answered discussions will appear here once real community responses exist.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

const PageHeader = ({ title }: { title: string }) => (
  <div>
    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
      <Link to="/dashboard/leader" className="text-slate-700 hover:text-slate-950">Leader</Link>
      <ChevronRight className="h-4 w-4" />
      <span>{title}</span>
    </div>
    <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
  </div>
);

const UnavailablePanel = ({ title }: { title: string }) => (
  <section className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-card">
    <HandHeart className="mx-auto h-10 w-10 text-slate-300" />
    <h2 className="mt-4 text-lg font-semibold text-slate-950">{title}</h2>
    <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
      This area is ready for real leader data, but there is no connected data source for it yet.
    </p>
  </section>
);

const SectionHeader = ({
  title,
  description,
  link,
  linkLabel,
  themeText,
}: {
  title: string;
  description: string;
  link: string;
  linkLabel: string;
  themeText: string;
}) => (
  <div className="mb-6 flex items-center justify-between gap-4">
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
    <Link to={link} className={`flex items-center gap-1 text-sm font-semibold ${themeText} hover:opacity-80`}>
      {linkLabel}
      <ArrowRight className="h-4 w-4" />
    </Link>
  </div>
);

const QuestionCard = ({ post, borderHover }: { post: Post; borderHover: string }) => (
  <Link to={`/post/${post.id}`} className="block group">
    <div className={`rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md ${borderHover}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <Badge variant="warning">Needs guidance</Badge>
        <span className="text-xs font-medium text-slate-500">{formatTime(post.createdAt)}</span>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-slate-800 transition-colors group-hover:text-slate-950">
        {post.title || 'Question'}
      </h3>
      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-slate-600">{post.content}</p>
      <div className="flex items-center gap-4 text-sm text-slate-500">
        <span>{post.likesCount || 0} likes</span>
        <span>{post.commentsCount || 0} comments</span>
      </div>
    </div>
  </Link>
);

const SermonCard = ({ sermon, borderHover }: { sermon: Sermon; borderHover: string }) => (
  <Link to={`/sermons`} className="block group">
    <div className={`h-full rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md ${borderHover}`}>
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        <BookOpen className="h-5 w-5" />
      </div>
      <h3 className="line-clamp-2 text-base font-semibold text-slate-900 group-hover:text-slate-950">{sermon.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{sermon.excerpt || sermon.content}</p>
      <div className="mt-4 flex items-center gap-3 text-xs font-medium text-slate-500">
        <span>{sermon.viewCount || 0} views</span>
        <span>{formatTime(sermon.createdAt)}</span>
      </div>
    </div>
  </Link>
);

const StatRow = ({
  icon: Icon,
  label,
  value,
  tone,
  iconTone,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  tone: string;
  iconTone: string;
}) => (
  <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 p-4">
    <div className="flex items-center gap-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
        <Icon className={`h-5 w-5 ${iconTone}`} />
      </div>
      <p className="text-sm font-medium text-slate-600">{label}</p>
    </div>
    <p className="text-xl font-bold text-slate-950">{value}</p>
  </div>
);

const EmptyState = ({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) => (
  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
    <Icon className="mx-auto h-10 w-10 text-slate-300" />
    <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
    <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{description}</p>
  </div>
);

const LoadingCards = () => (
  <>
    {[1, 2].map((item) => (
      <div key={item} className="h-32 animate-pulse rounded-2xl bg-white" />
    ))}
  </>
);

const formatTime = (date: string) => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (Number.isNaN(diffHours)) return '';
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default LeaderDashboardPage;
