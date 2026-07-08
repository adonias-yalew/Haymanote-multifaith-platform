import { useMemo, useState } from 'react';
import { Check, Copy, MessageCircle, MoreHorizontal, Send, Share2 } from 'lucide-react';

interface ShareMenuProps {
  postId: string;
  title?: string;
  align?: 'left' | 'right';
}

const ShareMenu = ({ postId, title = 'Question', align = 'right' }: ShareMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => `${window.location.origin}/post/${postId}`, [postId]);
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const shareMore = async () => {
    if (navigator.share) {
      await navigator.share({ title, url: shareUrl });
      return;
    }
    await copyLink();
  };

  const menuAlignment = align === 'left' ? 'left-0' : 'right-0';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen((current) => !current);
        }}
        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        title="Share"
        aria-expanded={isOpen}
        aria-label="Share post"
      >
        <Share2 className="h-5 w-5" />
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-20 cursor-default"
            aria-label="Close share menu"
            onClick={() => setIsOpen(false)}
          />
          <div className={`absolute ${menuAlignment} bottom-11 z-30 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10`}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                copyLink();
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-slate-500" />}
              {copied ? 'Copied' : 'Copy Link'}
            </button>
            <a
              href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Send className="h-4 w-4 text-sky-500" />
              Telegram
            </a>
            <a
              href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <MessageCircle className="h-4 w-4 text-emerald-600" />
              WhatsApp
            </a>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                shareMore();
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <MoreHorizontal className="h-4 w-4 text-slate-500" />
              More
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ShareMenu;
