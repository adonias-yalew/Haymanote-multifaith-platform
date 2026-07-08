import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, MessageCircle, Cross, Star, BookOpen, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { postsApi } from '../services/api';
import { useAuth, useIsAdmin } from '../hooks/useAuth.tsx';
import PostCard from '../components/PostCard';
import Button from '../components/Button';

interface Post {
  id: string;
  title: string;
  content: string;
  isAnonymous: boolean;
  authorId: string;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  viewCount: number;
  leaderResponsesCount: number;
  createdAt: string;
}

const MyPostsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());

  const religion = user?.religion?.toLowerCase() || 'orthodox';
  const isNoReligion = isAdmin || !user?.religion;

  const theme = isNoReligion
    ? { gradient: 'from-indigo-500/10 via-indigo-400/5 to-transparent', accent: 'indigo', icon: BookOpen, symbol: '\u{1F4D6}' }
    : religion === 'muslim'
    ? { gradient: 'from-emerald-500/10 via-emerald-400/5 to-transparent', accent: 'emerald', icon: Star, symbol: '\u{262A}' }
    : religion === 'protestant'
    ? { gradient: 'from-blue-500/10 via-blue-400/5 to-transparent', accent: 'blue', icon: Cross, symbol: '\u{271D}' }
    : { gradient: 'from-amber-500/10 via-amber-400/5 to-transparent', accent: 'amber', icon: Cross, symbol: '\u{2626}' };

  const AccentIcon = theme.icon;

  const bannerBg = isNoReligion ? 'from-indigo-500/10 via-indigo-400/5 to-transparent border-indigo-200/40' :
    religion === 'muslim' ? 'from-emerald-500/10 via-emerald-400/5 to-transparent border-emerald-200/40' :
    religion === 'protestant' ? 'from-blue-500/10 via-blue-400/5 to-transparent border-blue-200/40' :
    'from-amber-500/10 via-amber-400/5 to-transparent border-amber-200/40';

  const iconBg = isNoReligion ? 'border-indigo-200/50' :
    religion === 'muslim' ? 'border-emerald-200/50' :
    religion === 'protestant' ? 'border-blue-200/50' :
    'border-amber-200/50';

  const iconColor = isNoReligion ? 'text-indigo-600' :
    religion === 'muslim' ? 'text-emerald-600' :
    religion === 'protestant' ? 'text-blue-600' :
    'text-amber-600';

  const titleColor = isNoReligion ? 'text-indigo-800' :
    religion === 'muslim' ? 'text-emerald-800' :
    religion === 'protestant' ? 'text-blue-800' :
    'text-amber-800';

  const subtitleColor = isNoReligion ? 'text-indigo-600/80' :
    religion === 'muslim' ? 'text-emerald-600/80' :
    religion === 'protestant' ? 'text-blue-600/80' :
    'text-amber-600/80';

  const postBorder = isNoReligion ? 'hover:border-indigo-200/60' :
    religion === 'muslim' ? 'hover:border-emerald-200/60' :
    religion === 'protestant' ? 'hover:border-blue-200/60' :
    'hover:border-amber-200/60';

  const viewBtnHover = isNoReligion ? 'hover:border-indigo-300 hover:text-indigo-700' :
    religion === 'muslim' ? 'hover:border-emerald-300 hover:text-emerald-700' :
    religion === 'protestant' ? 'hover:border-blue-300 hover:text-blue-700' :
    'hover:border-amber-300 hover:text-amber-700';

  const emptyGradient = isNoReligion ? 'from-indigo-500 to-purple-600' :
    religion === 'muslim' ? 'from-emerald-500 to-emerald-600' :
    religion === 'protestant' ? 'from-blue-500 to-blue-600' :
    'from-amber-500 to-amber-600';

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const fetchMyPosts = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await postsApi.getMyPosts();
      const myPosts = response.data.data || [];
      setPosts(myPosts);
      const likeEntries = await Promise.all(
        myPosts.map(async (post: Post) => {
          try {
            const likeResponse = await postsApi.checkLike(post.id);
            return [post.id, Boolean(likeResponse.data.hasLiked)] as const;
          } catch {
            return [post.id, false] as const;
          }
        }),
      );
      setLikedPostIds(new Set(likeEntries.filter(([, liked]) => liked).map(([postId]) => postId)));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch your questions');
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

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      await postsApi.delete(postId);
      setPosts(posts.filter(p => p.id !== postId));
    } catch {
      alert('Failed to delete question');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Questions</h1>
            <p className="text-sm text-slate-500">
              Manage your questions and view responses
            </p>
          </div>
        </div>
        <Link to="/create-post">
          <Button leftIcon={<Plus className="w-4 h-4" />}>
            Ask Question
          </Button>
        </Link>
      </div>

      {/* Religion-themed Banner */}
      {!isNoReligion && (
        <div className={`relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-r border shadow-sm ${bannerBg}`}>
          <div className="absolute -top-6 -right-6 text-7xl opacity-10 select-none">
            {theme.symbol}
          </div>
          <div className="absolute -bottom-4 -left-4 text-6xl opacity-10 select-none rotate-12">
            {theme.symbol}
          </div>
          <div className="relative z-10 flex items-center gap-4 px-5 py-4">
            <div className={`w-12 h-12 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm border ${iconBg} flex items-center justify-center`}>
              <AccentIcon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <div>
              <p className={`text-sm font-semibold ${titleColor} capitalize`}>
                {religion} Community
              </p>
              <p className={`text-xs ${subtitleColor}`}>
                {posts.length} {posts.length === 1 ? 'question' : 'questions'} asked
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Count */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-700">{posts.length}</span> {posts.length === 1 ? 'question' : 'questions'}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Posts List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 animate-pulse border border-slate-100 shadow-sm">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-4" />
              <div className="h-3 bg-slate-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-slate-200 rounded w-full" />
            </div>
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className={`group bg-white rounded-2xl p-5 shadow-sm border border-slate-100 transition-all hover:shadow-md ${postBorder}`}>
              <PostCard
                post={post}
                isLiked={likedPostIds.has(post.id)}
                onLike={() => handleLikePost(post.id)}
                onSave={() => console.log('Save post:', post.id)}
              />
              <div className="mt-4 pt-4 border-t border-slate-100 flex gap-3">
                <Link to={`/post/${post.id}`} className="flex-1">
                  <button className={`w-full py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 font-medium ${viewBtnHover} transition-colors text-sm`}>
                    View Responses
                  </button>
                </Link>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="px-4 py-2.5 rounded-xl text-red-600 font-medium hover:bg-red-50 transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-b ${theme.gradient} opacity-30`} />
          <div className="relative z-10">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${emptyGradient} flex items-center justify-center mx-auto mb-5 shadow-lg`}>
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No questions yet</h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
              You haven&apos;t asked any questions yet. Seek guidance and grow in your faith!
            </p>
            <Link to="/create-post">
              <Button leftIcon={<Plus className="w-4 h-4" />}>
                Ask Your First Question
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPostsPage;