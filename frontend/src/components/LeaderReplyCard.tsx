import { Award } from 'lucide-react';
import Badge from './Badge';
import type { Comment } from '../types';

interface LeaderReplyCardProps {
  comment: Comment;
  onLike?: () => void;
}

const LeaderReplyCard = ({ comment, onLike }: LeaderReplyCardProps) => {
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

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
    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarBg(comment.religion)} flex items-center justify-center flex-shrink-0`}>
          <Award className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {comment.author?.email?.split('@')[0] || 'Spiritual Leader'}
            </p>
            <Badge variant="primary" size="sm">
              Verified Leader
            </Badge>
          </div>
          <p className="text-xs text-[var(--text-muted)]">{formatDate(comment.createdAt)}</p>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">{comment.content}</p>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-3 border-t border-primary/10">
        <button
          onClick={onLike}
          className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-rose-600 transition-colors"
        >
          <svg className={`w-4 h-4 ${comment.likesCount ? 'fill-current text-rose-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>{comment.likesCount || 0}</span>
        </button>
      </div>
    </div>
  );
};

export default LeaderReplyCard;
