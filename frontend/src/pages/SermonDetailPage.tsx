import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Eye, Heart, Share2, BookOpen, Loader2, User } from 'lucide-react';
import { sermonsApi } from '../services/api';
import type { Sermon } from '../types';

const defaultCoverImages: Record<string, string> = {
  orthodox: '/orthodox/orthodox_sermons.jpg',
  muslim: '/muslim/muslim_sermons.jpg',
  protestant: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1200&q=80',
};

const SermonDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const res = await sermonsApi.getById(id);
        setSermon(res.data.data);
      } catch {
        setError('Sermon not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: sermon?.title || 'Sermon',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const getCoverImage = () => {
    if (!sermon) return '';
    const religionKey = (sermon.religion || 'orthodox') as keyof typeof defaultCoverImages;
    return sermon.coverImage || defaultCoverImages[religionKey] || defaultCoverImages.orthodox;
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-32 rounded-lg bg-slate-200" />
          <div className="h-72 rounded-2xl bg-slate-200" />
          <div className="space-y-3">
            <div className="h-8 w-3/4 rounded-lg bg-slate-200" />
            <div className="h-4 w-1/2 rounded-lg bg-slate-200" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full rounded-lg bg-slate-200" />
            <div className="h-4 w-full rounded-lg bg-slate-200" />
            <div className="h-4 w-3/4 rounded-lg bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !sermon) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <button onClick={() => navigate('/sermons')} className="mb-6 flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium">
          <ArrowLeft className="h-4 w-4" /> Back to Sermons
        </button>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-12 text-center">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-red-300" />
          <h2 className="text-xl font-bold text-red-800 mb-2">Sermon not found</h2>
          <p className="text-red-600">This sermon may have been removed or you may not have access to it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Back */}
      <Link to="/sermons" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Sermons
      </Link>

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Hero */}
        <div className="relative h-64 sm:h-80 overflow-hidden bg-slate-900">
          <img
            src={getCoverImage()}
            alt=""
            className="h-full w-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
          <div className="absolute bottom-0 p-6 sm:p-8 text-white">
            {sermon.tags && sermon.tags.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {sermon.tags.slice(0, 5).map((tag) => (
                  <span key={tag} className="rounded-md bg-white/20 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <h1 className="text-2xl sm:text-4xl font-bold leading-tight">{sermon.title}</h1>
          </div>
          <button
            onClick={handleShare}
            className="absolute right-4 top-4 rounded-xl bg-white/90 p-2.5 text-slate-700 shadow-sm backdrop-blur transition-colors hover:bg-white"
            aria-label="Share"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            {sermon.author && (
              <span className="inline-flex items-center gap-2 font-medium text-slate-700">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <User className="h-4 w-4" />
                </div>
                {sermon.author.email.split('@')[0]}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(sermon.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              {sermon.viewCount || 0} views
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Heart className="h-4 w-4" />
              {sermon.likesCount || 0}
            </span>
          </div>

          {/* Excerpt */}
          {sermon.excerpt && (
            <p className="text-lg leading-relaxed text-slate-600 border-l-4 border-emerald-400 pl-4 italic">
              {sermon.excerpt}
            </p>
          )}

          {/* Content */}
          <div className="prose prose-slate max-w-none">
            <div className="whitespace-pre-wrap text-base leading-8 text-slate-700">
              {sermon.content}
            </div>
          </div>

          {/* Tags */}
          {sermon.tags && sermon.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
              {sermon.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/sermons?tag=${encodeURIComponent(tag)}`}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </article>
    </div>
  );
};

export default SermonDetailPage;
