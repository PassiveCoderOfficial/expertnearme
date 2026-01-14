// File: src/app/providers/new/page.tsx

"use client";

import { useEffect, useState } from "react";

type Cat = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  children: Cat[];
};

export default function AddProviderPage() {
  const [tree, setTree] = useState<Cat[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isBusiness, setIsBusiness] = useState(false); // NEW FIELD
  const [featured, setFeatured] = useState(false); // NEW FIELD
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setTree(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggleCategory = (id: number) => {
    setSelectedCategories((prev) => {
      const exists = prev.includes(id);
      let next = exists ? prev.filter((c) => c !== id) : [...prev, id];
      if (next.length > 5) next = next.slice(0, 5);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess("");
    setError("");

    try {
      const res = await fetch("/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          isBusiness,
          featured,
          categories: selectedCategories,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to add provider");
      } else {
        setSuccess("Provider added successfully");
        setName("");
        setEmail("");
        setPhone("");
        setIsBusiness(false);
        setFeatured(false);
        setSelectedCategories([]);
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add Provider</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Provider name"
            className="border p-2 w-full"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="border p-2 w-full"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="optional"
            className="border p-2 w-full"
          />
        </div>

        {/* Business toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isBusiness}
            onChange={(e) => setIsBusiness(e.target.checked)}
            className="h-5 w-5 text-blue-600 border-gray-300 rounded"
          />
          <label className="text-sm font-medium">Is Business</label>
        </div>

        {/* Featured toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="h-5 w-5 text-yellow-500 border-gray-300 rounded"
          />
          <label className="text-sm font-medium">Featured (show at top of autosuggest)</label>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium mb-2">Categories (up to 5)</label>
          <div className="space-y-4">
            {tree.map((parent) => (
              <div key={parent.id}>
                <div className="font-semibold">{parent.name}</div>
                <div className="ml-4 mt-2 flex flex-wrap gap-3">
                  {(parent.children?.length ? parent.children : []).map((child) => (
                    <label key={child.id} className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(child.id)}
                        onChange={() => toggleCategory(child.id)}
                      />
                      <span>{child.name}</span>
                    </label>
                  ))}
                  {(!parent.children || parent.children.length === 0) && (
                    <div className="text-gray-500 text-sm">No child categories</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-red-600 mt-2">{error}</p>}
        {success && <p className="text-green-700 mt-2">{success}</p>}
        
        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>

      </form>
    </main>
  );
}
