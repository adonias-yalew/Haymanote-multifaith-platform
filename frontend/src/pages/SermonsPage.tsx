import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Eye,
  Image,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Tags,
  X,
} from "lucide-react";
import Button from "../components/Button";
import Badge from "../components/Badge";
import { useIsLeader, useAuth } from "../hooks/useAuth.tsx";
import { sermonsApi } from "../services/api";
import type { Sermon } from "../types/index.js";

const defaultCoverImages: Record<string, string> = {
  orthodox: "/orthodox/orthodox_sermons.jpg",
  muslim: "/muslim/muslim_sermons.jpg",
  protestant:
    "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1200&q=80",
};

const getReligionDisplay = (religion?: string) => {
  const labels: Record<string, string> = {
    orthodox: "Orthodox",
    muslim: "Muslim",
    protestant: "Protestant",
  };

  return labels[religion?.toLowerCase() || "orthodox"] || "Orthodox";
};

const getCoverImage = (sermon: Sermon, religion?: string) => {
  const religionKey = (sermon.religion || religion || "orthodox").toLowerCase() as keyof typeof defaultCoverImages;
  return sermon.coverImage || defaultCoverImages[religionKey] || defaultCoverImages.orthodox;
};

const getExcerpt = (sermon: Sermon, limit = 150) => {
  if (sermon.excerpt?.trim()) return sermon.excerpt;
  if (sermon.content.length <= limit) return sermon.content;
  return `${sermon.content.slice(0, limit).trim()}...`;
};

const emptyForm: {
  title: string;
  content: string;
  excerpt: string;
  coverImage: string | File;
  tags: string;
  published: boolean;
} = {
  title: "",
  content: "",
  excerpt: "",
  coverImage: "",
  tags: "",
  published: true,
};

