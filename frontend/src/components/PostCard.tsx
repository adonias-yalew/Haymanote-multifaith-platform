import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Eye, Flag, Heart, MessageCircle, User } from 'lucide-react';
import Badge from './Badge';
import ReportDialog from './ReportDialog';
import ShareMenu from './ShareMenu';

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
  imageUrl?: string;
  religion?: string;
  createdAt: string;
}

interface PostCardProps {
  post: Post;
  isSaved?: boolean;
  isLiked?: boolean;
  onSave?: () => void;
  onLike?: () => void;
}

const PostCard = ({ post, isSaved = false, isLiked = false, onSave, onLike }: PostCardProps) => {
  const [isReportOpen, setIsReportOpen] = useState(false);
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

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
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-hover">
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${getAvatarBg(post.religion)} shadow-sm`}>
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-950">
            {post.isAnonymous ? 'Anonymous User' : 'Community Member'}
          </p>
          <p className="text-xs font-medium text-slate-500">{formatDate(post.createdAt)}</p>
        </div>
        {post.isAnonymous && (
          <Badge variant="default" size="sm">
            Anonymous
          </Badge>
        )}
      </div>

      <Link to={`/post/${post.id}`} className="block group">
        <h3 className="mb-2 text-lg font-semibold tracking-tight text-slate-950 transition-colors group-hover:text-emerald-700">
          {post.title || 'Question'}
        </h3>
        <p className="mb-4 line-clamp-3 text-sm leading-6 text-slate-600">
          {post.content}
        </p>
        {post.imageUrl && (
          <div className="mb-4 rounded-xl overflow-hidden max-h-64 border border-slate-100">
            <img src={post.imageUrl} alt="Post attachment" className="w-full h-full object-cover" />
          </div>
        )}
      </Link>

      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="default" size="sm">
              #{tag}
            </Badge>
          ))}
          {post.tags.length > 3 && (
            <Badge variant="default" size="sm">
              +{post.tags.length - 3}
            </Badge>
          )}
        </div>
      )}

      {post.leaderResponsesCount > 0 && (
        <div className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50 p-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            {post.leaderResponsesCount} Leader Response
            {post.leaderResponsesCount > 1 ? 's' : ''}
          </p>
        </div>
      )}

      <div className="flex items-center gap-4 border-t border-slate-100 pt-4">
        <button
          onClick={onLike}
          className={`flex items-center gap-1.5 transition-colors ${
            isLiked ? 'text-rose-600' : 'text-slate-500 hover:text-rose-600'
          }`}
          title={isLiked ? 'Unlike' : 'Like'}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          <span className="text-sm">{post.likesCount || 0}</span>
        </button>

        <Link
          to={`/post/${post.id}`}
          className="flex items-center gap-1.5 text-slate-500 transition-colors hover:text-emerald-700"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm">{post.leaderResponsesCount || 0}</span>
        </Link>

        <div className="flex items-center gap-1.5 text-slate-400">
          <Eye className="w-5 h-5" />
          <span className="text-sm">{post.viewCount || 0}</span>
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            if (onSave) onSave();
          }}
          className={`ml-auto rounded-lg p-2 transition-colors ${
            isSaved 
              ? 'bg-emerald-50 text-emerald-700' 
              : 'text-slate-400 hover:bg-emerald-50 hover:text-emerald-700'
          }`}
        >
          <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        <ShareMenu postId={post.id} title={post.title || 'Question'} />

        <button
          onClick={(e) => {
            e.preventDefault();
            setIsReportOpen(true);
          }}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
          title="Report Question"
        >
          <Flag className="w-5 h-5" />
        </button>
      </div>

      <ReportDialog
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetId={post.id}
        targetType="POST"
      />
    </div>
  );
};

export default PostCard;
