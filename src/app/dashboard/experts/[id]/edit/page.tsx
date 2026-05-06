"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import CategoryTreePicker, { CategoryNode } from "@/components/CategoryTreePicker";
import MapPicker, { LatLng } from "@/components/MapPicker";
import { slugify, getUniqueSlug } from "@/lib/filename";
import {
  ArrowLeft, Save, Trash2, Upload, X, Plus, Loader2, CheckCircle2,
  User, MapPin, ImageIcon, FileText, Briefcase, LayoutGrid,
  Link2, Settings, AlertTriangle
} from "lucide-react";

type Service = { id?: number; name: string; description: string; price: string; rateUnit: string; image: string };
type Portfolio = { id?: number; title: string; description: string; imageUrl: string; videoUrl: string; socialUrl: string };

const emptyService = (): Service => ({ name: "", description: "", price: "", rateUnit: "", image: "" });
const emptyPortfolio = (): Portfolio => ({ title: "", description: "", imageUrl: "", videoUrl: "", socialUrl: "" });

const SECTIONS = [
  { id: "identity", label: "Identity", icon: User },
  { id: "contact", label: "Contact & Location", icon: MapPin },
  { id: "media", label: "Media", icon: ImageIcon },
  { id: "bio", label: "Bio & Description", icon: FileText },
  { id: "categories", label: "Categories", icon: LayoutGrid },
  { id: "services", label: "Services", icon: Briefcase },
  { id: "portfolio", label: "Portfolio", icon: ImageIcon },
  { id: "social", label: "Social Links", icon: Link2 },
  { id: "settings", label: "Status & Settings", icon: Settings },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle },
];

function UploadButton({
  current, onUploaded, label, aspect
}: {
  current: string; onUploaded: (url: string) => void; label: string; aspect?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setErr("Max 10MB"); return; }
    setUploading(true); setErr(""); setProgress(0);
    const xhr = new XMLHttpRequest();
    const fd = new FormData(); fd.append("file", file);
    xhr.upload.onprogress = (ev) => { if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100)); };
    xhr.onload = () => {
      setUploading(false);
      if (xhr.status === 200) { onUploaded(JSON.parse(xhr.responseText).url); }
      else { setErr("Upload failed"); }
    };
    xhr.onerror = () => { setUploading(false); setErr("Upload failed"); };
    xhr.open("POST", "/api/media"); xhr.send(fd);
  }

  return (
    <div>
      {current ? (
        <div className={`relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700/50 ${aspect === "cover" ? "h-32 w-full" : "h-28 w-28"}`}>
          <img src={current} alt={label} className="w-full h-full object-cover" />
          <button
            onClick={() => onUploaded("")}
            className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 hover:bg-black text-white rounded-full flex items-center justify-center"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className={`rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-orange-400 dark:hover:border-orange-500/50 transition-colors flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500 hover:text-orange-500 dark:hover:text-orange-400 ${aspect === "cover" ? "h-32 w-full" : "h-28 w-28"}`}
        >
          {uploading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /><span className="text-xs">{progress}%</span></>
          ) : (
            <><Upload className="w-5 h-5" /><span className="text-xs font-medium">{label}</span></>
          )}
        </button>
      )}
      {err && <p className="text-xs text-red-500 mt-1">{err}</p>}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
}

function SectionCard({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} className="rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-white/8 shadow-sm dark:shadow-none overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-white/6">
        <h2 className="font-bold text-slate-900 dark:text-white">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}

const inputCls = "w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors";

