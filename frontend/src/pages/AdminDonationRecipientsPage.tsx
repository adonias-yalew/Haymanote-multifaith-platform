import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Upload, Loader2, Check, X } from "lucide-react";
import { donationsApi } from "../services/api";

interface DonationRecipient {
  id: string;
  religion: string;
  name: string;
  description?: string;
  imageUrl?: string;
  bankAccount?: string;
}

const AdminDonationRecipientsPage = () => {
  const [recipients, setRecipients] = useState<DonationRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    religion: "orthodox",
    description: "",
    bankAccount: "",
    imageUrl: "",
  });

  useEffect(() => {
    fetchRecipients();
  }, []);

  const fetchRecipients = async () => {
    try {
      setLoading(true);
      const response = await donationsApi.getAllRecipients();
      setRecipients(response.data.data || []);
    } catch (err) {
      setError("Failed to load recipients");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Please enter a name");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingId) {
        await donationsApi.updateRecipient(editingId, formData);
        setSuccess("Recipient updated successfully");
      } else {
        await donationsApi.createRecipient(formData);
        setSuccess("Recipient created successfully");
      }

      setFormData({
        name: "",
        religion: "orthodox",
        description: "",
        bankAccount: "",
        imageUrl: "",
      });
      setEditingId(null);
      setShowForm(false);
      await fetchRecipients();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to save recipient");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (recipient: DonationRecipient) => {
    setFormData({
      name: recipient.name,
      religion: recipient.religion,
      description: recipient.description || "",
      bankAccount: recipient.bankAccount || "",
      imageUrl: recipient.imageUrl || "",
    });
    setEditingId(recipient.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this recipient?")) return;

    try {
      setSaving(true);
      await donationsApi.deleteRecipient(id);
      setSuccess("Recipient deleted successfully");
      await fetchRecipients();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to delete recipient");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      religion: "orthodox",
      description: "",
      bankAccount: "",
      imageUrl: "",
    });
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const religions = [
    { value: "orthodox", label: "Orthodox" },
    { value: "muslim", label: "Muslim" },
    { value: "protestant", label: "Protestant" },
  ];

  const groupedRecipients = recipients.reduce(
    (acc, recipient) => {
      if (!acc[recipient.religion]) {
        acc[recipient.religion] = [];
      }
      acc[recipient.religion].push(recipient);
      return acc;
    },
    {} as Record<string, DonationRecipient[]>,
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Donation Recipients
          </h1>
          <p className="mt-2 text-slate-600">
            Manage churches, mosques, and organizations
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 font-medium"
          >
            <Plus className="h-5 w-5" />
            Add Recipient
          </button>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
          <X className="h-5 w-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 p-4 text-green-700">
          <Check className="h-5 w-5" />
          {success}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="mb-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-slate-900">
            {editingId ? "Edit Recipient" : "Add New Recipient"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Holy Trinity Church"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Religion
                </label>
                <select
                  value={formData.religion}
                  onChange={(e) =>
                    setFormData({ ...formData, religion: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {religions.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of the organization..."
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Bank Account
              </label>
              <input
                type="text"
                value={formData.bankAccount}
                onChange={(e) =>
                  setFormData({ ...formData, bankAccount: e.target.value })
                }
                placeholder="e.g., 1000123456789"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 font-medium disabled:bg-slate-300 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Save
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-slate-200 text-slate-900 py-2 rounded-lg hover:bg-slate-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recipients by Religion */}
      {Object.keys(groupedRecipients).length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
          No recipients yet. Add one to get started!
        </div>
      ) : (
        <div className="space-y-8">
          {religions.map(
            ({ value: religion, label: religionLabel }) =>
              groupedRecipients[religion] && (
                <div key={religion}>
                  <h3 className="mb-4 text-lg font-bold text-slate-900">
                    {religionLabel}
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {groupedRecipients[religion].map((recipient) => (
                      <div
                        key={recipient.id}
                        className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        {recipient.imageUrl && (
                          <img
                            src={recipient.imageUrl}
                            alt={recipient.name}
                            className="w-full h-32 object-cover rounded-md mb-4"
                          />
                        )}
                        <h4 className="font-bold text-slate-900">
                          {recipient.name}
                        </h4>
                        {recipient.description && (
                          <p className="text-sm text-slate-600 mt-2">
                            {recipient.description}
                          </p>
                        )}
                        {recipient.bankAccount && (
                          <p className="text-xs text-slate-500 font-mono mt-2 break-all">
                            Bank: {recipient.bankAccount}
                          </p>
                        )}
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => handleEdit(recipient)}
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-2 rounded hover:bg-blue-100 text-sm font-medium"
                          >
                            <Edit2 className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(recipient.id)}
                            disabled={saving}
                            className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 rounded hover:bg-red-100 text-sm font-medium disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ),
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDonationRecipientsPage;
