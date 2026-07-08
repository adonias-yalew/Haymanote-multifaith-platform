import { useState, useEffect } from "react";
import {
  Plus,
  TrendingUp,
  Clock,
  Stethoscope,
  Users,
  Calendar,
  ArrowRight,
  MessageCircle,
  Heart,
  Share2,
  HelpCircle,
  Book,
  BadgeCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import PostCard from "../components/PostCard";
import Button from "../components/Button";
import Badge from "../components/Badge";
import { postsApi } from "../services/api";
import { useAuth, useIsLeader } from "../hooks/useAuth.tsx";

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

type FilterType = "latest" | "trending" | "leader";

const themeStyles = {
  orthodox: {
    heroImg: "/orthodox/orthodox-community-hero.jpg",
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
    heroOverlay:
      "bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-amber-900/40",
  },
  muslim: {
    heroImg: "/muslim/muslim-community-hero.jpg",
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
    heroOverlay:
      "bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-emerald-900/40",
  },
  protestant: {
    heroImg: "/protestant/protestant-community-hero.jpg",
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
    heroOverlay:
      "bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-blue-900/40",
  },
};

const HomePage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<FilterType>("latest");
  const [isLoading, setIsLoading] = useState(true);
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const { user, isAuthenticated } = useAuth();
  const isLeader = useIsLeader();

  const religionKey = (user?.religion?.toLowerCase() ||
    "orthodox") as keyof typeof themeStyles;
  const theme = themeStyles[religionKey] || themeStyles.orthodox;

  const rulesWidget = (
    <div
      className={`bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group mb-2`}
    >
      <div
        className={`absolute top-0 left-0 w-1 h-full ${theme.accent}`}
      />
      <div className="flex items-center gap-2 mb-6">
        <Book className={`w-5 h-5 ${theme.iconColor}`} />
        <h3 className="text-lg font-bold text-slate-900">
          Community Rules
        </h3>
      </div>
      <div className="space-y-4">
        <div className="text-sm text-slate-600 space-y-3">
          <p className="flex gap-2">
            <span className="font-bold text-slate-800">1.</span>
            Be respectful and compassionate to all members.
          </p>
          <p className="flex gap-2">
            <span className="font-bold text-slate-800">2.</span>
            Ensure discussions are aligned with our faith and values.
          </p>
          <p className="flex gap-2">
            <span className="font-bold text-slate-800">3.</span>
            No hate speech, bullying, or harassment.
          </p>
          <p className="flex gap-2">
            <span className="font-bold text-slate-800">4.</span>
            Keep advice scriptural and spiritually sound.
          </p>
          <p className="flex gap-2">
            <span className="font-bold text-slate-800">5.</span>
            Respect privacy; do not share others' personal information.
          </p>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await postsApi.getAll();
      let fetchedPosts = response.data.data || [];

      if (filter === "trending") {
        fetchedPosts = fetchedPosts.sort(
          (a: Post, b: Post) =>
            b.likesCount + b.commentsCount - (a.likesCount + a.commentsCount),
        );
      } else if (filter === "leader") {
        fetchedPosts = fetchedPosts.filter(
          (p: Post) => p.leaderResponsesCount > 0,
        );
      }

      setPosts(fetchedPosts);
      const likeEntries = await Promise.all(
        fetchedPosts.map(async (post: Post) => {
          try {
            const likeResponse = await postsApi.checkLike(post.id);
            return [post.id, Boolean(likeResponse.data.hasLiked)] as const;
          } catch {
            return [post.id, false] as const;
          }
        }),
      );
      setLikedPostIds(new Set(likeEntries.filter(([, liked]) => liked).map(([postId]) => postId)));
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    const wasLiked = likedPostIds.has(postId);
    setLikedPostIds((current) => {
      const next = new Set(current);
      wasLiked ? next.delete(postId) : next.add(postId);
      return next;
    });
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? { ...post, likesCount: Math.max(0, (post.likesCount || 0) + (wasLiked ? -1 : 1)) }
          : post,
      ),
    );

    try {
      if (wasLiked) {
        await postsApi.unlike(postId);
      } else {
        await postsApi.like(postId);
      }
    } catch {
      setLikedPostIds((current) => {
        const next = new Set(current);
        wasLiked ? next.add(postId) : next.delete(postId);
        return next;
      });
      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === postId
            ? { ...post, likesCount: Math.max(0, (post.likesCount || 0) + (wasLiked ? 1 : -1)) }
            : post,
        ),
      );
    }
  };

  const filters: { key: FilterType; label: string; icon: typeof Clock }[] = [
    { key: "latest", label: "Latest", icon: Clock },
    { key: "trending", label: "Trending", icon: TrendingUp },
    { key: "leader", label: "Leader Replies", icon: BadgeCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans overflow-x-hidden pb-12">
      {/* Community Hero Banner */}
      <div className="relative w-full h-[400px] lg:h-[450px] overflow-hidden mb-12">
        <img
          src={theme.heroImg}
          alt="Community Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className={`absolute inset-0 ${theme.heroOverlay}`} />

        <div className="relative z-10 h-full flex flex-col justify-end px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12 w-full min-w-0">
          <div className="max-w-3xl w-full min-w-0 animate-fade-in-up">
            <Badge className="bg-white/20 text-white border-white/10 backdrop-blur-md mb-4 uppercase tracking-wider">
              {user?.religion || "Orthodox"} Community
            </Badge>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight drop-shadow-md break-words">
              Connect. Share. Grow.
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-slate-300 font-medium mb-8 max-w-2xl drop-shadow line-clamp-2">
              Join discussions, ask questions, and share your spiritual journey
              with people who understand.
            </p>

            <div className="flex flex-wrap items-center gap-6 text-white/80 text-sm font-medium">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-white/90" />
                <span>10k+ Members</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-white/90" />
                <span>500+ Daily Posts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0">
        <div className="grid gap-8 lg:gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(300px,350px)] w-full min-w-0">
          {/* Left Column: Social Feed */}
          <div className="space-y-6 w-full min-w-0">
            {/* Rules visible only on Mobile/Tablet (above "What's on your mind") */}
            <div className="lg:hidden block">
              {rulesWidget}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4 items-center">
              <div
                className={`w-12 h-12 rounded-full ${theme.lightBg} flex items-center justify-center shrink-0`}
              >
                <MessageCircle className={`w-6 h-6 ${theme.iconColor}`} />
              </div>
              <div className="flex-1 w-full min-w-0">
                <h3 className="text-lg font-semibold text-slate-900 truncate">
                  What's on your mind?
                </h3>
                <p className="text-sm text-slate-500 truncate">
                  Ask a question or share a testimony
                </p>
              </div>
              <div className="flex w-full sm:w-auto gap-3 shrink-0">
                <Link to="/create-post" className="flex-1 sm:flex-none">
                  <button
                    className={`w-full px-5 py-2.5 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2 ${theme.accent} ${theme.accentHover}`}
                  >
                    <HelpCircle className="w-4 h-4" /> Ask Question
                  </button>
                </Link>
                {isLeader && (
                  <Link to="/create-post" className="flex-1 sm:flex-none">
                    <button
                      className={`w-full px-5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 font-medium hover:border-slate-300 transition-colors flex items-center justify-center gap-2 bg-white`}
                    >
                      <Stethoscope className="w-4 h-4 text-slate-500" /> Share
                      Guidance
                    </button>
                  </Link>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 pt-2">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    filter === f.key
                      ? `${theme.accent} text-white shadow-md`
                      : `bg-white text-slate-600 hover:text-slate-900 border border-slate-200 ${theme.borderHover}`
                  }`}
                >
                  <f.icon className="w-4 h-4" />
                  {f.label}
                </button>
              ))}
            </div>

            {/* Feed */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-slate-200 rounded-full" />
                      <div className="space-y-2">
                        <div className="h-3 bg-slate-200 rounded w-24" />
                        <div className="h-2 bg-slate-200 rounded w-16" />
                      </div>
                    </div>
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
                    <div className="h-3 bg-slate-200 rounded w-full mb-2" />
                    <div className="h-3 bg-slate-200 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    isLiked={likedPostIds.has(post.id)}
                    onLike={() => handleLikePost(post.id)}
                    onSave={() => console.log("Save post:", post.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-slate-500 mb-4">No questions found.</p>
                {isAuthenticated && (
                  <Link to="/create-post">
                    <button
                      className={`px-5 py-2.5 rounded-xl text-white font-medium transition-colors ${theme.accent} ${theme.accentHover}`}
                    >
                      Be the first to ask
                    </button>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Sidebar Widgets */}
          <div className="space-y-6 w-full min-w-0 hidden lg:block">
            {/* Community Rules Widget */}
            {rulesWidget}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