export default function ExpertEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("identity");

  const [countries, setCountries] = useState<{ code: string; name: string }[]>([]);
  const [categories, setCategories] = useState<CategoryNode[]>([]);

  const userEditedSlugRef = useRef(false);

  const [form, setForm] = useState({
    isBusiness: true,
    businessName: "", serviceTitle: "", contactPerson: "",
    countryCode: "", profileLink: "",
    email: "", phone: "", whatsapp: "",
    officeAddress: "", webAddress: "",
    mapLocation: "", mapLat: "", mapLng: "",
    profilePicture: "", coverPhoto: "",
    shortDesc: "", bio: "",
    linkedinUrl: "", instagramUrl: "", twitterUrl: "", facebookUrl: "",
    featured: false, homeFeatured: false, mapFeatured: false,
    verified: false, foundingExpert: false,
    categoryIds: [] as number[],
    services: [emptyService()] as Service[],
    portfolio: [emptyPortfolio()] as Portfolio[],
  });

  useEffect(() => {
    loadCountries();
    loadExpert();
  }, [id]);

  useEffect(() => {
    if (form.countryCode) loadCategories(form.countryCode);
  }, [form.countryCode]);

  // Auto-slug from name if user hasn't manually edited
  useEffect(() => {
    if (userEditedSlugRef.current) return;
    const base = form.isBusiness ? form.businessName : form.serviceTitle;
    if (base) setForm((f) => ({ ...f, profileLink: slugify(base) }));
  }, [form.businessName, form.serviceTitle, form.isBusiness]);

  async function loadCountries() {
    const res = await fetch("/api/countries").catch(() => null);
    if (res?.ok) { const d = await res.json(); setCountries(Array.isArray(d) ? d : []); }
  }

  async function loadCategories(cc: string) {
    const res = await fetch(`/api/country/${cc}/categories`).catch(() => null);
    if (res?.ok) { const d = await res.json(); setCategories(d.categories || []); }
  }

  async function loadExpert() {
    setLoading(true);
    const res = await fetch(`/api/dashboard/experts/${id}`);
    if (!res.ok) { setError("Expert not found"); setLoading(false); return; }
    const d = await res.json();
    setForm({
      isBusiness: !!d.isBusiness,
      businessName: d.businessName ?? "",
      serviceTitle: d.serviceTitle ?? d.name ?? "",
      contactPerson: d.contactPerson ?? "",
      countryCode: d.countryCode ?? "",
      profileLink: d.profileLink ?? "",
      email: d.email ?? "",
      phone: d.phone ?? "",
      whatsapp: d.whatsapp ?? "",
      officeAddress: d.officeAddress ?? "",
      webAddress: d.webAddress ?? "",
      mapLocation: d.mapLocation ?? "",
      mapLat: d.latitude ? String(d.latitude) : "",
      mapLng: d.longitude ? String(d.longitude) : "",
      profilePicture: d.profilePicture ?? "",
      coverPhoto: d.coverPhoto ?? "",
      shortDesc: d.shortDesc ?? "",
      bio: d.bio ?? "",
      linkedinUrl: (d as any).linkedinUrl ?? "",
      instagramUrl: (d as any).instagramUrl ?? "",
      twitterUrl: (d as any).twitterUrl ?? "",
      facebookUrl: (d as any).facebookUrl ?? "",
      featured: !!d.featured,
      homeFeatured: !!d.homeFeatured,
      mapFeatured: !!d.mapFeatured,
      verified: !!d.verified,
      foundingExpert: !!d.foundingExpert,
      categoryIds: (d.categories || []).map((c: any) => c.category?.id).filter(Boolean),
      services: d.services?.length ? d.services.map((s: any) => ({
        id: s.id, name: s.name ?? "", description: s.description ?? "",
        price: s.price != null ? String(s.price) : "", rateUnit: s.rateUnit ?? "", image: s.image ?? "",
      })) : [emptyService()],
      portfolio: d.portfolio?.length ? d.portfolio.map((p: any) => ({
        id: p.id, title: p.title ?? "", description: p.description ?? "",
        imageUrl: p.imageUrl ?? "", videoUrl: p.videoUrl ?? "", socialUrl: p.socialUrl ?? "",
      })) : [emptyPortfolio()],
    });
    userEditedSlugRef.current = true;
    setLoading(false);
  }

  function set(partial: Partial<typeof form>) { setForm((f) => ({ ...f, ...partial })); }

  function setService(i: number, partial: Partial<Service>) {
    setForm((f) => { const s = [...f.services]; s[i] = { ...s[i], ...partial }; return { ...f, services: s }; });
  }

  function setPortfolio(i: number, partial: Partial<Portfolio>) {
    setForm((f) => { const p = [...f.portfolio]; p[i] = { ...p[i], ...partial }; return { ...f, portfolio: p }; });
  }

  async function save() {
    setError(null); setSuccess(null); setSaving(true);
    const payload = {
      isBusiness: form.isBusiness,
      businessName: form.businessName || null,
      serviceTitle: form.serviceTitle || null,
      contactPerson: form.contactPerson || null,
      name: form.isBusiness ? (form.businessName || null) : (form.contactPerson || form.serviceTitle || null),
      countryCode: form.countryCode || null,
      profileLink: form.profileLink || null,
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
      bio: form.bio || null,
      linkedinUrl: form.linkedinUrl || null,
      instagramUrl: form.instagramUrl || null,
      twitterUrl: form.twitterUrl || null,
      facebookUrl: form.facebookUrl || null,
      featured: form.featured,
      homeFeatured: form.homeFeatured,
      mapFeatured: form.mapFeatured,
      verified: form.verified,
      foundingExpert: form.foundingExpert,
      categoryIds: form.categoryIds,
      services: form.services.filter((s) => s.name.trim()),
      portfolio: form.portfolio.filter((p) => p.title.trim() || p.imageUrl.trim()),
    };

    const res = await fetch(`/api/dashboard/experts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (res.ok) {
      setSuccess("Saved successfully.");
      setTimeout(() => setSuccess(null), 4000);
    } else {
      const d = await res.json();
      setError(d.error || "Failed to save.");
    }
  }

  async function deleteExpert() {
    if (!confirm("Permanently delete this expert? This cannot be undone.")) return;
    setDeleting(true);
    const res = await fetch(`/api/dashboard/experts/${id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) router.push("/dashboard/experts");
    else setError("Failed to delete.");
  }

  function scrollTo(sectionId: string) {
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 text-slate-900 dark:text-white">
      {/* Top bar */}
      <div className="sticky top-16 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur border-b border-slate-200 dark:border-white/8 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/experts" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> Experts
            </Link>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {form.isBusiness ? form.businessName || "Expert" : form.contactPerson || form.serviceTitle || "Expert"}
            </span>
            {form.countryCode && (
              <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">
                {form.countryCode.toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {form.profileLink && form.countryCode && (
              <a
                href={`/${form.countryCode}/expert/${form.profileLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-lg"
              >
                View Profile ↗
              </a>
            )}
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-bold px-5 py-2 rounded-xl text-sm transition-colors shadow-sm shadow-orange-500/20"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar nav */}
        <aside className="hidden lg:block w-52 shrink-0">
          <nav className="sticky top-36 space-y-0.5">
            {SECTIONS.map(({ id: sectionId, label, icon: Icon }) => (
              <button
                key={sectionId}
                onClick={() => scrollTo(sectionId)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${
                  activeSection === sectionId
                    ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/6 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {error && (
            <div className="flex items-start gap-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />{error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 text-green-600 dark:text-green-400 text-sm px-4 py-3 rounded-xl mb-5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />{success}
            </div>
          )}

          {/* ── IDENTITY ── */}
          <SectionCard id="identity" title="Identity">
            <div className="flex gap-3 mb-5">
              <button
                onClick={() => set({ isBusiness: true })}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${form.isBusiness ? "bg-orange-500 border-orange-500 text-white" : "border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-orange-400"}`}
              >
                Business / Agency
              </button>
              <button
                onClick={() => set({ isBusiness: false })}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${!form.isBusiness ? "bg-orange-500 border-orange-500 text-white" : "border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-orange-400"}`}
              >
                Individual / Freelancer
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {form.isBusiness ? (
                <Field label="Business Name" required>
                  <input value={form.businessName} onChange={(e) => set({ businessName: e.target.value })} className={inputCls} placeholder="Acme Solutions Ltd" />
                </Field>
              ) : (
                <>
                  <Field label="Service Title" required>
                    <input value={form.serviceTitle} onChange={(e) => set({ serviceTitle: e.target.value })} className={inputCls} placeholder="Full-Stack Developer" />
                  </Field>
                  <Field label="Contact Person" required>
                    <input value={form.contactPerson} onChange={(e) => set({ contactPerson: e.target.value })} className={inputCls} placeholder="John Doe" />
                  </Field>
                </>
              )}
              <Field label="Country" required>
                <select value={form.countryCode} onChange={(e) => set({ countryCode: e.target.value })} className={inputCls}>
                  <option value="">Select country</option>
                  {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Profile Slug" required hint={`URL: /${form.countryCode || ':country'}/expert/${form.profileLink || 'slug'}`}>
                <input
                  value={form.profileLink}
                  onChange={(e) => { userEditedSlugRef.current = true; set({ profileLink: slugify(e.target.value) }); }}
                  className={inputCls}
                  placeholder="auto-generated"
                />
              </Field>
              <Field label="Email" required>
                <input type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} className={inputCls} placeholder="contact@business.com" />
              </Field>
            </div>
          </SectionCard>

          {/* ── CONTACT & LOCATION ── */}
          <SectionCard id="contact" title="Contact & Location">
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <Field label="Phone">
                <input value={form.phone} onChange={(e) => set({ phone: e.target.value })} className={inputCls} placeholder="+880 1700 000000" />
              </Field>
              <Field label="WhatsApp">
                <input value={form.whatsapp} onChange={(e) => set({ whatsapp: e.target.value })} className={inputCls} placeholder="+880 1700 000000" />
              </Field>
              <Field label="Website">
                <input value={form.webAddress} onChange={(e) => set({ webAddress: e.target.value })} className={inputCls} placeholder="https://example.com" />
              </Field>
              <Field label="Office Address">
                <input value={form.officeAddress} onChange={(e) => set({ officeAddress: e.target.value })} className={inputCls} placeholder="123 Main St, City" />
              </Field>
            </div>
            <Field label="Map Location" hint="Click map to set precise coordinates">
              <MapPicker
                value={form.mapLat && form.mapLng ? { lat: parseFloat(form.mapLat), lng: parseFloat(form.mapLng) } : null}
                onChange={(latlng: LatLng) => {
                  set({ mapLat: String(latlng.lat), mapLng: String(latlng.lng), mapLocation: `${latlng.lat},${latlng.lng}` });
                }}
              />
              {form.mapLat && form.mapLng && (
                <p className="text-xs text-slate-400 mt-1">{parseFloat(form.mapLat).toFixed(6)}, {parseFloat(form.mapLng).toFixed(6)}</p>
              )}
            </Field>
          </SectionCard>

          {/* ── MEDIA ── */}
          <SectionCard id="media" title="Media">
            <div className="grid sm:grid-cols-2 gap-6">
              <Field label="Profile Picture">
                <UploadButton current={form.profilePicture} onUploaded={(url) => set({ profilePicture: url })} label="Upload photo" />
              </Field>
              <Field label="Cover Photo" hint="Displayed as banner behind profile. Recommended: 1200×400px">
                <UploadButton current={form.coverPhoto} onUploaded={(url) => set({ coverPhoto: url })} label="Upload cover" aspect="cover" />
              </Field>
            </div>
          </SectionCard>

          {/* ── BIO ── */}
          <SectionCard id="bio" title="Bio & Description">
            <div className="space-y-4">
              <Field label="Short Description" hint="Shown in listings and search results (max 200 chars)">
                <textarea
                  value={form.shortDesc} onChange={(e) => set({ shortDesc: e.target.value })}
                  rows={2} maxLength={200}
                  className={inputCls + " resize-none"}
                  placeholder="Brief one-liner about who you are and what you do"
                />
                <p className="text-xs text-slate-400 mt-1 text-right">{form.shortDesc.length}/200</p>
              </Field>
              <Field label="Full Bio">
                <textarea
                  value={form.bio} onChange={(e) => set({ bio: e.target.value })}
                  rows={6}
                  className={inputCls + " resize-y"}
                  placeholder="Tell clients about your experience, approach, achievements..."
                />
              </Field>
            </div>
          </SectionCard>

          {/* ── CATEGORIES ── */}
          <SectionCard id="categories" title="Categories">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Select up to 5 categories.</p>
            <CategoryTreePicker
              tree={categories}
              selectedIds={form.categoryIds}
              onChange={(ids) => set({ categoryIds: ids })}
              maxSelectable={5}
            />
            {!form.countryCode && (
              <p className="text-xs text-orange-500 mt-3">Select a country first to load categories.</p>
            )}
          </SectionCard>

          {/* ── SERVICES ── */}
          <SectionCard id="services" title="Services">
            <div className="space-y-4">
              {form.services.map((svc, i) => (
                <div key={i} className="rounded-xl border border-slate-100 dark:border-white/8 bg-slate-50 dark:bg-slate-900/40 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Service {i + 1}</span>
                    {form.services.length > 1 && (
                      <button onClick={() => setForm((f) => ({ ...f, services: f.services.filter((_, j) => j !== i) }))} className="text-red-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Service Name *</label>
                      <input value={svc.name} onChange={(e) => setService(i, { name: e.target.value })} className={inputCls} placeholder="e.g. Web Development" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Price</label>
                        <input type="number" value={svc.price} onChange={(e) => setService(i, { price: e.target.value })} className={inputCls} placeholder="500" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Unit</label>
                        <input value={svc.rateUnit} onChange={(e) => setService(i, { rateUnit: e.target.value })} className={inputCls} placeholder="/hr" />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs text-slate-400 mb-1 block">Description</label>
                      <textarea value={svc.description} onChange={(e) => setService(i, { description: e.target.value })} rows={2} className={inputCls + " resize-none"} placeholder="Brief description of this service..." />
                    </div>
                  </div>
                </div>
              ))}
              {form.services.length < 20 && (
                <button onClick={() => setForm((f) => ({ ...f, services: [...f.services, emptyService()] }))}
                  className="flex items-center gap-2 text-sm text-orange-500 hover:text-orange-400 font-semibold transition-colors">
                  <Plus className="w-4 h-4" /> Add Service
                </button>
              )}
            </div>
          </SectionCard>

          {/* ── PORTFOLIO ── */}
          <SectionCard id="portfolio" title="Portfolio">
            <div className="space-y-4">
              {form.portfolio.map((p, i) => (
                <div key={i} className="rounded-xl border border-slate-100 dark:border-white/8 bg-slate-50 dark:bg-slate-900/40 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Item {i + 1}</span>
                    {form.portfolio.length > 1 && (
                      <button onClick={() => setForm((f) => ({ ...f, portfolio: f.portfolio.filter((_, j) => j !== i) }))} className="text-red-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Title</label>
                      <input value={p.title} onChange={(e) => setPortfolio(i, { title: e.target.value })} className={inputCls} placeholder="Project name" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Image URL</label>
                      <div className="flex gap-2">
                        <input value={p.imageUrl} onChange={(e) => setPortfolio(i, { imageUrl: e.target.value })} className={inputCls} placeholder="https://..." />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Video URL</label>
                      <input value={p.videoUrl} onChange={(e) => setPortfolio(i, { videoUrl: e.target.value })} className={inputCls} placeholder="YouTube / Vimeo link" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Social / Case Study Link</label>
                      <input value={p.socialUrl} onChange={(e) => setPortfolio(i, { socialUrl: e.target.value })} className={inputCls} placeholder="https://..." />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs text-slate-400 mb-1 block">Description</label>
                      <textarea value={p.description} onChange={(e) => setPortfolio(i, { description: e.target.value })} rows={2} className={inputCls + " resize-none"} />
                    </div>
                  </div>
                </div>
              ))}
              {form.portfolio.length < 20 && (
                <button onClick={() => setForm((f) => ({ ...f, portfolio: [...f.portfolio, emptyPortfolio()] }))}
                  className="flex items-center gap-2 text-sm text-orange-500 hover:text-orange-400 font-semibold transition-colors">
                  <Plus className="w-4 h-4" /> Add Portfolio Item
                </button>
              )}
            </div>
          </SectionCard>

          {/* ── SOCIAL ── */}
          <SectionCard id="social" title="Social Links">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="LinkedIn">
                <input value={form.linkedinUrl} onChange={(e) => set({ linkedinUrl: e.target.value })} className={inputCls} placeholder="https://linkedin.com/in/..." />
              </Field>
              <Field label="Instagram">
                <input value={form.instagramUrl} onChange={(e) => set({ instagramUrl: e.target.value })} className={inputCls} placeholder="https://instagram.com/..." />
              </Field>
              <Field label="Twitter / X">
                <input value={form.twitterUrl} onChange={(e) => set({ twitterUrl: e.target.value })} className={inputCls} placeholder="https://twitter.com/..." />
              </Field>
              <Field label="Facebook">
                <input value={form.facebookUrl} onChange={(e) => set({ facebookUrl: e.target.value })} className={inputCls} placeholder="https://facebook.com/..." />
              </Field>
            </div>
          </SectionCard>

          {/* ── STATUS ── */}
          <SectionCard id="settings" title="Status & Settings">
            <div className="grid sm:grid-cols-2 gap-4">
              {([
                { key: "verified", label: "Verified", desc: "Show verified badge on profile" },
                { key: "featured", label: "Featured", desc: "Highlight in listing pages" },
                { key: "homeFeatured", label: "Home Featured", desc: "Show on global homepage" },
                { key: "mapFeatured", label: "Map Featured", desc: "Highlighted pin on maps" },
                { key: "foundingExpert", label: "Founding Expert", desc: "Gold badge + Hall of Fame" },
              ] as { key: keyof typeof form; label: string; desc: string }[]).map(({ key, label, desc }) => (
                <label key={String(key)} className="flex items-start gap-3 cursor-pointer select-none p-3 rounded-xl border border-slate-100 dark:border-white/8 hover:border-orange-200 dark:hover:border-orange-500/20 transition-colors">
                  <div className="mt-0.5">
                    <input
                      type="checkbox"
                      checked={!!form[key]}
                      onChange={(e) => set({ [key]: e.target.checked } as any)}
                      className="w-4 h-4 accent-orange-500"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{label}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </SectionCard>

          {/* ── DANGER ── */}
          <SectionCard id="danger" title="Danger Zone">
            <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-red-100 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5">
              <div>
                <p className="font-semibold text-red-700 dark:text-red-400 text-sm">Delete Expert</p>
                <p className="text-xs text-red-500/80 dark:text-red-500/70 mt-0.5">Permanently deletes profile, services, portfolio, and all associated data. Cannot be undone.</p>
              </div>
              <button
                onClick={deleteExpert}
                disabled={deleting}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors shrink-0"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </SectionCard>

          <div className="flex justify-end pt-4">
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-bold px-8 py-3 rounded-xl transition-colors shadow-sm shadow-orange-500/20"
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save All Changes</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
