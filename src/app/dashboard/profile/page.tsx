'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Save, ExternalLink, Crown, Globe, Phone, MapPin,
  Image, Loader2, CheckCircle, AlertCircle, Building2, User, Upload,
  Plus, Trash2, Pencil, X, Linkedin, Instagram, Twitter, Facebook,
  GripVertical, Video, Link2,
} from 'lucide-react';
import MapPickerDark, { LatLng } from '@/components/MapPicker';

interface Category { id: number; name: string; icon: string | null; slug: string; }
interface PortfolioItem {
  id: number;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  socialUrl: string | null;
  sortOrder: number;
}
interface ServiceItem {
  id: number;
  name: string;
  description: string | null;
  rateUnit: string | null;
  price: number | null;
  image: string | null;
  sortOrder: number;
}
interface Expert {
  id: number;
  name: string;
  email: string;
  businessName: string | null;
  contactPerson: string | null;
  isBusiness: boolean;
  countryCode: string | null;
  phone: string | null;
  whatsapp: string | null;
  bio: string | null;
  shortDesc: string | null;
  webAddress: string | null;
  officeAddress: string | null;
  profilePicture: string | null;
  coverPhoto: string | null;
  mapLocation: string | null;
  profileLink: string | null;
  foundingExpert: boolean;
  linkedinUrl: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  facebookUrl: string | null;
  categories: { category: Category }[];
}

