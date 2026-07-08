import { useState, useEffect, useRef, type ReactNode } from 'react';
import { Quote } from 'lucide-react';

interface DashboardHeroProps {
  displayName: string;
  religion: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
}

const themeConfig = {
  orthodox: {
    videoSrc: '/orthodox/orthodox-hero-video.mp4',
    poster: 'https://images.unsplash.com/photo-1544299946-4dcab2f8087c?q=80&w=2000&auto=format&fit=crop',
    overlayClass: 'bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-amber-900/20',
    quotes: [
      "Let all that you do be done in love.",
      "Faith is the bird that feels the light when the dawn is still dark.",
      "In stillness, we find our strength."
    ]
  },
  muslim: {
    videoSrc: '/muslim/muslim-hero-video.mp4',
    poster: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?q=80&w=2000&auto=format&fit=crop',
    overlayClass: 'bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-emerald-900/20',
    quotes: [
      "Verily, with every hardship comes ease.",
      "The best among you are those who have the best manners and character.",
      "Patience is a pillar of faith."
    ]
  },
  protestant: {
    videoSrc: '/protestant/protestant-hero-video.mp4',
    poster: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2000&auto=format&fit=crop',
    overlayClass: 'bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-blue-900/20',
    quotes: [
      "Be strong and courageous. Do not be afraid.",
      "Where two or three are gathered in my name, there am I among them.",
      "Hope is an anchor for the soul, firm and secure."
    ]
  }
};

const DashboardHero = ({ displayName, religion, eyebrow, title, subtitle, children }: DashboardHeroProps) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const theme = themeConfig[religion.toLowerCase() as keyof typeof themeConfig] || themeConfig.orthodox;

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("Autoplay prevented:", error);
      });
    }
  }, [theme.videoSrc]);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % theme.quotes.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [theme.quotes.length]);

  return (
    <div className="relative w-full h-screen min-h-[700px] overflow-hidden shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] mb-12">
      {/* Video Background */}
      <video
        ref={videoRef}
        key={theme.videoSrc}
        autoPlay={true}
        loop={true}
        muted={true}
        playsInline={true}
        poster={theme.poster}
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={theme.videoSrc} type="video/mp4" />
        {/* Fallback image in case video fails or takes time */}
        <img src={theme.poster} alt="Background" className="absolute inset-0 w-full h-full object-cover" />
      </video>

      {/* Glassmorphism Overlay */}
      <div className={`absolute inset-0 transition-colors duration-1000 ${theme.overlayClass}`} />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end px-4 sm:px-8 lg:px-12 pb-24 pt-24 max-w-7xl mx-auto w-full min-w-0">
        <div className="max-w-3xl w-full min-w-0 animate-fade-in-up">
          {eyebrow && (
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/80">
              {eyebrow}
            </p>
          )}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight drop-shadow-md break-words">
            {title || `Welcome back, ${displayName}`}
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-slate-300 font-medium mb-8 sm:mb-10 max-w-2xl drop-shadow">
            {subtitle || (
              <>
                A space for reflection, learning, and connection within your <span className="capitalize">{religion}</span> community.
              </>
            )}
          </p>

          {children || (
            <div className="flex items-start gap-3 p-4 sm:p-5 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-sm max-w-2xl w-full min-w-0">
              <Quote className="w-6 h-6 text-white/40 shrink-0 mt-1" />
              <div className="relative h-12 w-full overflow-hidden">
                {theme.quotes.map((quote, idx) => (
                  <p
                    key={idx}
                    className={`absolute inset-0 text-white/90 font-medium italic transition-all duration-1000 ease-in-out ${
                      idx === quoteIndex
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-4'
                    }`}
                  >
                    "{quote}"
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHero;
