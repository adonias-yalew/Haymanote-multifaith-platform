import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, FileText, Save, Trash2, Edit2, Eye, Lock, Loader2 } from 'lucide-react';
import Button from '../components/Button';

interface Teaching {
  id: string;
  title: string;
  content?: string;
  type: 'teaching' | 'draft' | 'note';
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
}

const MyTeachingsPage = () => {
  const [teachings, setTeachings] = useState<Teaching[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'all' | 'teachings' | 'drafts' | 'notes'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Teaching, 'id' | 'createdAt' | 'updatedAt' | 'isPublished'>>({ title: '', content: '', type: 'teaching' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // TODO: Fetch teachings from API
    // For now, load from localStorage
    const saved = localStorage.getItem('my_teachings');
    if (saved) {
      setTeachings(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const handleSave = async () => {
    if (!formData.title.trim()) return;

    setSaving(true);
    try {
      let updated: Teaching[];
      if (editingId) {
        updated = teachings.map(t =>
          t.id === editingId
            ? { ...t, ...formData, updatedAt: new Date().toISOString() }
            : t
        );
      } else {
        updated = [
          ...teachings,
          {
            id: Date.now().toString(),
            ...formData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isPublished: formData.type === 'teaching'
          }
        ];
      }
      setTeachings(updated);
      localStorage.setItem('my_teachings', JSON.stringify(updated));
      setFormData({ title: '', content: '', type: 'teaching' });
      setEditingId(null);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    const updated = teachings.filter(t => t.id !== id);
    setTeachings(updated);
    localStorage.setItem('my_teachings', JSON.stringify(updated));
  };

  const handleEdit = (teaching: Teaching) => {
    setFormData({ title: teaching.title, content: teaching.content || '', type: teaching.type });
    setEditingId(teaching.id);
    setShowForm(true);
  };

  const filteredTeachings = teachings.filter(t => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'teachings') return t.type === 'teaching' && t.isPublished;
    if (selectedTab === 'drafts') return t.type === 'draft';
    if (selectedTab === 'notes') return t.type === 'note';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-indigo-600" />
            My Teachings
          </h1>
          <p className="text-slate-600 mt-1">Manage your sermons, teachings, drafts, and notes</p>
        </div>
        <Button
          onClick={() => {
            setFormData({ title: '', content: '', type: 'teaching' });
            setEditingId(null);
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Teaching
        </Button>
      </div>

      {showForm && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-950">
            {editingId ? 'Edit Teaching' : 'Create New Teaching'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter teaching title"
                className="w-full rounded-lg border border-slate-200 p-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your teaching content here..."
                rows={6}
                className="w-full rounded-lg border border-slate-200 p-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Type</label>
              <div className="grid grid-cols-3 gap-2">
                {['teaching', 'draft', 'note'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFormData({ ...formData, type: type as 'teaching' | 'draft' | 'note' })}
                    className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                      formData.type === type
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={saving || !formData.title.trim()}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ title: '', content: '', type: 'teaching' });
                }}
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {['all', 'teachings', 'drafts', 'notes'].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab as any)}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              selectedTab === tab
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Teachings List */}
      {filteredTeachings.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <p className="text-slate-600">No {selectedTab === 'all' ? 'teachings' : selectedTab} yet</p>
          <Button
            onClick={() => setShowForm(true)}
            variant="secondary"
            className="mt-4 mx-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create One
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTeachings.map((teaching) => (
            <div
              key={teaching.id}
              className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-slate-950">{teaching.title}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      teaching.type === 'teaching'
                        ? 'bg-indigo-50 text-indigo-700'
                        : teaching.type === 'draft'
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-gray-50 text-gray-700'
                    }`}>
                      {teaching.type === 'teaching' && <Eye className="h-3 w-3" />}
                      {teaching.type === 'draft' && <Lock className="h-3 w-3" />}
                      {teaching.type.charAt(0).toUpperCase() + teaching.type.slice(1)}
                    </span>
                  </div>
                  {teaching.content && (
                    <p className="text-sm text-slate-600 line-clamp-2 mb-2">{teaching.content}</p>
                  )}
                  <p className="text-xs text-slate-400">
                    {new Date(teaching.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(teaching)}
                    className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(teaching.id)}
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTeachingsPage;