function UploadButton({
  label, field, currentUrl, onUploaded, aspect,
}: {
  label: string;
  field: string;
  currentUrl: string;
  onUploaded: (url: string) => void;
  aspect?: 'square' | 'wide';
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [err, setErr] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setErr('');
    if (file.size > 10 * 1024 * 1024) { setErr('Max 10 MB'); return; }
    if (!file.type.startsWith('image/')) { setErr('Images only'); return; }
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    setProgress(0);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = e => { if (e.lengthComputable) setProgress(Math.round(e.loaded / e.total * 100)); };
      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            if (data.url) { onUploaded(data.url); setPreview(null); resolve(); }
            else { setErr(data.error ?? 'Upload failed'); reject(); }
          } else {
            try { setErr(JSON.parse(xhr.responseText).error ?? 'Upload failed'); } catch { setErr('Upload failed'); }
            reject();
          }
        };
        xhr.onerror = () => { setErr('Upload failed'); reject(); };
        xhr.open('POST', '/api/media');
        xhr.send(fd);
      });
    } catch {
      // error already set
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const displayUrl = preview ?? currentUrl;

  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
      {displayUrl && (
        <div className={`relative mb-3 rounded-xl overflow-hidden border border-white/10 ${aspect === 'wide' ? 'w-full h-28' : 'w-20 h-20'}`}>
          <img src={displayUrl} alt="" className="w-full h-full object-cover" />
          {preview && (
            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
              <span className="text-xs text-orange-300 font-medium">Preview</span>
            </div>
          )}
        </div>
      )}
      {uploading && (
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-1">
            <Loader2 className="h-3.5 w-3.5 text-orange-400 animate-spin" />
            <span className="text-xs text-slate-400">Uploading… {progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 cursor-pointer bg-slate-700/60 hover:bg-slate-700 border border-white/10 hover:border-orange-500/30 px-3 py-2 rounded-xl text-sm text-slate-300 hover:text-white transition-colors disabled:opacity-50"
        >
          <Upload className="w-4 h-4" /> {currentUrl ? 'Replace' : 'Upload'}
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
        {currentUrl && !preview && (
          <button type="button" onClick={() => onUploaded('')} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors px-2">
            <X className="w-3.5 h-3.5" /> Remove
          </button>
        )}
      </div>
      {err && <p className="text-xs text-red-400 mt-1.5">{err}</p>}
    </div>
  );
}

export default function MyProfilePage() {
  const [expert, setExpert]         = useState<Expert | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [error, setError]           = useState('');

  const [portfolio, setPortfolio]   = useState<PortfolioItem[]>([]);
  const [services, setServices]     = useState<ServiceItem[]>([]);

  const [form, setForm] = useState({
    name:          '',
    isBusiness:    false,
    businessName:  '',
    contactPerson: '',
    phone:         '',
    whatsapp:      '',
    shortDesc:     '',
    bio:           '',
    webAddress:    '',
    officeAddress: '',
    profilePicture: '',
    coverPhoto:    '',
    mapLocation:   '',
    latitude:      null as number | null,
    longitude:     null as number | null,
    categoryIds:   [] as number[],
    linkedinUrl:   '',
    instagramUrl:  '',
    twitterUrl:    '',
    facebookUrl:   '',
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/me/expert').then(r => r.json()),
      fetch('/api/me/portfolio').then(r => r.json()).catch(() => ({ portfolio: [] })),
      fetch('/api/me/services').then(r => r.json()).catch(() => ({ services: [] })),
    ]).then(([expertData, portfolioData, servicesData]) => {
      if (expertData.expert) {
        const e: Expert = expertData.expert;
        setExpert(e);
        setForm({
          name:          e.name          ?? '',
          isBusiness:    e.isBusiness    ?? false,
          businessName:  e.businessName  ?? '',
          contactPerson: e.contactPerson ?? '',
          phone:         e.phone         ?? '',
          whatsapp:      e.whatsapp      ?? '',
          shortDesc:     e.shortDesc     ?? '',
          bio:           e.bio           ?? '',
          webAddress:    e.webAddress    ?? '',
          officeAddress: e.officeAddress ?? '',
          profilePicture: e.profilePicture ?? '',
          coverPhoto:    e.coverPhoto    ?? '',
          mapLocation:   e.mapLocation   ?? '',
          latitude:      (e as unknown as { latitude?: number | null }).latitude ?? null,
          longitude:     (e as unknown as { longitude?: number | null }).longitude ?? null,
          categoryIds:   e.categories.map(c => c.category.id),
          linkedinUrl:   e.linkedinUrl   ?? '',
          instagramUrl:  e.instagramUrl  ?? '',
          twitterUrl:    e.twitterUrl    ?? '',
          facebookUrl:   e.facebookUrl   ?? '',
        });
        if (e.countryCode) {
          fetch(`/api/country/${e.countryCode}/categories`)
            .then(r => r.json())
            .then(d => setCategories(d.categories ?? []))
            .catch(() => {});
        }
      }
      setPortfolio(portfolioData.portfolio ?? []);
      setServices(servicesData.services ?? []);
    })
    .catch(() => setError('Failed to load your profile.'))
    .finally(() => setLoading(false));
  }, []);

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const toggleCategory = (id: number) => {
    setForm(f => {
      const ids = f.categoryIds.includes(id)
        ? f.categoryIds.filter(x => x !== id)
        : f.categoryIds.length < 5 ? [...f.categoryIds, id] : f.categoryIds;
      return { ...f, categoryIds: ids };
    });
  };

  const save = async () => {
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const res = await fetch('/api/me/expert', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Save failed.'); return; }
      setExpert(prev => prev ? { ...prev, ...data.expert } : prev);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  // Portfolio CRUD
  const [newPortfolio, setNewPortfolio] = useState({ title: '', description: '', imageUrl: '', videoUrl: '' });
  const [addingPortfolio, setAddingPortfolio] = useState(false);
  const [portfolioSaving, setPortfolioSaving] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<number | null>(null);
  const [editPortfolioForm, setEditPortfolioForm] = useState({ title: '', description: '', imageUrl: '', videoUrl: '' });
  const [portfolioUploadProgress, setPortfolioUploadProgress] = useState<Record<number | string, number>>({});

  const uploadPortfolioImage = async (file: File, key: number | 'new'): Promise<string | null> => {
    if (file.size > 10 * 1024 * 1024) return null;
    if (!file.type.startsWith('image/')) return null;
    const fd = new FormData();
    fd.append('file', file);
    return new Promise(resolve => {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = e => { if (e.lengthComputable) setPortfolioUploadProgress(p => ({ ...p, [key]: Math.round(e.loaded / e.total * 100) })); };
      xhr.onload = () => {
        setPortfolioUploadProgress(p => { const n = { ...p }; delete n[key]; return n; });
        if (xhr.status >= 200 && xhr.status < 300) {
          try { resolve(JSON.parse(xhr.responseText).url ?? null); } catch { resolve(null); }
        } else { resolve(null); }
      };
      xhr.onerror = () => resolve(null);
      xhr.open('POST', '/api/media');
      xhr.send(fd);
    });
  };

  const addPortfolioItem = async () => {
    if (!newPortfolio.imageUrl && !newPortfolio.videoUrl && !newPortfolio.title) return;
    setPortfolioSaving(true);
    const res = await fetch('/api/me/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPortfolio),
    });
    const data = await res.json();
    if (data.item) {
      setPortfolio(p => [...p, data.item]);
      setNewPortfolio({ title: '', description: '', imageUrl: '', videoUrl: '' });
      setAddingPortfolio(false);
    }
    setPortfolioSaving(false);
  };

  const deletePortfolioItem = async (id: number) => {
    await fetch(`/api/me/portfolio?id=${id}`, { method: 'DELETE' });
    setPortfolio(p => p.filter(x => x.id !== id));
  };

  const saveEditPortfolio = async (id: number) => {
    const res = await fetch('/api/me/portfolio', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...editPortfolioForm }),
    });
    const data = await res.json();
    if (data.item) {
      setPortfolio(p => p.map(x => x.id === id ? data.item : x));
      setEditingPortfolio(null);
    }
  };

  // Services CRUD
  const [newService, setNewService] = useState({ name: '', description: '', rateUnit: '', price: '' });
  const [addingService, setAddingService] = useState(false);
  const [serviceSaving, setServiceSaving] = useState(false);
  const [editingService, setEditingService] = useState<number | null>(null);
  const [editServiceForm, setEditServiceForm] = useState({ name: '', description: '', rateUnit: '', price: '' });

  const addService = async () => {
    if (!newService.name.trim()) return;
    setServiceSaving(true);
    const res = await fetch('/api/me/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newService, price: newService.price ? Number(newService.price) : null }),
    });
    const data = await res.json();
    if (data.service) {
      setServices(s => [...s, data.service]);
      setNewService({ name: '', description: '', rateUnit: '', price: '' });
      setAddingService(false);
    }
    setServiceSaving(false);
  };

  const deleteService = async (id: number) => {
    await fetch(`/api/me/services?id=${id}`, { method: 'DELETE' });
    setServices(s => s.filter(x => x.id !== id));
  };

  const saveEditService = async (id: number) => {
    const res = await fetch('/api/me/services', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...editServiceForm, price: editServiceForm.price ? Number(editServiceForm.price) : null }),
    });
    const data = await res.json();
    if (data.service) {
      setServices(s => s.map(x => x.id === id ? data.service : x));
      setEditingService(null);
    }
  };

  const inputCls   = 'w-full bg-slate-800 border border-white/10 focus:border-orange-500/50 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 outline-none transition-colors text-sm';
  const labelCls   = 'block text-sm font-medium text-slate-300 mb-1';
  const sectionCls = 'bg-slate-800/50 border border-white/8 rounded-2xl p-6 mb-5';

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
    </div>
  );

  if (!expert) return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-slate-800/50 border border-white/8 rounded-2xl p-8 text-center">
        <AlertCircle className="h-10 w-10 text-orange-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2 text-white">No expert profile found</h2>
        <p className="text-slate-400 mb-6 text-sm">Your account doesn&apos;t have an expert profile yet.</p>
        <Link href="/create-expert-account" className="bg-orange-500 hover:bg-orange-400 text-slate-900 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
          Create Expert Profile
        </Link>
      </div>
    </div>
  );

  const profileUrl = expert.countryCode && expert.profileLink
    ? `/${expert.countryCode}/expert/${expert.profileLink}`
    : null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
          <p className="text-sm text-slate-400 mt-0.5">Changes save immediately and update your public profile.</p>
        </div>
        <div className="flex items-center gap-3">
          {profileUrl && (
            <Link href={profileUrl} target="_blank"
              className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white border border-white/10 px-3 py-2 rounded-xl hover:border-white/20 transition-colors">
              <ExternalLink className="h-4 w-4" /> View Profile
            </Link>
          )}
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-slate-900 font-bold px-4 py-2 rounded-xl text-sm transition-colors">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-green-500/15 border border-green-500/25 text-green-300 text-sm px-4 py-3 rounded-xl mb-5">
          <CheckCircle className="h-4 w-4" /> Profile saved successfully.
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-red-500/15 border border-red-500/25 text-red-300 text-sm px-4 py-3 rounded-xl mb-5">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* Founding Expert badge */}
      {expert.foundingExpert && (
        <div className="flex items-center gap-3 bg-gradient-to-r from-orange-500/15 to-amber-500/10 border border-orange-500/25 rounded-2xl px-5 py-4 mb-5">
          <Crown className="h-5 w-5 text-amber-400 shrink-0" />
          <div>
            <p className="font-semibold text-amber-300 text-sm">Founding Expert</p>
            <p className="text-xs text-slate-400 mt-0.5">You&apos;re permanently listed on the <Link href="/founding-experts" className="text-orange-400 hover:underline">Founding Experts</Link> page.</p>
          </div>
        </div>
      )}

      {/* Basic info */}
      <div className={sectionCls}>
        <h2 className="font-semibold text-white mb-4">Basic Information</h2>
        <div className="space-y-4">
          <div className="flex gap-3">
            <button onClick={() => set('isBusiness', false)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium border transition-colors ${!form.isBusiness ? 'border-orange-500 bg-orange-500/15 text-orange-300' : 'border-white/10 text-slate-400 hover:border-white/20'}`}>
              <User className="h-4 w-4" /> Individual
            </button>
            <button onClick={() => set('isBusiness', true)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium border transition-colors ${form.isBusiness ? 'border-orange-500 bg-orange-500/15 text-orange-300' : 'border-white/10 text-slate-400 hover:border-white/20'}`}>
              <Building2 className="h-4 w-4" /> Business
            </button>
          </div>
          <div>
            <label className={labelCls}>Full name</label>
            <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          {form.isBusiness && (
            <>
              <div>
                <label className={labelCls}>Business name</label>
                <input className={inputCls} placeholder="Karim Interiors LLC" value={form.businessName} onChange={e => set('businessName', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Contact person</label>
                <input className={inputCls} placeholder="Ahmad Karim" value={form.contactPerson} onChange={e => set('contactPerson', e.target.value)} />
              </div>
            </>
          )}
          <div>
            <label className={labelCls}>Email</label>
            <input className={inputCls + ' opacity-60 cursor-not-allowed'} value={expert.email} readOnly />
            <p className="text-xs text-slate-500 mt-1">Email cannot be changed.</p>
          </div>
          <div>
            <label className={labelCls}>Country</label>
            <input className={inputCls + ' opacity-60 cursor-not-allowed'} value={expert.countryCode?.toUpperCase() ?? ''} readOnly />
            <p className="text-xs text-slate-500 mt-1">Contact support to change country.</p>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className={sectionCls}>
        <h2 className="font-semibold text-white mb-4"><Phone className="inline h-4 w-4 mr-1.5 text-slate-500" />Contact</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Phone</label>
            <input className={inputCls} placeholder="+65 9123 4567" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>WhatsApp</label>
            <input className={inputCls} placeholder="+65 9123 4567" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} />
          </div>
        </div>
        <div className="mt-4">
          <label className={labelCls}><Globe className="inline h-3.5 w-3.5 mr-1" />Website</label>
          <input className={inputCls} placeholder="https://yourwebsite.com" value={form.webAddress} onChange={e => set('webAddress', e.target.value)} />
        </div>
        <div className="mt-4">
          <label className={labelCls}><MapPin className="inline h-3.5 w-3.5 mr-1" />Office address</label>
          <input className={inputCls} placeholder="123 Main St, Singapore" value={form.officeAddress} onChange={e => set('officeAddress', e.target.value)} />
        </div>
      </div>

      {/* Social links */}
      <div className={sectionCls}>
        <h2 className="font-semibold text-white mb-4"><Link2 className="inline h-4 w-4 mr-1.5 text-slate-500" />Social Links</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Linkedin className="h-4 w-4 text-blue-400 shrink-0" />
            <input className={inputCls} placeholder="https://linkedin.com/in/yourprofile" value={form.linkedinUrl} onChange={e => set('linkedinUrl', e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Instagram className="h-4 w-4 text-pink-400 shrink-0" />
            <input className={inputCls} placeholder="https://instagram.com/yourhandle" value={form.instagramUrl} onChange={e => set('instagramUrl', e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Twitter className="h-4 w-4 text-sky-400 shrink-0" />
            <input className={inputCls} placeholder="https://twitter.com/yourhandle" value={form.twitterUrl} onChange={e => set('twitterUrl', e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Facebook className="h-4 w-4 text-blue-500 shrink-0" />
            <input className={inputCls} placeholder="https://facebook.com/yourpage" value={form.facebookUrl} onChange={e => set('facebookUrl', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Profile content */}
      <div className={sectionCls}>
        <h2 className="font-semibold text-white mb-4">Profile Content</h2>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Short description <span className="text-slate-500">({form.shortDesc.length}/160)</span></label>
            <textarea className={inputCls} rows={2} maxLength={160} placeholder="One or two sentences about what you do." value={form.shortDesc} onChange={e => set('shortDesc', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Full bio</label>
            <textarea className={inputCls} rows={5} placeholder="Your background, experience, specialisations..." value={form.bio} onChange={e => set('bio', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Media */}
      <div className={sectionCls}>
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><Image className="h-4 w-4 text-slate-400" />Media</h2>
        <div className="space-y-6">
          <UploadButton
            label="Profile Picture"
            field="profilePicture"
            currentUrl={form.profilePicture}
            onUploaded={url => set('profilePicture', url)}
            aspect="square"
          />
          <UploadButton
            label="Cover Photo"
            field="coverPhoto"
            currentUrl={form.coverPhoto}
            onUploaded={url => set('coverPhoto', url)}
            aspect="wide"
          />
          <div>
            <MapPickerDark
              label="Location on map"
              value={form.latitude && form.longitude ? { lat: form.latitude, lng: form.longitude } : null}
              onChange={(coords: LatLng, address?: string) => {
                set('latitude', coords.lat);
                set('longitude', coords.lng);
                if (address) set('mapLocation', address);
              }}
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className={sectionCls}>
          <h2 className="font-semibold text-white mb-1">Categories</h2>
          <p className="text-xs text-slate-400 mb-4">Pick up to 5 that describe your work. {form.categoryIds.length}/5 selected.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categories.map(cat => {
              const sel = form.categoryIds.includes(cat.id);
              return (
                <button key={cat.id} onClick={() => toggleCategory(cat.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-colors text-left ${sel ? 'border-orange-500 bg-orange-500/15 text-orange-300' : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300'}`}>
                  <span>{cat.icon ?? '📌'}</span>
                  <span className="text-xs font-medium truncate">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Services */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-white">Services</h2>
            <p className="text-xs text-slate-400 mt-0.5">What you offer to clients</p>
          </div>
          {!addingService && (
            <button onClick={() => setAddingService(true)}
              className="flex items-center gap-1.5 text-sm bg-orange-500/15 border border-orange-500/30 text-orange-300 hover:bg-orange-500/25 px-3 py-1.5 rounded-xl transition-colors">
              <Plus className="h-4 w-4" /> Add Service
            </button>
          )}
        </div>

        {services.length > 0 && (
          <div className="space-y-3 mb-4">
            {services.map(svc => (
              <div key={svc.id} className="bg-slate-900/50 border border-white/8 rounded-xl p-4">
                {editingService === svc.id ? (
                  <div className="space-y-3">
                    <input className={inputCls} placeholder="Service name *" value={editServiceForm.name} onChange={e => setEditServiceForm(f => ({ ...f, name: e.target.value }))} />
                    <textarea className={inputCls} rows={2} placeholder="Description (optional)" value={editServiceForm.description} onChange={e => setEditServiceForm(f => ({ ...f, description: e.target.value }))} />
                    <div className="grid grid-cols-2 gap-2">
                      <input className={inputCls} placeholder="Price (e.g. 150)" type="number" min="0" value={editServiceForm.price} onChange={e => setEditServiceForm(f => ({ ...f, price: e.target.value }))} />
                      <input className={inputCls} placeholder="Unit (e.g. /hr, /project)" value={editServiceForm.rateUnit} onChange={e => setEditServiceForm(f => ({ ...f, rateUnit: e.target.value }))} />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => saveEditService(svc.id)} className="flex-1 bg-orange-500 hover:bg-orange-400 text-slate-900 font-semibold py-2 rounded-xl text-sm transition-colors">Save</button>
                      <button onClick={() => setEditingService(null)} className="px-4 py-2 border border-white/10 rounded-xl text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <GripVertical className="h-4 w-4 text-slate-600 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm">{svc.name}</p>
                      {svc.description && <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{svc.description}</p>}
                      {(svc.price != null || svc.rateUnit) && (
                        <p className="text-orange-400 text-xs font-semibold mt-1">
                          {svc.price != null ? `$${svc.price}` : ''}{svc.rateUnit ? ` ${svc.rateUnit}` : ''}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => { setEditingService(svc.id); setEditServiceForm({ name: svc.name, description: svc.description ?? '', rateUnit: svc.rateUnit ?? '', price: svc.price?.toString() ?? '' }); }}
                        className="p-1.5 text-slate-500 hover:text-orange-400 transition-colors rounded-lg hover:bg-orange-500/10">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => deleteService(svc.id)} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {addingService && (
          <div className="bg-slate-900/50 border border-orange-500/20 rounded-xl p-4 space-y-3">
            <input className={inputCls} placeholder="Service name *" value={newService.name} onChange={e => setNewService(f => ({ ...f, name: e.target.value }))} autoFocus />
            <textarea className={inputCls} rows={2} placeholder="Description (optional)" value={newService.description} onChange={e => setNewService(f => ({ ...f, description: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <input className={inputCls} placeholder="Price (e.g. 150)" type="number" min="0" value={newService.price} onChange={e => setNewService(f => ({ ...f, price: e.target.value }))} />
              <input className={inputCls} placeholder="Unit (e.g. /hr, /project)" value={newService.rateUnit} onChange={e => setNewService(f => ({ ...f, rateUnit: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <button onClick={addService} disabled={serviceSaving || !newService.name.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-slate-900 font-semibold py-2 rounded-xl text-sm transition-colors">
                {serviceSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add Service
              </button>
              <button onClick={() => { setAddingService(false); setNewService({ name: '', description: '', rateUnit: '', price: '' }); }}
                className="px-4 py-2 border border-white/10 rounded-xl text-sm text-slate-400 hover:text-white transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {services.length === 0 && !addingService && (
          <p className="text-sm text-slate-500 text-center py-4">No services yet. Add what you offer to attract clients.</p>
        )}
      </div>

      {/* Portfolio */}
      <div className={sectionCls}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-white">Portfolio</h2>
            <p className="text-xs text-slate-400 mt-0.5">Showcase your best work ({portfolio.length}/20)</p>
          </div>
          {!addingPortfolio && portfolio.length < 20 && (
            <button onClick={() => setAddingPortfolio(true)}
              className="flex items-center gap-1.5 text-sm bg-orange-500/15 border border-orange-500/30 text-orange-300 hover:bg-orange-500/25 px-3 py-1.5 rounded-xl transition-colors">
              <Plus className="h-4 w-4" /> Add Item
            </button>
          )}
        </div>

        {portfolio.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {portfolio.map(item => (
              <div key={item.id} className="bg-slate-900/50 border border-white/8 rounded-xl overflow-hidden group">
                {editingPortfolio === item.id ? (
                  <div className="p-3 space-y-2">
                    <input className={inputCls} placeholder="Title (optional)" value={editPortfolioForm.title} onChange={e => setEditPortfolioForm(f => ({ ...f, title: e.target.value }))} />
                    <textarea className={inputCls} rows={2} placeholder="Description (optional)" value={editPortfolioForm.description} onChange={e => setEditPortfolioForm(f => ({ ...f, description: e.target.value }))} />
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Image URL</label>
                      <div className="flex gap-2">
                        <input className={inputCls} placeholder="https://…" value={editPortfolioForm.imageUrl} onChange={e => setEditPortfolioForm(f => ({ ...f, imageUrl: e.target.value }))} />
                        <label className="flex items-center gap-1 cursor-pointer bg-slate-700 hover:bg-slate-600 px-2 rounded-xl text-xs text-slate-300 shrink-0">
                          <Upload className="w-3 h-3" />
                          <input type="file" accept="image/*" className="hidden" onChange={async e => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const url = await uploadPortfolioImage(f, item.id);
                            if (url) setEditPortfolioForm(prev => ({ ...prev, imageUrl: url }));
                            e.target.value = '';
                          }} />
                        </label>
                      </div>
                      {portfolioUploadProgress[item.id] != null && (
                        <div className="mt-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500 transition-all" style={{ width: `${portfolioUploadProgress[item.id]}%` }} />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Video URL (YouTube/Vimeo)</label>
                      <input className={inputCls} placeholder="https://youtube.com/…" value={editPortfolioForm.videoUrl} onChange={e => setEditPortfolioForm(f => ({ ...f, videoUrl: e.target.value }))} />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => saveEditPortfolio(item.id)} className="flex-1 bg-orange-500 hover:bg-orange-400 text-slate-900 font-semibold py-1.5 rounded-xl text-xs transition-colors">Save</button>
                      <button onClick={() => setEditingPortfolio(null)} className="px-3 py-1.5 border border-white/10 rounded-xl text-xs text-slate-400 hover:text-white transition-colors">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    {item.imageUrl ? (
                      <div className="aspect-video">
                        <img src={item.imageUrl} alt={item.title ?? 'Portfolio'} className="w-full h-full object-cover" />
                      </div>
                    ) : item.videoUrl ? (
                      <div className="aspect-video bg-slate-800 flex items-center justify-center">
                        <Video className="h-8 w-8 text-slate-500" />
                      </div>
                    ) : (
                      <div className="aspect-video bg-slate-800 flex items-center justify-center">
                        <Image className="h-8 w-8 text-slate-600" />
                      </div>
                    )}
                    <div className="p-2.5">
                      {item.title && <p className="text-xs font-medium text-white truncate">{item.title}</p>}
                      {item.description && <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{item.description}</p>}
                      <div className="flex gap-1.5 mt-2">
                        <button onClick={() => { setEditingPortfolio(item.id); setEditPortfolioForm({ title: item.title ?? '', description: item.description ?? '', imageUrl: item.imageUrl ?? '', videoUrl: item.videoUrl ?? '' }); }}
                          className="flex-1 flex items-center justify-center gap-1 py-1 text-xs text-slate-400 hover:text-orange-400 border border-white/8 hover:border-orange-500/30 rounded-lg transition-colors">
                          <Pencil className="h-3 w-3" /> Edit
                        </button>
                        <button onClick={() => deletePortfolioItem(item.id)}
                          className="flex items-center justify-center gap-1 px-2 py-1 text-xs text-slate-500 hover:text-red-400 border border-white/8 hover:border-red-500/20 rounded-lg transition-colors">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {addingPortfolio && (
          <div className="bg-slate-900/50 border border-orange-500/20 rounded-xl p-4 space-y-3">
            <input className={inputCls} placeholder="Title (optional)" value={newPortfolio.title} onChange={e => setNewPortfolio(f => ({ ...f, title: e.target.value }))} autoFocus />
            <textarea className={inputCls} rows={2} placeholder="Description (optional)" value={newPortfolio.description} onChange={e => setNewPortfolio(f => ({ ...f, description: e.target.value }))} />
            <div>
              <label className="block text-xs text-slate-400 mb-1">Image</label>
              <div className="flex gap-2">
                <input className={inputCls} placeholder="Paste URL or upload →" value={newPortfolio.imageUrl} onChange={e => setNewPortfolio(f => ({ ...f, imageUrl: e.target.value }))} />
                <label className="flex items-center gap-1 cursor-pointer bg-slate-700 hover:bg-slate-600 px-3 rounded-xl text-xs text-slate-300 shrink-0">
                  <Upload className="w-3.5 h-3.5" /> Upload
                  <input type="file" accept="image/*" className="hidden" onChange={async e => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const url = await uploadPortfolioImage(f, 'new');
                    if (url) setNewPortfolio(prev => ({ ...prev, imageUrl: url }));
                    e.target.value = '';
                  }} />
                </label>
              </div>
              {portfolioUploadProgress['new'] != null && (
                <div className="mt-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 transition-all" style={{ width: `${portfolioUploadProgress['new']}%` }} />
                </div>
              )}
              {newPortfolio.imageUrl && (
                <img src={newPortfolio.imageUrl} alt="preview" className="mt-2 w-full h-24 object-cover rounded-lg border border-white/10" />
              )}
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Video URL (YouTube / Vimeo)</label>
              <input className={inputCls} placeholder="https://youtube.com/watch?v=…" value={newPortfolio.videoUrl} onChange={e => setNewPortfolio(f => ({ ...f, videoUrl: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <button onClick={addPortfolioItem} disabled={portfolioSaving || (!newPortfolio.imageUrl && !newPortfolio.videoUrl && !newPortfolio.title)}
                className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-slate-900 font-semibold py-2 rounded-xl text-sm transition-colors">
                {portfolioSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add to Portfolio
              </button>
              <button onClick={() => { setAddingPortfolio(false); setNewPortfolio({ title: '', description: '', imageUrl: '', videoUrl: '' }); }}
                className="px-4 py-2 border border-white/10 rounded-xl text-sm text-slate-400 hover:text-white transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {portfolio.length === 0 && !addingPortfolio && (
          <p className="text-sm text-slate-500 text-center py-4">No portfolio items yet. Add images or videos to showcase your work.</p>
        )}
      </div>

      {/* Save footer */}
      <div className="flex justify-end pb-10">
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-slate-900 font-bold px-6 py-3 rounded-xl text-sm transition-colors">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
