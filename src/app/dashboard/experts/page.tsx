// File: src/app/dashboard/experts/page.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import CategoryTreePicker, { CategoryNode } from "@/components/CategoryTreePicker";
import { pickOrUploadMedia } from "@/lib/mediaManagerAdapter";
import { slugify, getUniqueSlug } from "@/lib/filename";
import MapPicker, { LatLng } from "@/components/MapPicker";

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
  countryCode?: string | null;
  verified?: boolean;
  categories?: { category: { id: number; name: string } }[];
  createdAt?: string;
};

const emptyService = () => ({ name: "", image: "", description: "", rateUnit: "" });
const emptyPortfolio = () => ({ imageUrl: "", videoUrl: "", socialUrl: "" });

export default function ExpertsPage() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [countries, setCountries] = useState<{ code: string; name: string; flagEmoji?: string }[]>([]);
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
    countryCode: "",
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
    loadCountries();
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

  async function loadCountries() {
    try {
      const res = await fetch("/api/countries");
      const data = await res.json();
      setCountries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadCategories(countryCode?: string) {
    try {
      const url = countryCode
        ? `/api/country/${countryCode}/categories`
        : `/api/categories`;
      const res = await fetch(url);
      const data = await res.json();
      const list = countryCode ? (data.categories || []) : (data || []);
      setCategories(list);
    } catch (err) {
      console.error(err);
      setCategories([]);
    }
  }

  const existingSlugs = useMemo(
    () => experts.map((e) => (e.profileLink || "").toString().toLowerCase()).filter(Boolean),
    [experts]
  );

  // Reload categories whenever the country changes inside the wizard
  useEffect(() => {
    if (isWizardOpen) {
      loadCategories(form.countryCode || undefined);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.countryCode, isWizardOpen]);

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
      countryCode: "",
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
        countryCode: data.countryCode ?? "",
        profileLink: data.profileLink ?? (data.businessName ? slugify(data.businessName) : ""),
        email: data.email ?? "",
        phone: data.phone ?? "",
        whatsapp: data.whatsapp ?? "",
        officeAddress: data.officeAddress ?? "",
        webAddress: data.webAddress ?? "",
        mapLocation: data.mapLocation ?? "",
        mapLat: data.latitude ? String(data.latitude) : "",
        mapLng: data.longitude ? String(data.longitude) : "",
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

    if (!form.countryCode?.trim()) {
      setError("Country of Operations is required.");
      return;
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
        countryCode: form.countryCode || null,
        profileLink: form.profileLink,
        email: form.email,
        phone: form.phone || null,
        whatsapp: form.whatsapp || null,
        officeAddress: form.officeAddress || null,
        webAddress: form.webAddress || null,
        mapLocation: form.mapLocation || (form.mapLat && form.mapLng ? `${form.mapLat},${form.mapLng}` : null),
        latitude: form.mapLat ? parseFloat(form.mapLat) : null,
        longitude: form.mapLng ? parseFloat(form.mapLng) : null,
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

  async function toggleVerified(id: number, current: boolean) {
    setExperts((prev) => prev.map((e) => e.id === id ? { ...e, verified: !current } : e));
    try {
      const res = await fetch(`/api/dashboard/experts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified: !current }),
      });
      if (!res.ok) {
        setExperts((prev) => prev.map((e) => e.id === id ? { ...e, verified: current } : e));
        setError("Failed to update verification status.");
      }
    } catch {
      setExperts((prev) => prev.map((e) => e.id === id ? { ...e, verified: current } : e));
      setError("Failed to update verification status.");
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
  const profilePreview = form.countryCode && form.profileLink
    ? `${origin}/${form.countryCode}/expert/${form.profileLink}`
    : form.profileLink
    ? `${origin}/[country]/expert/${form.profileLink}`
    : `${origin}/[country]/expert/...`;

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold">Manage Experts</h2>
        <div className="flex items-center gap-3">
          <button onClick={openCreateWizard} className="bg-[#b84c4c] text-white px-4 py-2 rounded">
            Add Expert
          </button>
        </div>
      </div>

      {error && <div className="mb-4 text-red-500">{error}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 text-sm">
          <thead>
            <tr className="border-b border-white/8 text-slate-500 text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3 hidden sm:table-cell">Email</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Profile Link</th>
              <th className="text-left px-4 py-3 hidden lg:table-cell">Categories</th>
              <th className="text-center px-4 py-3">Verified</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Created</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="text-center py-6">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && experts.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-6 text-sm text-gray-500">
                  No experts yet.
                </td>
              </tr>
            )}

            {experts.map((expert) => (
              <tr key={expert.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                <td className="px-4 py-3 text-white font-medium">{expert.businessName || expert.serviceTitle || "—"}</td>
                <td className="px-4 py-3 text-slate-400 text-xs hidden sm:table-cell">{expert.email || "—"}</td>
                <td className="px-4 py-3 text-slate-400 font-mono text-xs hidden md:table-cell">
                  {expert.countryCode ? <span className="text-orange-400 mr-1">{expert.countryCode.toUpperCase()}</span> : null}
                  {expert.profileLink || "—"}
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">
                  {(expert.categories || []).map((c) => c.category?.name).filter(Boolean).join(", ") || "—"}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleVerified(expert.id, !!expert.verified)}
                    title={expert.verified ? "Click to unverify" : "Click to verify"}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                      expert.verified
                        ? "bg-green-500/15 text-green-300 border-green-500/25 hover:bg-green-500/25"
                        : "bg-slate-700/50 text-slate-500 border-white/10 hover:bg-slate-700 hover:text-slate-300"
                    }`}
                  >
                    {expert.verified ? "✓ Verified" : "Unverified"}
                  </button>
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
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setWizardOpen(false)} />
          <div className="relative w-full max-w-4xl bg-white rounded shadow-lg overflow-auto max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">{isEditing ? "Edit Expert" : "Add Expert"}</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Step {step} / 4</span>
                <button onClick={() => setWizardOpen(false)} className="text-gray-600 hover:text-gray-900">
                  Close
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Step 1 */}
              {step === 1 && (
                <section>
                  <h4 className="font-semibold text-white mb-4">Identity & Contact</h4>

                  {/* Toggle pill */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="flex items-center bg-slate-800 border border-white/10 rounded-full p-1">
                      <button
                        onClick={() => { resetProfileLinkManualFlag(); handleIdentityChange({ isBusiness: true }); }}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${form.isBusiness ? "bg-orange-500 text-slate-900" : "text-slate-400 hover:text-white"}`}
                      >
                        Business
                      </button>
                      <button
                        onClick={() => { resetProfileLinkManualFlag(); handleIdentityChange({ isBusiness: false }); }}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${form.isBusiness === false ? "bg-orange-500 text-slate-900" : "text-slate-400 hover:text-white"}`}
                      >
                        Individual
                      </button>
                    </div>

                    <div className="ml-auto hidden sm:block">
                      {!form.isBusiness && (
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Contact Person</label>
                          <input
                            type="text"
                            value={form.contactPerson}
                            onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                            className="w-64 bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50 transition-colors"
                            placeholder="Full name"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Country of Operations */}
                  <div className="mb-5">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Country of Operations <span className="text-red-400">*</span></label>
                    <select
                      value={form.countryCode}
                      onChange={(e) => setForm((s: any) => ({ ...s, countryCode: e.target.value, categoryIds: [] }))}
                      className="w-full sm:w-64 bg-slate-800 border border-white/10 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-500/50 transition-colors"
                    >
                      <option value="">— Select country —</option>
                      {countries.map((c) => (
                        <option key={c.code} value={c.code}>{c.flagEmoji ? `${c.flagEmoji} ` : ""}{c.name} ({c.code.toUpperCase()})</option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">Determines the profile URL prefix and available categories.</p>
                  </div>

                  {/* Name/Title + Slug */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">{form.isBusiness ? "Business Name" : "Service Title"}</label>
                      <input
                        type="text"
                        value={form.isBusiness ? form.businessName : form.serviceTitle}
                        onChange={(e) => { userEditedSlugRef.current = false; handleIdentityChange(form.isBusiness ? { businessName: e.target.value } : { serviceTitle: e.target.value }); }}
                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50 transition-colors"
                        placeholder={form.isBusiness ? "Business name" : "Service title"}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Profile Link</label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 select-all shrink-0">{origin}/</span>
                        <input
                          type="text"
                          value={form.profileLink}
                          onChange={(e) => handleProfileLinkInput(e.target.value)}
                          className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50 transition-colors"
                          placeholder="auto-generated-slug"
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Auto-generated from name. You can customize it.</p>

                      {!form.isBusiness && (
                        <div className="mt-3 block sm:hidden">
                          <label className="block text-xs font-medium text-slate-400 mb-1">Contact Person</label>
                          <input
                            type="text"
                            value={form.contactPerson}
                            onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                            className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50 transition-colors"
                            placeholder="Full name"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Email / Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
                      <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50 transition-colors" placeholder="email@example.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Phone (WhatsApp)</label>
                      <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50 transition-colors" placeholder="+8801..." />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">WhatsApp (if different)</label>
                      <input type="text" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50 transition-colors" placeholder="+8801..." />
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-500">
                    Profile preview:{" "}
                    <a href={profilePreview} target="_blank" rel="noreferrer" className="text-orange-400 hover:text-orange-300 break-all transition-colors">
                      {profilePreview}
                    </a>
                  </div>
                </section>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <section>
                  <h4 className="font-semibold text-white mb-4">Location, Website & Media</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Office / Registered Address</label>
                      <input type="text" value={form.officeAddress} onChange={(e) => setForm({ ...form, officeAddress: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50 transition-colors" placeholder="Street, City, Country" />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Website</label>
                      <input type="text" value={form.webAddress} onChange={(e) => setForm({ ...form, webAddress: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50 transition-colors" placeholder="https://example.com" />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-400 mb-1">Map Location</label>
                      <MapPicker
                        value={form.mapLat && form.mapLng ? { lat: parseFloat(form.mapLat), lng: parseFloat(form.mapLng) } : null}
                        onChange={(coords: LatLng, address?: string) => {
                          setForm({ ...form, mapLat: String(coords.lat), mapLng: String(coords.lng), mapLocation: address || form.mapLocation });
                        }}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-400 mb-1">Categories</label>
                      <div className="mt-1 bg-slate-800 border border-white/10 rounded-xl p-3 max-h-48 overflow-auto">
                        <CategoryTreePicker tree={categories} selectedIds={form.categoryIds} onChange={(ids: number[]) => setForm({ ...form, categoryIds: ids })} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Profile Picture</label>
                      <div className="flex gap-2">
                        <button type="button" onClick={handlePickProfilePicture} className="shrink-0 bg-slate-800 border border-white/10 hover:border-orange-500/40 text-slate-300 hover:text-white text-xs px-3 py-2 rounded-xl transition-colors">
                          Media Manager
                        </button>
                        <input type="text" placeholder="Or paste image URL" value={form.profilePicture} onChange={(e) => setForm({ ...form, profilePicture: e.target.value })} className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50 transition-colors" />
                      </div>
                      {form.profilePicture && <img src={form.profilePicture} alt="profile" className="mt-2 w-20 h-20 object-cover rounded-xl border border-white/10" />}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Cover Photo</label>
                      <div className="flex gap-2">
                        <button type="button" onClick={handlePickCoverPhoto} className="shrink-0 bg-slate-800 border border-white/10 hover:border-orange-500/40 text-slate-300 hover:text-white text-xs px-3 py-2 rounded-xl transition-colors">
                          Media Manager
                        </button>
                        <input type="text" placeholder="Or paste image URL" value={form.coverPhoto} onChange={(e) => setForm({ ...form, coverPhoto: e.target.value })} className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50 transition-colors" />
                      </div>
                      {form.coverPhoto && <img src={form.coverPhoto} alt="cover" className="mt-2 w-full h-20 object-cover rounded-xl border border-white/10" />}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-400 mb-1">Short Description</label>
                      <textarea value={form.shortDesc} onChange={(e) => setForm({ ...form, shortDesc: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50 transition-colors resize-none" rows={3} placeholder="Brief description shown on listing cards…" />
                    </div>
                  </div>
                </section>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <section>
                  <h4 className="font-semibold text-white mb-4">Services Offered</h4>
                  <div className="space-y-3">
                    {(form.services || []).map((svc: any, idx: number) => (
                      <div key={idx} className="bg-slate-800/60 border border-white/8 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-medium text-white">Service {idx + 1}</span>
                          <button type="button" onClick={() => removeService(idx)} className="text-xs text-red-400 hover:text-red-300 transition-colors">Remove</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input type="text" placeholder="Service name" value={svc.name} onChange={(e) => updateService(idx, "name", e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50 transition-colors" />
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">Image</label>
                            <div className="flex gap-2 items-center">
                              <input type="file" accept="image/*" onChange={(e) => handleServiceImageFile(e, idx)} className="text-xs text-slate-400 file:mr-2 file:text-xs file:bg-slate-700 file:border-0 file:text-slate-300 file:rounded-lg file:px-2 file:py-1" />
                              <button type="button" onClick={async () => {
                                try {
                                  const selected = await pickOrUploadMedia(undefined, { accept: "image/*" });
                                  if (selected?.url) updateService(idx, "image", selected.url);
                                } catch (err) {
                                  console.error(err);
                                  setError("Service image selection failed.");
                                }
                              }} className="shrink-0 bg-slate-700 border border-white/10 hover:border-orange-500/40 text-slate-300 text-xs px-2 py-1 rounded-lg transition-colors">Media</button>
                            </div>
                            {svc.image && <img src={svc.image} alt="svc" className="mt-2 w-24 h-16 object-cover rounded-lg border border-white/10" />}
                          </div>
                          <textarea placeholder="Description" value={svc.description} onChange={(e) => updateService(idx, "description", e.target.value)} className="sm:col-span-2 w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50 transition-colors resize-none" rows={2} />
                          <input type="text" placeholder="Rate / Unit (optional)" value={svc.rateUnit} onChange={(e) => updateService(idx, "rateUnit", e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50 transition-colors" />
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={addService} className="w-full border border-dashed border-white/15 hover:border-orange-500/40 text-slate-400 hover:text-white text-sm py-2.5 rounded-xl transition-colors">
                      + Add Service
                    </button>
                  </div>
                </section>
              )}

              {/* Step 4 */}
              {step === 4 && (
                <section>
                  <h4 className="font-semibold text-white mb-4">Portfolio & Finalize</h4>
                  <div className="space-y-3">
                    {(form.portfolio || []).map((p: any, idx: number) => (
                      <div key={idx} className="bg-slate-800/60 border border-white/8 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-medium text-white">Item {idx + 1}</span>
                          <button type="button" onClick={() => removePortfolio(idx)} className="text-xs text-red-400 hover:text-red-300 transition-colors">Remove</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">Image</label>
                            <div className="flex gap-2 items-center flex-wrap">
                              <input type="file" accept="image/*" onChange={(e) => handlePortfolioImageFile(e, idx)} className="text-xs text-slate-400 file:mr-2 file:text-xs file:bg-slate-700 file:border-0 file:text-slate-300 file:rounded-lg file:px-2 file:py-1" />
                              <button type="button" onClick={async () => {
                                try {
                                  const selected = await pickOrUploadMedia(undefined, { accept: "image/*" });
                                  if (selected?.url) updatePortfolio(idx, "imageUrl", selected.url);
                                } catch (err) {
                                  console.error(err);
                                  setError("Portfolio image selection failed.");
                                }
                              }} className="shrink-0 bg-slate-700 border border-white/10 hover:border-orange-500/40 text-slate-300 text-xs px-2 py-1 rounded-lg transition-colors">Media</button>
                            </div>
                            {p.imageUrl && <img src={p.imageUrl} alt="pf" className="mt-2 w-24 h-16 object-cover rounded-lg border border-white/10" />}
                          </div>
                          <input type="text" placeholder="Video URL (YouTube/Facebook)" value={p.videoUrl} onChange={(e) => updatePortfolio(idx, "videoUrl", e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50 transition-colors" />
                          <input type="text" placeholder="Social / External link" value={p.socialUrl} onChange={(e) => updatePortfolio(idx, "socialUrl", e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50 transition-colors" />
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={addPortfolio} className="w-full border border-dashed border-white/15 hover:border-orange-500/40 text-slate-400 hover:text-white text-sm py-2.5 rounded-xl transition-colors">
                      + Add Portfolio Item
                    </button>

                    <div className="mt-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 accent-orange-500 rounded" />
                        <span className="text-sm text-slate-300">Mark as featured</span>
                      </label>
                    </div>
                  </div>
                </section>
              )}

              {/* Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between mt-6 border-t pt-4 gap-3">
                <div className="flex gap-2">
                  {step > 1 && <button onClick={() => setStep((s) => Math.max(1, s - 1))} className="px-3 py-2 border rounded">Back</button>}
                  {step < 4 && <button onClick={() => setStep((s) => Math.min(4, s + 1))} className="px-3 py-2 bg-gray-200 rounded">Next</button>}
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={() => setWizardOpen(false)} className="px-3 py-2 border rounded">Cancel</button>
                  {step === 4 ? (
                    <button onClick={submitWizard} className="px-4 py-2 bg-[#b84c4c] text-white rounded">{isEditing ? "Save Changes" : "Create Expert"}</button>
                  ) : (
                    <button onClick={() => setStep((s) => Math.min(4, s + 1))} className="px-4 py-2 bg-[#b84c4c] text-white rounded">Continue</button>
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
