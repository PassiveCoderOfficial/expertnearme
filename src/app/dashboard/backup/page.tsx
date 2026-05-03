'use client';

import { useEffect, useState } from 'react';
import { Save, Play, Database, HardDrive, Code, RefreshCw, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

interface BackupConfig {
  backup_enabled: string;
  backup_hourly_keep: string;
  backup_daily_keep: string;
  backup_include_code: string;
  backup_include_db: string;
  backup_include_storage: string;
}

interface BackupStatus {
  backup_last_run: string | null;
  backup_last_status: string | null;
  backup_last_db_size: string | null;
  backup_last_storage_size: string | null;
  backup_last_code_size: string | null;
  backup_last_error: string | null;
}

export default function BackupPage() {
  const [config, setConfig] = useState<BackupConfig | null>(null);
  const [status, setStatus] = useState<BackupStatus | null>(null);
  const [saving, setSaving] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [saved, setSaved] = useState(false);
  const [triggerMsg, setTriggerMsg] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/backup/config').then(r => r.json()),
      fetch('/api/admin/backup/status').then(r => r.json()),
    ]).then(([cfg, st]) => {
      setConfig(cfg);
      setStatus(st);
    });
  }, []);

  async function saveConfig() {
    if (!config) return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/admin/backup/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const updated = await res.json();
      setConfig(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function triggerBackup(type: 'all' | 'code' | 'db' | 'storage') {
    setTriggering(true);
    setTriggerMsg('');
    try {
      const body = {
        run_code: type === 'all' || type === 'code',
        run_db: type === 'all' || type === 'db',
        run_storage: type === 'all' || type === 'storage',
      };
      const res = await fetch('/api/admin/backup/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setTriggerMsg(data.message || data.error || 'Done');
    } finally {
      setTriggering(false);
    }
  }

  async function refreshStatus() {
    const st = await fetch('/api/admin/backup/status').then(r => r.json());
    setStatus(st);
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
      </div>
    );
  }

  const totalBackups = parseInt(config.backup_hourly_keep) + parseInt(config.backup_daily_keep);
  const lastRunDate = status?.backup_last_run ? new Date(status.backup_last_run) : null;
  const isSuccess = status?.backup_last_status === 'success';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Backup System</h1>
          <p className="text-slate-400 text-sm mt-1">Configure automated backups to Google Drive + FTP</p>
        </div>
        <button
          onClick={saveConfig}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Config'}
        </button>
      </div>

      {/* Last Run Status */}
      <div className="rounded-2xl border border-white/8 bg-slate-800/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-400" /> Last Backup Status
          </h2>
          <button onClick={refreshStatus} className="text-slate-400 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        {lastRunDate ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {isSuccess
                ? <CheckCircle className="w-4 h-4 text-green-400" />
                : <XCircle className="w-4 h-4 text-red-400" />}
              <span className={`text-sm font-medium ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
                {status?.backup_last_status ?? 'unknown'}
              </span>
              <span className="text-slate-500 text-xs">{lastRunDate.toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3">
              {[
                { label: 'Code', icon: Code, size: status?.backup_last_code_size },
                { label: 'Database', icon: Database, size: status?.backup_last_db_size },
                { label: 'Storage', icon: HardDrive, size: status?.backup_last_storage_size },
              ].map(({ label, icon: Icon, size }) => (
                <div key={label} className="rounded-xl bg-slate-900/60 p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-xs text-slate-400">{label}</span>
                  </div>
                  <p className="text-sm font-mono text-white">{size ?? '—'}</p>
                </div>
              ))}
            </div>
            {status?.backup_last_error && (
              <p className="text-xs text-red-400 mt-2 font-mono bg-red-500/10 rounded-lg p-2">
                {status.backup_last_error}
              </p>
            )}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No backup has run yet.</p>
        )}
      </div>

      {/* Retention Config */}
      <div className="rounded-2xl border border-white/8 bg-slate-800/50 p-5 space-y-5">
        <h2 className="font-semibold text-white">Retention Policy</h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Enable Backups</p>
            <p className="text-xs text-slate-500">Workflow skips all jobs when disabled</p>
          </div>
          <button
            onClick={() => setConfig(c => c ? { ...c, backup_enabled: c.backup_enabled === 'true' ? 'false' : 'true' } : c)}
            className={`relative w-11 h-6 rounded-full transition-colors ${config.backup_enabled === 'true' ? 'bg-orange-500' : 'bg-slate-700'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${config.backup_enabled === 'true' ? 'translate-x-5' : ''}`} />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">
              Hourly backups to keep <span className="text-slate-500">(per day)</span>
            </label>
            <input
              type="number"
              min={1}
              max={24}
              value={config.backup_hourly_keep}
              onChange={e => setConfig(c => c ? { ...c, backup_hourly_keep: e.target.value } : c)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
            />
            <p className="text-xs text-slate-500 mt-1">Default: 4 — keeps last 4 snapshots each day</p>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">
              Days to retain
            </label>
            <input
              type="number"
              min={1}
              max={90}
              value={config.backup_daily_keep}
              onChange={e => setConfig(c => c ? { ...c, backup_daily_keep: e.target.value } : c)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
            />
            <p className="text-xs text-slate-500 mt-1">Default: 6 — keeps last 6 days of backups</p>
          </div>
        </div>

        <div className="rounded-xl bg-orange-500/10 border border-orange-500/20 px-4 py-3 text-sm text-orange-300">
          Total max backups per type: <strong>{totalBackups}</strong>
          {' '}({config.backup_hourly_keep} hourly × {config.backup_daily_keep} days)
        </div>

        <div>
          <p className="text-sm text-slate-300 mb-3">What to back up</p>
          <div className="space-y-2">
            {([
              { key: 'backup_include_code' as const, label: 'Code files', icon: Code, desc: 'Repo snapshot (excl. node_modules, .next)' },
              { key: 'backup_include_db' as const, label: 'Database', icon: Database, desc: 'PostgreSQL pg_dump compressed' },
              { key: 'backup_include_storage' as const, label: 'Storage assets', icon: HardDrive, desc: 'Supabase storage buckets' },
            ]).map(({ key, label, icon: Icon, desc }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={config[key] === 'true'}
                  onChange={e => setConfig(c => c ? { ...c, [key]: e.target.checked ? 'true' : 'false' } : c)}
                  className="w-4 h-4 rounded accent-orange-500"
                />
                <Icon className="w-4 h-4 text-slate-400 group-hover:text-orange-400 transition-colors" />
                <div>
                  <p className="text-sm text-white">{label}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Manual Trigger */}
      <div className="rounded-2xl border border-white/8 bg-slate-800/50 p-5">
        <h2 className="font-semibold text-white mb-4">Manual Trigger</h2>
        <div className="flex flex-wrap gap-3">
          {([
            { type: 'all' as const, label: 'Full Backup', icon: Play },
            { type: 'db' as const, label: 'Database Only', icon: Database },
            { type: 'storage' as const, label: 'Storage Only', icon: HardDrive },
            { type: 'code' as const, label: 'Code Only', icon: Code },
          ]).map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => triggerBackup(type)}
              disabled={triggering}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              {triggering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
              {label}
            </button>
          ))}
        </div>
        {triggerMsg && (
          <p className={`text-sm mt-3 ${triggerMsg.includes('error') || triggerMsg.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
            {triggerMsg}
          </p>
        )}
        <p className="text-xs text-slate-500 mt-3">
          Requires <code className="text-slate-400">GH_OWNER</code>, <code className="text-slate-400">GH_REPO</code>, <code className="text-slate-400">GH_PAT</code> env vars.
        </p>
      </div>
    </div>
  );
}
