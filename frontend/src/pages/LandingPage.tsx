import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Shield,
  Users,
  Lock,
  Star,
  Heart,
  MessageCircle,
  Globe,
  Sparkles,
  BookOpen,
  Briefcase,
  HelpCircle,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.tsx";
import LanguageSwitcher from "../components/LanguageSwitcher";

const RELIGIONS = ["orthodox", "muslim", "protestant"];

const getReligionColor = (religion: string) => {
  switch (religion) {
    case "orthodox":
      return "from-amber-500 to-orange-600";
    case "muslim":
      return "from-emerald-500 to-teal-600";
    case "protestant":
      return "from-blue-500 to-indigo-600";
    default:
      return "from-emerald-500 to-teal-600";
  }
};

const getReligionLabel = (religion: string) => {
  return religion.charAt(0).toUpperCase() + religion.slice(1);
};

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [selectedReligion, setSelectedReligion] = useState<string>("orthodox");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const effectivelyScrolled = isScrolled || isMobile;

  const features = [
    {
      icon: Shield,
      title: "Safe & Anonymous",
      description:
        "Share your story without revealing your identity. Your privacy is our priority.",
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      icon: Users,
      title: "Supportive Community",
      description:
        "Connect with others who understand. You are not alone in your journey.",
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      icon: Heart,
      title: "Leader Support",
      description: "Get guidance from verified spiritual leaders who care.",
      gradient: "from-rose-500 to-pink-600",
    },
    {
      icon: MessageCircle,
      title: "Meaningful Conversations",
      description:
        "Engage in thoughtful discussions and find comfort in shared experiences.",
      gradient: "from-amber-500 to-orange-600",
    },
    {
      icon: Lock,
      title: "Privacy First",
      description:
        "Your data is encrypted and secure. We never share your personal information.",
      gradient: "from-violet-500 to-purple-600",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description:
        "Join a diverse community from around the world, all supporting each other.",
      gradient: "from-cyan-500 to-emerald-600",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Create Your Account",
      description:
        "Sign up in seconds. Choose to remain anonymous or share your identity.",
    },
    {
      number: "02",
      title: "Share Your Story",
      description:
        "Write about your experiences, thoughts, and feelings in a safe space.",
    },
    {
      number: "03",
      title: "Connect & Heal",
      description:
        "Receive support from the community and guidance from leaders.",
    },
  ];

  const getReligionTestimonials = () => {
    const testimonialsByReligion = {
      orthodox: [
        {
          quote:
            "Haymanote has strengthened my faith and connected me with my Orthodox community in a meaningful way.",
          author: "Community Member",
          role: "Orthodox Believer",
          avatar: "OM",
        },
        {
          quote:
            "The prayers and spiritual guidance from our church leaders through this platform have been transformative.",
          author: "Fr. Dimitri",
          role: "Orthodox Priest",
          avatar: "FD",
        },
        {
          quote:
            "I feel proud sharing my Orthodox traditions with others and learning from our elders.",
          author: "Community Member",
          role: "Orthodox Youth",
          avatar: "CM",
        },
      ],
      muslim: [
        {
          quote:
            "This platform helps me stay connected to my Islamic faith and community values daily.",
          author: "Community Member",
          role: "Muslim Believer",
          avatar: "MB",
        },
        {
          quote:
            "The Islamic teachings and responses from verified leaders have guided me through difficult times.",
          author: "Imam Hassan",
          role: "Islamic Teacher",
          avatar: "IH",
        },
        {
          quote:
            "Haymanote makes it easy to follow Quranic principles and connect with my ummah globally.",
          author: "Community Member",
          role: "Muslim Student",
          avatar: "CM",
        },
      ],
      protestant: [
        {
          quote:
            "This platform strengthens my Protestant faith and helps me grow spiritually with my church community.",
          author: "Community Member",
          role: "Protestant Believer",
          avatar: "PB",
        },
        {
          quote:
            "The Biblical guidance and supportive community have made my faith journey more meaningful.",
          author: "Pastor John",
          role: "Protestant Minister",
          avatar: "PJ",
        },
        {
          quote:
            "I love how Haymanote brings Protestant believers together to encourage one another in Christ.",
          author: "Community Member",
          role: "Church Member",
          avatar: "CM",
        },
      ],
    };
    return (
      testimonialsByReligion[
        selectedReligion as keyof typeof testimonialsByReligion
      ] || testimonialsByReligion.orthodox
    );
  };

  const testimonials = getReligionTestimonials();

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    requireAuth: boolean,
  ) => {
    if (requireAuth && !isAuthenticated) {
      e.preventDefault();
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 ${
          effectivelyScrolled
            ? "bg-white/80 backdrop-blur-xl border-b border-slate-200/50"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-10 h-10 rounded-xl object-contain shadow-lg"
            />
            <span
              className={`font-bold text-xl transition-colors ${
                effectivelyScrolled ? "text-slate-900" : "text-white"
              }`}
            >
              Haymanote
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <a
              href="#community"
              className={`text-sm font-medium transition-colors ${
                effectivelyScrolled
                  ? "text-slate-600 hover:text-emerald-600"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Community
            </a>
            <a
              href="#marketplace"
              className={`text-sm font-medium transition-colors ${
                effectivelyScrolled
                  ? "text-slate-600 hover:text-emerald-600"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Marketplace
            </a>
            <a
              href="#copilot"
              className={`text-sm font-medium transition-colors ${
                effectivelyScrolled
                  ? "text-slate-600 hover:text-emerald-600"
                  : "text-white/80 hover:text-white"
              }`}
            >
              AI Copilot
            </a>

            <a
              href="#blogs"
              className={`text-sm font-medium transition-colors ${
                effectivelyScrolled
                  ? "text-slate-600 hover:text-emerald-600"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Blogs & Resources
            </a>
            <a
              href="#about"
              className={`text-sm font-medium transition-colors ${
                effectivelyScrolled
                  ? "text-slate-600 hover:text-emerald-600"
                  : "text-white/80 hover:text-white"
              }`}
            >
              About
            </a>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <Link to="/dashboard">
                <button className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                  Dashboard
                </button>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`hidden sm:block text-sm font-medium transition-colors ${
                    effectivelyScrolled
                      ? "text-slate-600 hover:text-slate-900"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  Login
                </Link>
                <Link to="/register">
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      effectivelyScrolled
                        ? "bg-slate-900 text-white hover:bg-slate-800"
                        : "bg-white text-slate-900 hover:bg-gray-100"
                    }`}
                  >
                    Get Started
                  </button>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                effectivelyScrolled
                  ? "text-slate-600 hover:bg-slate-100"
                  : "text-white hover:bg-white/20"
              }`}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className={`lg:hidden mt-4 pb-4 space-y-2 pt-4 transition-colors ${
              effectivelyScrolled
                ? "border-t border-slate-200/50"
                : "border-t border-white/20"
            }`}
          >
            <a
              href="#community"
              className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                effectivelyScrolled
                  ? "text-slate-600 hover:text-emerald-600 hover:bg-slate-50"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              Community
            </a>
            <a
              href="#marketplace"
              className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                effectivelyScrolled
                  ? "text-slate-600 hover:text-emerald-600 hover:bg-slate-50"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              Marketplace
            </a>
            <a
              href="#copilot"
              className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                effectivelyScrolled
                  ? "text-slate-600 hover:text-emerald-600 hover:bg-slate-50"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              AI Copilot
            </a>

            <a
              href="#blogs"
              className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                effectivelyScrolled
                  ? "text-slate-600 hover:text-emerald-600 hover:bg-slate-50"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              Blogs & Resources
            </a>
            <a
              href="#about"
              className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                effectivelyScrolled
                  ? "text-slate-600 hover:text-emerald-600 hover:bg-slate-50"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              About
            </a>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative w-full h-screen overflow-hidden flex items-center justify-center">
        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <source src="/hero-section-video.mp4" type="video/mp4" />
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-8 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-white">
              A Safe Space for Healing
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white tracking-tight mb-6">
            Ask Questions. Grow in Faith. <br />
            <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
              Discover Trusted Resources.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed">
            Get answers from verified religious leaders, explore AI-guided
            learning, and shop from trusted faith-based vendors—all in one
            secure community built for Ethiopian faith communities.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <button className="group px-8 py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg">
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <button className="group px-8 py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg">
                    Join Our Community
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <a href="#community">
                  <button className="px-8 py-4 bg-white/20 text-white font-semibold rounded-xl border border-white/30 hover:bg-white/30 transition-all backdrop-blur-sm">
                    Explore Stories
                  </button>
                </a>
              </>
            )}
          </div>

          <p className="mt-6 text-sm text-white/70">
            Free forever • Anonymous posting • Verified leaders
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-emerald-600 mb-1">
                12K+
              </div>
              <div className="text-sm text-slate-600">Orthodox Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-emerald-600 mb-1">
                8K+
              </div>
              <div className="text-sm text-slate-600">Muslim Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-emerald-600 mb-1">
                5K+
              </div>
              <div className="text-sm text-slate-600">Protestant Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-emerald-600 mb-1">
                50+
              </div>
              <div className="text-sm text-slate-600">Verified Leaders</div>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace Section */}
      <section
        id="marketplace"
        className="py-20 lg:py-32 bg-gradient-to-br from-emerald-50 via-white to-teal-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 mb-6">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-700">
                  Faith-Based Marketplace
                </span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
                Shop Trusted Resources
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Discover religious books, icons, spiritual art, and faith-based
                products from verified vendors who share your beliefs.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-slate-700">Sacred texts, icons, and spiritual art</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-slate-700">Trusted vendors from your faith community</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-slate-700">Support local Ethiopian faith-based businesses</span>
                </li>
              </ul>
              {isAuthenticated ? (
                <Link to="/marketplace">
                  <button className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Browse Marketplace
                  </button>
                </Link>
              ) : (
                <Link to="/register">
                  <button className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Join to Shop
                  </button>
                </Link>
              )}
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-3xl blur-2xl opacity-20" />
              <div className="relative bg-white rounded-2xl p-8 border border-slate-200 shadow-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-emerald-50 p-4 text-center">
                    <BookOpen className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-900">Spiritual Books</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-4 text-center">
                    <Star className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-900">Icons & Art</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-4 text-center">
                    <Heart className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-900">Faith Gifts</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-4 text-center">
                    <Shield className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-900">Verified Vendors</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Copilot Section */}
      <section
        id="copilot"
        className="py-20 lg:py-32 bg-gradient-to-br from-emerald-50 via-white to-teal-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 mb-6">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-700">
                  AI-Powered Support
                </span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
                Meet Your AI Copilot
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Get instant access to AI-powered career guidance, project
                support, interview preparation, and leader advice whenever you
                need it.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-slate-700">
                    Career guidance and leader development
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-slate-700">
                    Project support and technical assistance
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-slate-700">
                    Interview preparation with practice questions
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-slate-700">
                    Learning help and knowledge resources
                  </span>
                </li>
              </ul>
              {isAuthenticated ? (
                <Link to="/copilot">
                  <button className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Start Chat Now
                  </button>
                </Link>
              ) : (
                <Link to="/register">
                  <button className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Get Started with AI
                  </button>
                </Link>
              )}
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-3xl blur-2xl opacity-20" />
              <div className="relative bg-white rounded-2xl p-8 border border-slate-200 shadow-xl">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-emerald-50 rounded-lg p-3 mb-2">
                        <p className="text-sm text-slate-700">
                          How can I prepare for my job interview?
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <div className="max-w-xs">
                      <div className="bg-emerald-600 text-white rounded-lg p-3">
                        <p className="text-sm">
                          I'll help you with interview prep! Here are key
                          strategies...
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-slate-100 rounded-lg p-3">
                        <p className="text-sm text-slate-500 animate-pulse">
                          Typing...
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Why Choose Haymanote?
            </h2>
            <p className="text-lg text-slate-600">
              We have created a safe, supportive environment designed
              specifically for mental wellness.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 lg:p-8 rounded-2xl bg-white border border-slate-200 hover:border-emerald-200 hover:shadow-lg transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section
        id="how-it-works"
        className="py-20 lg:py-32 bg-slate-900 text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Get started in minutes
            </h2>
            <p className="text-lg text-slate-400">
              No complex setup. Just sign up and start your healing journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-emerald-500 to-transparent" />
                )}
                <div className="text-5xl lg:text-6xl font-bold text-slate-800 mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Religion Selector */}
          <div className="flex justify-center gap-3 mb-12">
            {RELIGIONS.map((religion) => (
              <button
                key={religion}
                onClick={() => setSelectedReligion(religion)}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  selectedReligion === religion
                    ? `bg-gradient-to-r ${getReligionColor(religion)} text-white shadow-lg`
                    : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
                }`}
              >
                {getReligionLabel(religion)}
              </button>
            ))}
          </div>

          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Loved by thousands
            </h2>
            <p className="text-lg text-slate-600">
              Real stories from real people who found support and healing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.author}
                className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-slate-100"
              >
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-semibold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-slate-500">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 mb-6">
                <span className="text-xs font-semibold text-emerald-700">
                  About Haymanote
                </span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
                Empowering Mental Wellness Through Community
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Haymanote (meaning "New Hope" in Amharic) was founded in 2024
                with a simple mission: to create a safe, anonymous space where
                anyone can share their spiritual journey without fear of
                judgment.
              </p>
              <p className="text-slate-600 mb-8 leading-relaxed">
                We believe that healing happens through connection. Our platform
                brings together individuals seeking support with verified mental
                health leaders who provide guidance, resources, and
                compassionate care.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-slate-700 font-medium">
                    Anonymous & Safe
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-slate-700 font-medium">
                    Leader Support
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-slate-700 font-medium">
                    Always Free
                  </span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-3xl blur-2xl opacity-30" />
              <div className="relative bg-slate-50 rounded-2xl p-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">
                        Our Mission
                      </h3>
                      <p className="text-slate-600 text-sm">
                        To make spiritual support accessible, affordable, and
                        stigma-free for everyone.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center shrink-0">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">
                        Our Vision
                      </h3>
                      <p className="text-slate-600 text-sm">
                        A world where no one faces spiritual challenges alone,
                        and support is always one click away.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">
                        Our Values
                      </h3>
                      <p className="text-slate-600 text-sm">
                        Compassion, privacy, inclusivity, and evidence-based
                        support guide everything we do.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Preview Section */}
      <section id="community" className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Join Our Supportive Community
            </h2>
            <p className="text-lg text-slate-600">
              Connect with others who understand. Share your story anonymously
              and find comfort in knowing you are not alone.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6 bg-slate-50 rounded-2xl">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                10,000+ Members
              </h3>
              <p className="text-slate-600">
                A growing community of supportive individuals
              </p>
            </div>
            <div className="text-center p-6 bg-slate-50 rounded-2xl">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Daily Conversations
              </h3>
              <p className="text-slate-600">
                Active discussions and real-time support
              </p>
            </div>
            <div className="text-center p-6 bg-slate-50 rounded-2xl">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Safe & Moderated
              </h3>
              <p className="text-slate-600">
                A respectful environment with leader oversight
              </p>
            </div>
          </div>

          <div className="text-center">
            {isAuthenticated ? (
              <Link to="/community">
                <button className="px-8 py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 mx-auto">
                  Visit Community
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            ) : (
              <Link to="/register">
                <button className="px-8 py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 mx-auto">
                  Join the Community
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Blogs/Resources Section */}
      <section id="blogs" className="py-20 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              spiritual Resources
            </h2>
            <p className="text-lg text-slate-600">
              Expert-written articles, guides, and insights to support your
              wellness journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Understanding Anxiety: A Complete Guide",
                excerpt:
                  "Learn about the different types of anxiety and evidence-based coping strategies.",
                category: "Anxiety",
                readTime: "8 min read",
              },
              {
                title: "The Power of Anonymous Support",
                excerpt:
                  "Why sharing your story anonymously can be a powerful step toward healing.",
                category: "Community",
                readTime: "5 min read",
              },
              {
                title: "Building Healthy Coping Mechanisms",
                excerpt:
                  "Practical techniques for managing stress and improving your mental well-being.",
                category: "Wellness",
                readTime: "6 min read",
              },
            ].map((blog, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-100 rounded-full">
                    {blog.category}
                  </span>
                  <span className="text-xs text-slate-500">
                    {blog.readTime}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {blog.title}
                </h3>
                <p className="text-slate-600 text-sm mb-4">{blog.excerpt}</p>
                <Link
                  to="/blogs"
                  className="text-emerald-600 font-medium text-sm hover:text-emerald-700 flex items-center gap-1"
                >
                  Read More
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/login">
              <button className="px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                View All Resources
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                We are Here to Help
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Have questions or need support? Reach out to our team. We are
                committed to making your experience safe and supportive.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <svg
                      className="w-6 h-6 text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Email Us</h3>
                    <p className="text-slate-600">support@addistesfa.org</p>
                    <p className="text-sm text-slate-500">
                      We respond within 24 hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <svg
                      className="w-6 h-6 text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Crisis Support
                    </h3>
                    <p className="text-slate-600">Available 24/7</p>
                    <p className="text-sm text-slate-500">
                      Emergency resources always accessible
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <svg
                      className="w-6 h-6 text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Leader Network
                    </h3>
                    <p className="text-slate-600">50+ Verified Leaders</p>
                    <p className="text-sm text-slate-500">
                      Licensed therapists and counselors
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-6">
                Send us a Message
              </h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    placeholder="How can we help you?"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all resize-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "Message sent! We will get back to you within 24 hours.",
                    )
                  }
                  className="w-full py-3 px-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-emerald-600 to-teal-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg lg:text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
            Join thousands of others who have found support and understanding in
            our community.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <button className="px-8 py-4 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-colors flex items-center gap-2">
                  {t("nav.dashboard")}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <button className="px-8 py-4 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-colors flex items-center gap-2">
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
                <button className="px-8 py-4 bg-emerald-500/30 text-white font-semibold rounded-xl hover:bg-emerald-500/40 transition-colors backdrop-blur">
                  Learn More
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 lg:py-16 bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg text-white">Haymanote</span>
              </div>
              <p className="text-sm max-w-xs">
                A compassionate community for spiritual support. Safe,
                anonymous, and leader.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#about"
                    className="hover:text-white transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="hover:text-white transition-colors"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#testimonials"
                    className="hover:text-white transition-colors"
                  >
                    Testimonials
                  </a>
                </li>
                <li>
                  <a
                    href="#community"
                    className="hover:text-white transition-colors"
                  >
                    Community
                  </a>
                </li>
                <li>
                  <a
                    href="#blogs"
                    className="hover:text-white transition-colors"
                  >
                    Resources
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Account</h4>
              <ul className="space-y-2 text-sm">
                {!isAuthenticated && (
                  <>
                    <li>
                      <Link
                        to="/login"
                        className="hover:text-white transition-colors"
                      >
                        Sign In
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/register"
                        className="hover:text-white transition-colors"
                      >
                        Get Started
                      </Link>
                    </li>
                  </>
                )}
                <li>
                  <a
                    href="#contact"
                    className="hover:text-white transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">© 2024 Haymanote. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
