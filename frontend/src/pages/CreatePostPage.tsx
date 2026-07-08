import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, EyeOff, Eye, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import Badge from '../components/Badge';
import { postsApi } from '../services/api';
import { useAuth } from '../hooks/useAuth.tsx';

const CreatePostPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canPostAnonymously = user?.role === 'user';
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isAnonymous: false,
    tags: [] as string[],
    image: null as File | null,
  });

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.content.trim() && !formData.image) {
      setError('Please provide either text or an image for your question.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await postsApi.create({
        ...formData,
        image: formData.image || undefined,
        isAnonymous: canPostAnonymously ? formData.isAnonymous : false,
      });
      navigate('/community');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/community"
          className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--beige-light)] rounded-xl transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Ask a Question</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Seek spiritual guidance, ask questions, and grow in your faith. Post safely and anonymously if you prefer.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-[var(--warm-white)] rounded-2xl p-6 shadow-card">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <Input
            label="Title (Optional)"
            placeholder="What is your question or topic? (Optional)"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Question Details
            </label>
            <textarea
              placeholder="Describe your question or situation in detail..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={8}
              className="w-full px-4 py-3 bg-[var(--warm-white)] border border-[var(--beige)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Image (Optional - JPG or PNG, max 2MB)
            </label>
            <input
              type="file"
              accept="image/jpeg, image/png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 2 * 1024 * 1024) {
                    setError('Image size should be 2MB maximum.');
                    e.target.value = '';
                    return;
                  }
                  setFormData({ ...formData, image: file });
                  setError('');
                }
              }}
              className="w-full px-4 py-3 bg-[var(--warm-white)] border border-[var(--beige)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Tags (Press Enter to add)
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Add tags like anxiety, support, healing..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--warm-white)] border border-[var(--beige)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="primary" size="md">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Anonymous Toggle */}
          <div className="flex items-center justify-between p-4 bg-[var(--beige-light)] rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                {formData.isAnonymous && canPostAnonymously ? (
                  <EyeOff className="w-5 h-5 text-primary" />
                ) : (
                  <Eye className="w-5 h-5 text-primary" />
                )}
              </div>
              <div>
                <p className="font-medium text-[var(--text-primary)]">
                  {formData.isAnonymous && canPostAnonymously ? 'Anonymous Post' : 'Public Post'}
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  {!canPostAnonymously
                    ? 'Anonymous posting is available only to regular members'
                    : formData.isAnonymous
                    ? 'Your identity will be hidden'
                    : 'Your profile will be visible'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!canPostAnonymously) return;
                setFormData({ ...formData, isAnonymous: !formData.isAnonymous });
              }}
              disabled={!canPostAnonymously}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                formData.isAnonymous && canPostAnonymously ? 'bg-primary' : 'bg-[var(--beige)]'
              }`}
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                  formData.isAnonymous && canPostAnonymously ? 'left-8' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Link to="/community" className="flex-1">
              <Button type="button" variant="secondary" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button type="submit" isLoading={isLoading} className="flex-[2]">
              Ask Question
            </Button>
          </div>
        </form>
      </div>

      {/* Helpful info */}
      <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
        <p className="text-sm text-primary">
          <strong>Tip:</strong> Asking questions helps everyone learn and grow together in faith.
          Our community leaders and members are here to support you.
        </p>
      </div>
    </div>
  );
};

export default CreatePostPage;