const SermonsPage = () => {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const isLeader = useIsLeader();
  const { user } = useAuth();
  const religionLabel = getReligionDisplay(user?.religion);

  useEffect(() => {
    fetchSermons();
  }, []);

  const fetchSermons = async () => {
    try {
      const response = await sermonsApi.getAll();
      const data = response.data?.data || response.data || [];
      const sermonsArray = Array.isArray(data) ? data : [];
      setSermons(sermonsArray);
    } catch (error) {
      console.error("Failed to fetch sermons:", error);
      setSermons([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    setIsSubmitting(true);
    try {
      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      await sermonsApi.create({
        title: formData.title.trim(),
        content: formData.content.trim(),
        excerpt: formData.excerpt.trim() || undefined,
        coverImage: typeof formData.coverImage === 'string' ? (formData.coverImage.trim() || undefined) : formData.coverImage,
        tags,
        published: formData.published,
      });

      setFormData(emptyForm);
      setShowForm(false);
      await fetchSermons();
    } catch (error) {
      console.error("Failed to create sermon:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const filtered = sermons.filter((sermon) => {
    const query = search.toLowerCase();
    return (
      sermon.title.toLowerCase().includes(query) ||
      sermon.content.toLowerCase().includes(query) ||
      sermon.excerpt?.toLowerCase().includes(query) ||
      sermon.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  const featured = filtered[0];
  const remainingSermons = featured ? filtered.slice(1) : [];
  const totalViews = sermons.reduce((total, sermon) => total + (sermon.viewCount || 0), 0);
  const allTags = Array.from(new Set(sermons.flatMap((sermon) => sermon.tags || []))).slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-6 sm:p-8">
            <Badge variant="primary" size="md" className="mb-4">
              {religionLabel} teachings
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Sermons & Teachings
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Read community sermons, save meaningful reflections, and explore teachings shared by verified leaders.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <StatTile label="Sermons" value={sermons.length.toString()} />
              <StatTile label="Views" value={totalViews.toString()} />
              <StatTile label="Topics" value={allTags.length.toString()} />
            </div>
          </div>

          <div className="relative min-h-64 bg-slate-900">
            <img
              src={featured ? getCoverImage(featured, user?.religion) : defaultCoverImages[(user?.religion || "orthodox") as keyof typeof defaultCoverImages]}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950/70 via-slate-950/30 to-transparent" />
              <div className="relative flex h-full min-h-64 flex-col justify-end p-6 text-white">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                  <Sparkles className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold uppercase tracking-wide text-white/80">Featured reflection</p>
                {featured ? (
                  <Link to={`/sermons/${featured.id}`} className="mt-2 block">
                    <h2 className="line-clamp-2 text-2xl font-bold hover:underline">{featured.title}</h2>
                  </Link>
                ) : (
                  <h2 className="mt-2 line-clamp-2 text-2xl font-bold">New teachings will appear here</h2>
                )}
              </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-lg">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search sermons, teachings, or topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSearch(tag)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:border-emerald-200 hover:text-emerald-700"
            >
              #{tag}
            </button>
          ))}
          {isLeader && (
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>
              Add Sermon
            </Button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">Create Sermon</h2>
                <p className="text-sm text-slate-500">Add an image URL, summary, tags, and the full teaching.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close sermon form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Sermon title"
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Cover Image</label>
                <div className="relative">
                  <Image className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || '';
                      setFormData({ ...formData, coverImage: file });
                    }}
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                </div>
              </div>

              {formData.coverImage && typeof formData.coverImage !== 'string' && (
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <img src={URL.createObjectURL(formData.coverImage)} alt="Cover preview" className="h-48 w-full object-cover" />
                </div>
              )}

              {formData.coverImage && typeof formData.coverImage === 'string' && (
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <img src={formData.coverImage} alt="Cover preview" className="h-48 w-full object-cover" />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Excerpt</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Brief summary for the sermon card"
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Sermon content"
                  rows={8}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Tags</label>
                <div className="relative">
                  <Tags className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Comma-separated tags, like faith, prayer, teaching"
                    className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/15"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  id="published"
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="published" className="cursor-pointer text-sm text-slate-600">
                  Publish immediately
                </label>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button
                  type="button"
                  onClick={() => setShowForm(false)}
                  variant="secondary"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  leftIcon={isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
                  className="flex-1"
                >
                  {isSubmitting ? "Creating..." : "Create Sermon"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="h-48 animate-pulse bg-slate-100" />
              <div className="space-y-3 p-5">
                <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-3/4 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {remainingSermons.map((sermon) => (
            <SermonCard
              key={sermon.id}
              sermon={sermon}
              coverImage={getCoverImage(sermon, user?.religion)}
              formatDate={formatDate}
            />
          ))}
          {featured && (
            <SermonCard
              sermon={featured}
              coverImage={getCoverImage(featured, user?.religion)}
              formatDate={formatDate}
            />
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-100 bg-white px-6 py-16 text-center shadow-sm">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-slate-300" />
          <h3 className="mb-2 text-lg font-semibold text-slate-900">
            {search ? "No sermons match your search" : "No sermons yet"}
          </h3>
          <p className="mx-auto max-w-md text-slate-500">
            {search
              ? "Try another title, topic, or tag."
              : "New sermons and teachings from community leaders will appear here."}
          </p>
        </div>
      )}

    </div>
  );
};

interface SermonCardProps {
  sermon: Sermon;
  coverImage: string;
  formatDate: (date: string) => string;
}

const SermonCard = ({ sermon, coverImage, formatDate }: SermonCardProps) => (
  <Link to={`/sermons/${sermon.id}`} className="group block overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
    <div className="relative h-48 overflow-hidden bg-slate-100">
      <img
        src={coverImage}
        alt=""
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg bg-white/90 px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
        <Eye className="h-3.5 w-3.5" />
        {sermon.viewCount || 0} views
      </div>
    </div>

    <div className="p-5">
      {sermon.tags && sermon.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {sermon.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="default" size="sm">
              #{tag}
            </Badge>
          ))}
          {sermon.tags.length > 2 && (
            <Badge variant="default" size="sm">
              +{sermon.tags.length - 2}
            </Badge>
          )}
        </div>
      )}

      <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-slate-950 transition-colors group-hover:text-emerald-700">
        {sermon.title}
      </h3>
      <p className="mb-5 line-clamp-3 text-sm leading-6 text-slate-600">{getExcerpt(sermon)}</p>

      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Calendar className="h-4 w-4" />
          {formatDate(sermon.createdAt)}
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
          Read
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </div>
  </Link>
);

const StatTile = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
    <p className="text-2xl font-bold text-slate-950">{value}</p>
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
  </div>
);

export default SermonsPage;
