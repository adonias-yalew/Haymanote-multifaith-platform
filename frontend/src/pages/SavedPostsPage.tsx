import { useState, useEffect } from 'react';
import { Bookmark, Search, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import PostCard from '../components/PostCard';
import Button from '../components/Button';
import { postsApi } from '../services/api';
import { useAuth } from '../hooks/useAuth.tsx';

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

const SavedPostsPage = () => {
  const { isAuthenticated } = useAuth();
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  const fetchSavedPosts = async () => {
    setIsLoading(true);
    try {
      const response = await postsApi.getSaved();
      setSavedPosts(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch saved posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsave = async (postId: string) => {
    try {
      await postsApi.unsave(postId);
      setSavedPosts(savedPosts.filter((p) => p.id !== postId));
    } catch (error) {
      console.error('Failed to unsave post:', error);
    }
  };

  const filtered = savedPosts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bookmark className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Saved Stories</h1>
            <p className="text-[var(--text-secondary)]">
              {savedPosts.length} {savedPosts.length === 1 ? 'story' : 'stories'} saved
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      {savedPosts.length > 0 && (
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search saved stories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--warm-white)] border border-[var(--beige)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[var(--warm-white)] rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-[var(--beige)] rounded w-3/4 mb-4" />
              <div className="h-3 bg-[var(--beige)] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((post) => (
            <div key={post.id} className="relative group">
              <PostCard
                post={post}
                isSaved={true}
                onSave={() => handleUnsave(post.id)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[var(--warm-white)] rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-[var(--beige-light)] flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-8 h-8 text-[var(--text-muted)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            {search ? 'No stories match your search' : 'No saved stories yet'}
          </h3>
          <p className="text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">
            {search
              ? 'Try adjusting your search terms'
              : 'Stories you save will appear here for easy access'}
          </p>
          {!search && (
            <Link to="/">
              <Button>Browse Stories</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default SavedPostsPage;
