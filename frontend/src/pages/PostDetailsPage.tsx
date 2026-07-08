import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  Bookmark,
  Eye,
  MessageCircle,
  Flag,
  User,
} from 'lucide-react';
import Button from '../components/Button';
import Badge from '../components/Badge';
import CommentBox from '../components/CommentBox';
import LeaderReplyCard from '../components/LeaderReplyCard';
import ReportDialog from '../components/ReportDialog';
import ShareMenu from '../components/ShareMenu';
import { postsApi, commentsApi } from '../services/api';
import { useAuth } from '../hooks/useAuth.tsx';
import { useSavedPosts } from '../hooks/useSavedPosts';
import type { Post, Comment } from '../types';

const PostDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const { isSaved, toggleSave } = useSavedPosts();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [error, setError] = useState('');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPost();
      fetchComments();
      fetchLikeState();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await postsApi.getById(id!);
      setPost(response.data.data || response.data);
    } catch {
      setError('Failed to load this story. It may have been removed.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentsApi.getByPost(id!);
      setComments(response.data.data || response.data || []);
    } catch {
      // silent fail
    }
  };

  const fetchLikeState = async () => {
    try {
      const response = await postsApi.checkLike(id!);
      setHasLiked(Boolean(response.data.hasLiked));
    } catch {
      setHasLiked(false);
    }
  };

  const handleLikePost = async () => {
    if (!post) return;
    const nextLiked = !hasLiked;
    setHasLiked(nextLiked);
    setPost({
      ...post,
      likesCount: Math.max(0, (post.likesCount || 0) + (nextLiked ? 1 : -1)),
    });

    try {
      if (nextLiked) {
        await postsApi.like(post.id);
      } else {
        await postsApi.unlike(post.id);
      }
    } catch {
      setHasLiked(!nextLiked);
      setPost(post);
    }
  };

  const handleComment = async (content: string, isAnonymous: boolean) => {
    if (!id) return;
    setIsSubmittingComment(true);
    try {
      await commentsApi.create({ postId: id, content, isAnonymous });
      await fetchComments();
    } catch {
      // silent fail
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      await commentsApi.like(commentId);
      // Optimistically update comment likes count
      setComments(comments.map(c => 
        c.id === commentId ? { ...c, likesCount: (c.likesCount || 0) + 1 } : c
      ));
    } catch (err) {
      console.error('Failed to like comment');
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const leaderComments = comments.filter(
    (c) => c.isLeader || c.author?.role === 'leader' || c.isLeaderResponse
  );

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse space-y-4">
        <div className="h-6 bg-[var(--beige)] rounded w-40" />
        <div className="bg-[var(--warm-white)] rounded-2xl p-6 space-y-3">
          <div className="flex gap-3 items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-[var(--beige)]" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-[var(--beige)] rounded w-32" />
              <div className="h-3 bg-[var(--beige)] rounded w-20" />
            </div>
          </div>
          <div className="h-7 bg-[var(--beige)] rounded w-3/4" />
          <div className="h-4 bg-[var(--beige)] rounded" />
          <div className="h-4 bg-[var(--beige)] rounded w-5/6" />
          <div className="h-4 bg-[var(--beige)] rounded w-4/6" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <p className="text-[var(--text-muted)] mb-6 text-lg">{error || 'Story not found.'}</p>
        <Link to="/community">
          <Button variant="secondary">Back to Community</Button>
        </Link>
      </div>
    );
  }

  const getAvatarBg = (religion?: string) => {
    switch (religion?.toLowerCase()) {
      case 'orthodox':
        return 'from-amber-500 to-yellow-600';
      case 'muslim':
        return 'from-emerald-500 to-green-600';
      case 'protestant':
        return 'from-blue-500 to-sky-600';
      default:
        return 'from-indigo-500 to-violet-600';
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Back navigation */}
      <div className="flex items-center gap-2 mb-6">
        <Link
          to="/community"
          className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Community
        </Link>
      </div>

      {/* Post Card */}
      <div className="bg-[var(--warm-white)] rounded-2xl p-6 shadow-card mb-6">
        {/* Author row */}
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarBg(post.religion)} flex items-center justify-center flex-shrink-0`}>
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-[var(--text-primary)]">
              {post.isAnonymous ? 'Anonymous User' : 'Community Member'}
            </p>
            <p className="text-xs text-[var(--text-muted)]">{formatDate(post.createdAt)}</p>
          </div>
          {post.isAnonymous && <Badge variant="default">Anonymous</Badge>}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4 leading-tight">
          {post.title}
        </h1>

        <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap text-sm mb-4">
          {post.content}
        </p>

        {post.imageUrl && (
          <div className="mb-4 rounded-xl overflow-hidden max-h-96 border border-slate-100">
            <img src={post.imageUrl} alt="Post attachment" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-[var(--beige)]">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="default" size="sm">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 mt-5 pt-5 border-t border-[var(--beige)]">
          <button
            onClick={handleLikePost}
            className={`flex items-center gap-1.5 transition-colors ${
              hasLiked ? 'text-red-500' : 'text-[var(--text-secondary)] hover:text-red-500'
            }`}
          >
            <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} />
            <span className="text-sm">{post.likesCount || 0}</span>
          </button>
          <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm">{leaderComments.length}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
            <Eye className="w-5 h-5" />
            <span className="text-sm">{post.viewCount || 0}</span>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => toggleSave(post.id)}
              className={`p-2 rounded-lg transition-colors ${
                isSaved(post.id)
                  ? 'text-primary bg-primary/10'
                  : 'text-[var(--text-muted)] hover:text-primary hover:bg-primary/5'
              }`}
              title={isSaved(post.id) ? 'Unsave' : 'Save'}
            >
              <Bookmark className={`w-5 h-5 ${isSaved(post.id) ? 'fill-current' : ''}`} />
            </button>
            <ShareMenu postId={post.id} title={post.title || 'Question'} />
            <button 
              onClick={() => setIsReportOpen(true)}
              className="p-2 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Flag className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <ReportDialog
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetId={post.id}
        targetType="POST"
      />

      {/* Leader Responses */}
      {leaderComments.length > 0 && (
        <section className="mb-6">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full inline-block" />
            Leader Responses ({leaderComments.length})
          </h2>
          <div className="space-y-3">
            {leaderComments.map((comment) => (
              <LeaderReplyCard 
                key={comment.id} 
                comment={comment} 
                onLike={() => handleLikeComment(comment.id)} 
              />
            ))}
          </div>
        </section>
      )}

      {/* Leader Reply Box */}
      {(user?.role === 'leader' || user?.role === 'admin') && isAuthenticated && (
        <section>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
            Offer Guidance
          </h2>
          <div className="mb-5">
            <CommentBox onSubmit={handleComment} isLoading={isSubmittingComment} />
          </div>
        </section>
      )}
    </div>
  );
};

export default PostDetailsPage;
