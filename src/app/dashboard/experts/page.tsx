// File: src/app/dashboard/experts/page.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import CategoryTreePicker, { CategoryNode } from "@/components/CategoryTreePicker";
import { pickOrUploadMedia } from "@/lib/mediaManagerAdapter";
import { slugify, getUniqueSlug } from "@/lib/filename";

type Expert = {
  id: number;
  businessName?: string | null;
  serviceTitle?: string | null;
  profileLink?: string | null;
  isBusiness?: boolean;
  email?: string | null;
  shortDesc?: string | null;
  profilePicture?: string | null;
  coverPhoto?: string | null;
  categories?: { category: { id: number; name: string } }[];
  createdAt?: string;
};

const emptyService = () => ({ name: "", image: "", description: "", rateUnit: "" });
const emptyPortfolio = () => ({ imageUrl: "", videoUrl: "", socialUrl: "" });

export default function ExpertsPage() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(false);

  const [isWizardOpen, setWizardOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [step, setStep] = useState(1);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // track whether user manually edited the slug
  const userEditedSlugRef = useRef(false);

  const [form, setForm] = useState<any>({
    isBusiness: true,
    businessName: "",
    serviceTitle: "",
    contactPerson: "",
    profileLink: "",
    email: "",
    phone: "",
    whatsapp: "",
    officeAddress: "",
    webAddress: "",
    mapLocation: "",
    mapLat: "",
    mapLng: "",
    profilePicture: "",
    coverPhoto: "",
    shortDesc: "",
    featured: false,
    categoryIds: [] as number[],
    services: [emptyService()],
    portfolio: [emptyPortfolio()],
  });

  useEffect(() => {
    loadExperts();
    loadCategories();
  }, []);

  async function loadExperts() {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/experts");
      const data = await res.json();
      setExperts(data || []);
    } catch (err) {
      console.error(err);
      setExperts([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data || []);
    } catch (err) {
      console.error(err);
      setCategories([]);
    }
  }

  const existingSlugs = useMemo(
    () => experts.map((e) => (e.profileLink || "").toString().toLowerCase()).filter(Boolean),
    [experts]
  );

  // Auto-generate slug in real time unless user manually edited it
  useEffect(() => {
    const base = form.isBusiness ? form.businessName : form.serviceTitle;
    if (!base) {
      if (!userEditedSlugRef.current) setForm((s: any) => ({ ...s, profileLink: "" }));
      return;
    }
    if (userEditedSlugRef.current) return;
    const exclude = isEditing ? (experts.find((x) => x.id === editingId)?.profileLink || null) : null;
    const generated = getUniqueSlug(base, existingSlugs, exclude);
    setForm((s: any) => ({ ...s, profileLink: generated }));
  }, [form.businessName, form.serviceTitle, form.isBusiness, existingSlugs, isEditing, editingId]);

  function handleIdentityChange(partial: Partial<any>) {
    setForm((prev: any) => ({ ...prev, ...partial }));
  }

  function handleProfileLinkInput(value: string) {
    userEditedSlugRef.current = true;
    setForm((s: any) => ({ ...s, profileLink: slugify(value) }));
  }

  function resetProfileLinkManualFlag() {
    userEditedSlugRef.current = false;
  }

  function openCreateWizard() {
    setIsEditing(false);
    setEditingId(null);
    setForm({
      isBusiness: true,
      businessName: "",
      serviceTitle: "",
      contactPerson: "",
      profileLink: "",
      email: "",
      phone: "",
      whatsapp: "",
      officeAddress: "",
      webAddress: "",
      mapLocation: "",
      mapLat: "",
      mapLng: "",
      profilePicture: "",
      coverPhoto: "",
      shortDesc: "",
      featured: false,
      categoryIds: [],
      services: [emptyService()],
      portfolio: [emptyPortfolio()],
    });
    userEditedSlugRef.current = false;
    setStep(1);
    setWizardOpen(true);
    setError(null);
    setSuccess(null);
  }

  async function openEditWizard(id: number) {
    setIsEditing(true);
    setEditingId(id);
    setStep(1);
    setWizardOpen(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/dashboard/experts/${id}`);
      if (!res.ok) throw new Error("Failed to fetch expert");
      const data = await res.json();
      const categoryIds = (data.categories || []).map((c: any) => c.category?.id).filter(Boolean);
      userEditedSlugRef.current = false;
      setForm({
        isBusiness: !!data.isBusiness,
        businessName: data.businessName ?? "",
        serviceTitle: data.serviceTitle ?? "",
        contactPerson: data.contactPerson ?? "",
        profileLink: data.profileLink ?? (data.businessName ? slugify(data.businessName) : ""),
        email: data.email ?? "",
        phone: data.phone ?? "",
        whatsapp: data.whatsapp ?? "",
        officeAddress: data.officeAddress ?? "",
        webAddress: data.webAddress ?? "",
        mapLocation: data.mapLocation ?? "",
        mapLat: data.mapLat ?? "",
        mapLng: data.mapLng ?? "",
        profilePicture: data.profilePicture ?? "",
        coverPhoto: data.coverPhoto ?? "",
        shortDesc: data.shortDesc ?? "",
        featured: !!data.featured,
        categoryIds,
        services: (data.services && data.services.length > 0) ? data.services : [emptyService()],
        portfolio: (data.portfolio && data.portfolio.length > 0) ? data.portfolio : [emptyPortfolio()],
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load expert for editing.");
      setWizardOpen(false);
    }
  }

  async function submitWizard() {
    setError(null);
    setSuccess(null);

    if (form.isBusiness) {
      if (!form.businessName?.trim()) {
        setError("Business Name is required.");
        return;
      }
    } else {
      if (!form.serviceTitle?.trim()) {
        setError("Service Title is required.");
        return;
      }
      if (!form.contactPerson?.trim()) {
        setError("Contact Person is required for Individual accounts.");
        return;
      }
    }

    if (!form.profileLink?.trim()) {
      setError("Profile Link (slug) is required.");
      return;
    }

    if (!form.email?.trim()) {
      setError("Email is required.");
      return;
    }

    if (!form.phone?.trim() && !form.whatsapp?.trim()) {
      setError("Phone (WhatsApp) is required.");
      return;
    }

    try {
      const payload = {
        isBusiness: !!form.isBusiness,
        businessName: form.businessName || null,
        serviceTitle: form.serviceTitle || null,
        contactPerson: form.contactPerson || null,
        profileLink: form.profileLink,
        email: form.email,
        phone: form.phone || null,
        whatsapp: form.whatsapp || null,
        officeAddress: form.officeAddress || null,
        webAddress: form.webAddress || null,
        mapLocation: form.mapLocation || (form.mapLat && form.mapLng ? `${form.mapLat},${form.mapLng}` : null),
        profilePicture: form.profilePicture || null,
        coverPhoto: form.coverPhoto || null,
        shortDesc: form.shortDesc || null,
        featured: !!form.featured,
        categoryIds: form.categoryIds || [],
        services: form.services || [],
        portfolio: form.portfolio || [],
      };

      let res: Response;
      if (isEditing && editingId) {
        res = await fetch(`/api/dashboard/experts/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/dashboard/experts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to save expert.");
        return;
      }

      setSuccess(isEditing ? "Expert updated." : "Expert created.");
      setWizardOpen(false);
      await loadExperts();
    } catch (err) {
      console.error(err);
      setError("Failed to save expert.");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this expert? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/dashboard/experts/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to delete expert.");
        return;
      }
      setSuccess("Expert deleted.");
      setExperts((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete expert.");
    }
  }

  // Media Manager integration
  async function handlePickProfilePicture() {
    setError(null);
    try {
      const selected = await pickOrUploadMedia(undefined, { accept: "image/*" });
      if (selected?.url) setForm((s: any) => ({ ...s, profilePicture: selected.url }));
    } catch (err) {
      console.error(err);
      setError("Media selection failed.");
    }
  }

  async function handlePickCoverPhoto() {
    setError(null);
    try {
      const selected = await pickOrUploadMedia(undefined, { accept: "image/*" });
      if (selected?.url) setForm((s: any) => ({ ...s, coverPhoto: selected.url }));
    } catch (err) {
      console.error(err);
      setError("Media selection failed.");
    }
  }

  async function handleServiceImageFile(e: React.ChangeEvent<HTMLInputElement>, idx: number) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const selected = await pickOrUploadMedia(file, { accept: "image/*" });
      if (selected?.url) updateService(idx, "image", selected.url);
    } catch (err) {
      console.error(err);
      setError("Service image upload failed.");
    }
  }

  async function handlePortfolioImageFile(e: React.ChangeEvent<HTMLInputElement>, idx: number) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const selected = await pickOrUploadMedia(file, { accept: "image/*" });
      if (selected?.url) updatePortfolio(idx, "imageUrl", selected.url);
    } catch (err) {
      console.error(err);
      setError("Portfolio image upload failed.");
    }
  }

  function addService() {
    setForm((s: any) => ({ ...s, services: [...(s.services || []), emptyService()] }));
  }
  function removeService(idx: number) {
    setForm((s: any) => ({ ...s, services: (s.services || []).filter((_: any, i: number) => i !== idx) }));
  }
  function updateService(idx: number, key: string, value: any) {
    setForm((s: any) => {
      const services = [...(s.services || [])];
      services[idx] = { ...services[idx], [key]: value };
      return { ...s, services };
    });
  }

  function addPortfolio() {
    setForm((s: any) => ({ ...s, portfolio: [...(s.portfolio || []), emptyPortfolio()] }));
  }
  function removePortfolio(idx: number) {
    setForm((s: any) => ({ ...s, portfolio: (s.portfolio || []).filter((_: any, i: number) => i !== idx) }));
  }
  function updatePortfolio(idx: number, key: string, value: any) {
    setForm((s: any) => {
      const portfolio = [...(s.portfolio || [])];
      portfolio[idx] = { ...portfolio[idx], [key]: value };
      return { ...s, portfolio };
    });
  }

  const flatCategories = useMemo(() => {
    const out: { id: number; name: string }[] = [];
    function walk(nodes: CategoryNode[], prefix = "") {
      for (const n of nodes) {
        out.push({ id: n.id, name: prefix ? `${prefix} / ${n.name}` : n.name });
        if (n.children && n.children.length) walk(n.children, prefix ? `${prefix} / ${n.name}` : n.name);
      }
    }
    walk(categories);
    return out;
  }, [categories]);

  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const profilePreview = `${origin}/${form.profileLink || ""}`;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center text-orange-400 text-xl">👤</div>
          <div>
            <h2 className="text-xl font-bold text-white">Manage Experts</h2>
            <p className="text-xs text-slate-400">{experts.length} total</p>
          </div>
        </div>
        <button onClick={openCreateWizard} className="bg-orange-500 hover:bg-orange-400 text-slate-900 font-bold px-4 py-2 rounded-xl text-sm transition-colors">
          + Add Expert
        </button>
      </div>

      {error && <div className="bg-red-500/15 border border-red-500/25 text-red-300 text-sm rounded-xl px-4 py-3">{error}</div>}
      {success && <div className="bg-green-500/15 border border-green-500/25 text-green-300 text-sm rounded-xl px-4 py-3">{success}</div>}

      <div className="rounded-2xl border border-white/8 bg-slate-800/40 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8 text-slate-500 text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3 hidden sm:table-cell">Email</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Profile Link</th>
              <th className="text-left px-4 py-3 hidden lg:table-cell">Categories</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Created</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="text-center py-10"><div className="w-7 h-7 rounded-full border-2 border-orange-500 border-t-transparent animate-spin mx-auto" /></td></tr>
            )}

            {!loading && experts.length === 0 && (
              <tr><td colSpan={6} className="text-center py-10 text-slate-500 text-sm">No experts yet.</td></tr>
            )}

            {experts.map((expert) => (
              <tr key={expert.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                <td className="px-4 py-3 text-white font-medium">{expert.businessName || expert.serviceTitle || "—"}</td>
                <td className="px-4 py-3 text-slate-400 text-xs hidden sm:table-cell">{expert.email || "—"}</td>
                <td className="px-4 py-3 text-slate-400 font-mono text-xs hidden md:table-cell">{expert.profileLink || "—"}</td>
                <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">
                  {(expert.categories || []).map((c) => c.category?.name).filter(Boolean).join(", ") || "—"}
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">{expert.createdAt ? new Date(expert.createdAt).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEditWizard(expert.id)} className="text-xs bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-lg transition-colors">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(expert.id)} className="text-xs bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20 px-3 py-1 rounded-lg transition-colors">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Wizard Modal */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setWizardOpen(false)} />
          <div className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-auto max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
              <h3 className="text-base font-semibold text-white">{isEditing ? "Edit Expert" : "Add Expert"}</h3>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">Step {step} / 4</span>
                <button onClick={() => setWizardOpen(false)} className="text-slate-500 hover:text-white transition-colors text-sm">Close</button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Step 1 */}
              {step === 1 && (
                <section>
                  <h4 className="font-semibold mb-3">Identity & Contact</h4>

                  {/* Toggle pill */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center bg-gray-100 rounded-full p-1">
                      <button
                        onClick={() => {
                          resetProfileLinkManualFlag();
                          handleIdentityChange({ isBusiness: true });
                        }}
                        className={`px-4 py-1 rounded-full transition ${form.isBusiness ? "bg-white shadow text-gray-900" : "text-gray-600"}`}
                        aria-pressed={form.isBusiness === true}
                      >
                        Business
                      </button>
                      <button
                        onClick={() => {
                          resetProfileLinkManualFlag();
                          handleIdentityChange({ isBusiness: false });
                        }}
                        className={`px-4 py-1 rounded-full transition ${form.isBusiness === false ? "bg-white shadow text-gray-900" : "text-gray-600"}`}
                        aria-pressed={form.isBusiness === false}
                      >
                        Individual
                      </button>
                    </div>

                    {/* Contact Person to the right on desktop */}
                    <div className="ml-auto hidden sm:block">
                      {!form.isBusiness && (
                        <div>
                          <label className="block text-sm font-medium">Contact Person</label>
                          <input
                            type="text"
                            value={form.contactPerson}
                            onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                            className="mt-2 border px-3 py-2 rounded w-64"
                            placeholder="Contact person"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Name/Title + Slug side-by-side on desktop */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div>
                      {form.isBusiness ? (
                        <>
                          <label className="block text-sm font-medium">Business Name</label>
                          <input
                            type="text"
                            value={form.businessName}
                            onChange={(e) => {
                              userEditedSlugRef.current = false;
                              handleIdentityChange({ businessName: e.target.value });
                            }}
                            className="mt-2 border px-3 py-2 rounded w-full"
                            placeholder="Business name"
                          />
                        </>
                      ) : (
                        <>
                          <label className="block text-sm font-medium">Service Title</label>
                          <input
                            type="text"
                            value={form.serviceTitle}
                            onChange={(e) => {
                              userEditedSlugRef.current = false;
                              handleIdentityChange({ serviceTitle: e.target.value });
                            }}
                            className="mt-2 border px-3 py-2 rounded w-full"
                            placeholder="Service title"
                          />
                        </>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium">Profile Link</label>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-gray-600 select-all break-all">{origin}/</span>
                        <input
                          type="text"
                          value={form.profileLink}
                          onChange={(e) => handleProfileLinkInput(e.target.value)}
                          className="border px-3 py-2 rounded flex-1"
                          placeholder="auto-generated-slug"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Auto-generated from Business Name / Service Title. You can customize it.</p>

                      {/* Contact Person on mobile */}
                      {!form.isBusiness && (
                        <div className="mt-3 block sm:hidden">
                          <label className="block text-sm font-medium">Contact Person</label>
                          <input
                            type="text"
                            value={form.contactPerson}
                            onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                            className="mt-2 border px-3 py-2 rounded w-full"
                            placeholder="Contact person"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Email / Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium">Email</label>
                      <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-2 border px-3 py-2 rounded w-full" placeholder="email@example.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Phone (WhatsApp)</label>
                      <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-2 border px-3 py-2 rounded w-full" placeholder="+8801..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">WhatsApp (if different)</label>
                      <input type="text" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="mt-2 border px-3 py-2 rounded w-full" placeholder="+8801..." />
                    </div>
                  </div>

                  {/* Profile preview directly beneath slug */}
                  <div className="mt-3 text-sm text-gray-700">
                    <span className="font-medium">Profile preview:</span>{" "}
                    <a href={profilePreview} target="_blank" rel="noreferrer" className="text-blue-600 break-all">
                      {profilePreview}
                    </a>
                  </div>
                </section>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <section>
                  <h4 className="font-semibold mb-3">Location, Website & Media</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium">Office / Registered Address</label>
                      <input type="text" value={form.officeAddress} onChange={(e) => setForm({ ...form, officeAddress: e.target.value })} className="mt-2 border px-3 py-2 rounded w-full" placeholder="Street, City, Country" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">Website</label>
                      <input type="text" value={form.webAddress} onChange={(e) => setForm({ ...form, webAddress: e.target.value })} className="mt-2 border px-3 py-2 rounded w-full" placeholder="https://example.com" />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium">Map Location (choose one)</label>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input type="text" value={form.mapLocation} onChange={(e) => setForm({ ...form, mapLocation: e.target.value })} className="border px-3 py-2 rounded w-full" placeholder="Google Maps URL or place link" />
                        <input type="text" value={form.mapLat} onChange={(e) => setForm({ ...form, mapLat: e.target.value })} className="border px-3 py-2 rounded w-full" placeholder="Latitude (e.g., 23.7809)" />
                        <input type="text" value={form.mapLng} onChange={(e) => setForm({ ...form, mapLng: e.target.value })} className="border px-3 py-2 rounded w-full" placeholder="Longitude (e.g., 90.2792)" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">You can paste a Google Maps URL, or provide latitude and longitude. Map pin picker can be added later.</p>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium">Categories</label>
                      <div className="mt-2 border rounded p-3 max-h-48 overflow-auto">
                        <CategoryTreePicker tree={categories} selectedIds={form.categoryIds} onChange={(ids: number[]) => setForm({ ...form, categoryIds: ids })} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium">Profile Picture</label>
                      <div className="mt-2 flex gap-2">
                        <button type="button" onClick={handlePickProfilePicture} className="px-3 py-2 border rounded">Choose from Media Manager</button>
                        <input type="text" placeholder="Or paste image URL" value={form.profilePicture} onChange={(e) => setForm({ ...form, profilePicture: e.target.value })} className="border px-3 py-2 rounded flex-1" />
                      </div>
                      {form.profilePicture && <img src={form.profilePicture} alt="profile" className="mt-2 w-28 h-28 object-cover rounded" />}
                    </div>

                    <div>
                      <label className="block text-sm font-medium">Cover Photo</label>
                      <div className="mt-2 flex gap-2">
                        <button type="button" onClick={handlePickCoverPhoto} className="px-3 py-2 border rounded">Choose from Media Manager</button>
                        <input type="text" placeholder="Or paste image URL" value={form.coverPhoto} onChange={(e) => setForm({ ...form, coverPhoto: e.target.value })} className="border px-3 py-2 rounded flex-1" />
                      </div>
                      {form.coverPhoto && <img src={form.coverPhoto} alt="cover" className="mt-2 w-full h-24 object-cover rounded" />}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium">Short Description</label>
                      <textarea value={form.shortDesc} onChange={(e) => setForm({ ...form, shortDesc: e.target.value })} className="mt-2 border px-3 py-2 rounded w-full" rows={3} />
                    </div>
                  </div>
                </section>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <section>
                  <h4 className="font-semibold mb-3">Services Offered</h4>
                  <div className="space-y-4">
                    {(form.services || []).map((svc: any, idx: number) => (
                      <div key={idx} className="border rounded p-3">
                        <div className="flex justify-between items-center mb-2">
                          <strong>Service {idx + 1}</strong>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => removeService(idx)} className="text-sm text-red-600">Remove</button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input type="text" placeholder="Service name" value={svc.name} onChange={(e) => updateService(idx, "name", e.target.value)} className="border px-3 py-2 rounded w-full" />
                          <div>
                            <label className="block text-sm">Image</label>
                            <div className="flex gap-2 items-center">
                              <input type="file" accept="image/*" onChange={(e) => handleServiceImageFile(e, idx)} />
                              <button type="button" onClick={async () => {
                                try {
                                  const selected = await pickOrUploadMedia(undefined, { accept: "image/*" });
                                  if (selected?.url) updateService(idx, "image", selected.url);
                                } catch (err) {
                                  console.error(err);
                                  setError("Service image selection failed.");
                                }
                              }} className="px-2 py-1 border rounded text-sm">Choose from Media Manager</button>
                            </div>
                            {svc.image && <img src={svc.image} alt="svc" className="mt-2 w-28 h-20 object-cover rounded" />}
                          </div>
                          <textarea placeholder="Description" value={svc.description} onChange={(e) => updateService(idx, "description", e.target.value)} className="border px-3 py-2 rounded col-span-2 w-full" />
                          <input type="text" placeholder="Rate / Unit (optional)" value={svc.rateUnit} onChange={(e) => updateService(idx, "rateUnit", e.target.value)} className="border px-3 py-2 rounded w-full" />
                        </div>
                      </div>
                    ))}
                    <div>
                      <button type="button" onClick={addService} className="px-3 py-2 bg-gray-200 rounded">+ Add Service</button>
                    </div>
                  </div>
                </section>
              )}

              {/* Step 4 */}
              {step === 4 && (
                <section>
                  <h4 className="font-semibold mb-3">Portfolio & Finalize</h4>
                  <div className="space-y-4">
                    {(form.portfolio || []).map((p: any, idx: number) => (
                      <div key={idx} className="border rounded p-3">
                        <div className="flex justify-between items-center mb-2">
                          <strong>Item {idx + 1}</strong>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => removePortfolio(idx)} className="text-sm text-red-600">Remove</button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm">Image</label>
                            <div className="flex gap-2 items-center">
                              <input type="file" accept="image/*" onChange={(e) => handlePortfolioImageFile(e, idx)} />
                              <button type="button" onClick={async () => {
                                try {
                                  const selected = await pickOrUploadMedia(undefined, { accept: "image/*" });
                                  if (selected?.url) updatePortfolio(idx, "imageUrl", selected.url);
                                } catch (err) {
                                  console.error(err);
                                  setError("Portfolio image selection failed.");
                                }
                              }} className="px-2 py-1 border rounded text-sm">Choose from Media Manager</button>
                            </div>
                            {p.imageUrl && <img src={p.imageUrl} alt="pf" className="mt-2 w-28 h-20 object-cover rounded" />}
                          </div>
                          <input type="text" placeholder="Video URL (YouTube/Facebook)" value={p.videoUrl} onChange={(e) => updatePortfolio(idx, "videoUrl", e.target.value)} className="border px-3 py-2 rounded w-full" />
                          <input type="text" placeholder="Social / External link" value={p.socialUrl} onChange={(e) => updatePortfolio(idx, "socialUrl", e.target.value)} className="border px-3 py-2 rounded w-full" />
                        </div>
                      </div>
                    ))}
                    <div>
                      <button type="button" onClick={addPortfolio} className="px-3 py-2 bg-gray-200 rounded">+ Add Portfolio Item</button>
                    </div>

                    <div className="mt-4">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                        <span>Mark as featured</span>
                      </label>
                    </div>
                  </div>
                </section>
              )}

              {/* Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between mt-6 border-t border-white/8 pt-4 gap-3">
                <div className="flex gap-2">
                  {step > 1 && <button onClick={() => setStep((s) => Math.max(1, s - 1))} className="px-4 py-2 border border-white/10 text-slate-300 hover:text-white rounded-xl text-sm transition-colors">Back</button>}
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setWizardOpen(false)} className="px-4 py-2 border border-white/10 text-slate-400 hover:text-white rounded-xl text-sm transition-colors">Cancel</button>
                  {step === 4 ? (
                    <button onClick={submitWizard} className="px-5 py-2 bg-orange-500 hover:bg-orange-400 text-slate-900 font-bold rounded-xl text-sm transition-colors">{isEditing ? "Save Changes" : "Create Expert"}</button>
                  ) : (
                    <button onClick={() => setStep((s) => Math.min(4, s + 1))} className="px-5 py-2 bg-orange-500 hover:bg-orange-400 text-slate-900 font-bold rounded-xl text-sm transition-colors">Continue →</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
