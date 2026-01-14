'use client';

import { useState, useEffect } from 'react';

export default function ProvidersPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCategories, setEditCategories] = useState<number[]>([]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/providers');
      const data = await res.json();
      setProviders(data);
    } catch (err) {
      console.error('Failed to fetch providers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    fetchProviders();
    fetchCategories();
  }, []);

  const startEdit = (provider: any) => {
    setEditingId(provider.id);
    setEditName(provider.name);
    setEditEmail(provider.email);
    setEditPhone(provider.phone || '');
    setEditCategories(provider.categories.map((pc: any) => pc.category.id));
  };

  const handleUpdate = async () => {
    await fetch(`/api/providers/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editName.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
        categories: editCategories,
      }),
    });
    setEditingId(null);
    setEditName('');
    setEditEmail('');
    setEditPhone('');
    setEditCategories([]);
    fetchProviders();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this provider?')) return;
    await fetch(`/api/providers/${id}`, { method: 'DELETE' });
    fetchProviders();
  };

  const handleCategoryChange = (id: number) => {
    setEditCategories((prev) => {
      const exists = prev.includes(id);
      let updated = exists ? prev.filter((c) => c !== id) : [...prev, id];
      if (updated.length > 5) updated = updated.slice(0, 5); // limit to 5
      return updated;
    });
  };

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Manage Providers</h1>

      {loading ? (
        <div className="text-gray-500 italic">Loading providers...</div>
      ) : providers.length === 0 ? (
        <div className="border border-gray-300 rounded p-4 text-center text-gray-600">
          <p className="mb-2">No providers found.</p>
          <p>Use the “Add Provider” form to create one.</p>
        </div>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">ID</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">Categories</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((provider) => (
              <tr key={provider.id}>
                <td className="border p-2">{provider.id}</td>
                <td className="border p-2">
                  {editingId === provider.id ? (
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="border p-1 w-full"
                    />
                  ) : (
                    provider.name
                  )}
                </td>
                <td className="border p-2">
                  {editingId === provider.id ? (
                    <input
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="border p-1 w-full"
                    />
                  ) : (
                    provider.email
                  )}
                </td>
                <td className="border p-2">
                  {editingId === provider.id ? (
                    <input
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="border p-1 w-full"
                    />
                  ) : (
                    provider.phone || '-'
                  )}
                </td>
                <td className="border p-2">
                  {editingId === provider.id ? (
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <label key={cat.id} className="flex items-center space-x-1">
                          <input
                            type="checkbox"
                            checked={editCategories.includes(cat.id)}
                            onChange={() => handleCategoryChange(cat.id)}
                          />
                          <span>{cat.name}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    provider.categories.map((pc: any) => pc.category.name).join(', ')
                  )}
                </td>
                <td className="border p-2 space-x-2">
                  {editingId === provider.id ? (
                    <>
                      <button
                        onClick={handleUpdate}
                        className="bg-green-600 text-white px-2 py-1 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-400 text-white px-2 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(provider)}
                        className="bg-blue-600 text-white px-2 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(provider.id)}
                        className="bg-red-600 text-white px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
