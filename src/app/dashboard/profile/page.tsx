'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Save, ExternalLink, Crown, Globe, Phone, MapPin,
  Image, Loader2, CheckCircle, AlertCircle, Building2, User, Upload,
} from 'lucide-react';
import MapPickerDark, { LatLng } from '@/components/MapPicker';

interface Category { id: number; name: string; icon: string | null; slug: string; }
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
  categories: { category: Category }[];
}

export default function MyProfilePage() {
  const [expert, setExpert]       = useState<Expert | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [error, setError]         = useState('');

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
  });

  useEffect(() => {
    fetch('/api/me/expert')
      .then(r => r.json())
      .then(d => {
        if (d.expert) {
          const e: Expert = d.expert;
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
          });
          if (e.countryCode) {
            fetch(`/api/country/${e.countryCode}/categories`)
              .then(r => r.json())
              .then(d2 => setCategories(d2.categories ?? []))
              .catch(() => {});
          }
        }
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

  const inputCls  = 'w-full bg-slate-800 border border-white/10 focus:border-orange-500/50 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 outline-none transition-colors text-sm';
  const labelCls  = 'block text-sm font-medium text-slate-300 mb-1';
  const sectionCls = 'bg-slate-800/50 border border-white/8 rounded-2xl p-6 mb-5';

  const uploadImage = async (file: File, field: 'profilePicture' | 'coverPhoto') => {
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/media', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) set(field, data.url);
    } catch { /* ignore */ }
  };

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
            <textarea className={inputCls} rows={4} placeholder="Your background, experience, specialisations..." value={form.bio} onChange={e => set('bio', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Media */}
      <div className={sectionCls}>
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><Image className="h-4 w-4 text-slate-400" />Media</h2>
        <div className="space-y-5">
          {/* Profile picture */}
          <div>
            <label className={labelCls}>Profile Picture</label>
            <div className="flex items-center gap-3">
              {form.profilePicture
                ? <img src={form.profilePicture} alt="profile" className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0" />
                : <div className="w-14 h-14 rounded-xl bg-slate-700 border border-white/10 flex items-center justify-center shrink-0"><User className="w-6 h-6 text-slate-500" /></div>
              }
              <div className="flex-1 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-700/60 hover:bg-slate-700 border border-white/10 hover:border-orange-500/30 px-3 py-2 rounded-xl text-sm text-slate-300 hover:text-white transition-colors w-fit">
                  <Upload className="w-4 h-4" /> Upload photo
                  <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, 'profilePicture'); }} />
                </label>
                <input className={inputCls} placeholder="or paste image URL" value={form.profilePicture} onChange={e => set('profilePicture', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Cover photo */}
          <div>
            <label className={labelCls}>Cover Photo</label>
            {form.coverPhoto && (
              <img src={form.coverPhoto} alt="cover" className="w-full h-24 object-cover rounded-xl border border-white/10 mb-2" />
            )}
            <div className="flex gap-2">
              <label className="flex items-center gap-2 cursor-pointer bg-slate-700/60 hover:bg-slate-700 border border-white/10 hover:border-orange-500/30 px-3 py-2 rounded-xl text-sm text-slate-300 hover:text-white transition-colors shrink-0">
                <Upload className="w-4 h-4" /> Upload cover
                <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, 'coverPhoto'); }} />
              </label>
              <input className={inputCls} placeholder="or paste cover URL" value={form.coverPhoto} onChange={e => set('coverPhoto', e.target.value)} />
            </div>
          </div>

          {/* Map */}
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
