'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Zap, RefreshCw, Loader2, TrendingUp, Send, Users, AlertTriangle,
  Mail, MessageSquare, Clock, Save, Check,
} from 'lucide-react';

type Channel = 'AUTO' | 'IN_APP' | 'EMAIL';

type Settings = {
  id: number;
  enabled: boolean;
  preferredChannel: Channel;
  emailFallback: boolean;
  fromName: string | null;
  replyToEmail: string | null;
  quietHoursStart: number | null;
  quietHoursEnd: number | null;
  timezone: string | null;
  maxMessagesPerLead: number;
} | null;

type Step = {
  id: number;
  stepOrder: number;
  delayHours: number;
  subject: string | null;
  body: string;
  active: boolean;
};

type Sequence = {
  id: number;
  name: string;
  description: string | null;
  trigger: string;
  active: boolean;
  isSystem: boolean;
  dormantAfterDays: number | null;
  steps: Step[];
};

type Stats = {
  activeEnrollments: number;
  messagesSent: number;
  leadsRecovered: number;
  recoveredValue: number;
  recoveredWithoutValue: number;
  unreachableLeads: number;
};

const TRIGGER_LABEL: Record<string, string> = {
  NEW_LEAD: 'New enquiry',
  DORMANT_LEAD: 'Gone quiet',
  REACTIVATION: 'Past customer',
  POST_BOOKING: 'After a job',
};

function formatDelay(hours: number): string {
  if (hours === 0) return 'immediately';
  if (hours < 24) return `after ${hours}h`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'after 1 day' : `after ${days} days`;
}

export default function FollowUpsPage() {
  const [settings, setSettings] = useState<Settings>(null);
  const [sequences, setSequences] = useState<{ own: Sequence[]; system: Sequence[] }>({
    own: [],
    system: [],
  });
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/me/follow-ups');
      const data = await res.json();
      if (res.ok) {
        setSettings(data.settings);
        setSequences(data.sequences || { own: [], system: [] });
        setStats(data.stats);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function patch(payload: Record<string, unknown>) {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/me/follow-ups', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setSettings(data.settings);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  const enabled = settings?.enabled ?? false;
  const activeSequences = sequences.own.length ? sequences.own : sequences.system;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-orange-500" />
            Follow-ups
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Chases enquiries that went quiet, and wakes up past customers.
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* ROI — the number that justifies the subscription */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="Recovered revenue"
          value={
            stats?.recoveredValue
              ? stats.recoveredValue.toLocaleString(undefined, { maximumFractionDigits: 0 })
              : '0'
          }
          tone="green"
          hint={
            stats?.recoveredWithoutValue
              ? `${stats.recoveredWithoutValue} recovered without a job value set`
              : undefined
          }
        />
        <StatCard
          icon={<Users className="w-4 h-4" />}
          label="Leads recovered"
          value={String(stats?.leadsRecovered ?? 0)}
          tone="orange"
          hint="Replied or booked after a follow-up"
        />
        <StatCard
          icon={<Send className="w-4 h-4" />}
          label="Messages sent"
          value={String(stats?.messagesSent ?? 0)}
          tone="blue"
        />
        <StatCard
          icon={<Clock className="w-4 h-4" />}
          label="In progress"
          value={String(stats?.activeEnrollments ?? 0)}
          tone="slate"
          hint="Leads mid-sequence"
        />
      </div>

      {stats && stats.unreachableLeads > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-200/90">
            <span className="font-semibold text-amber-400">
              {stats.unreachableLeads} lead{stats.unreachableLeads === 1 ? '' : 's'} could not be
              contacted.
            </span>{' '}
            They have no email address and no ExpertNear.Me account, so there was no way to reach
            them. Ask for an email on your enquiry form to recover these.
          </div>
        </div>
      )}

      {/* Master switch */}
      <div className="p-5 rounded-2xl bg-slate-800/50 border border-white/8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-white">
              {enabled ? 'Follow-ups are on' : 'Follow-ups are off'}
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-lg">
              {enabled
                ? 'Messages go out automatically and stop the moment someone replies.'
                : 'Nothing is sent on your behalf until you turn this on.'}
            </p>
          </div>
          <button
            onClick={() => patch({ enabled: !enabled })}
            disabled={saving}
            className={`relative shrink-0 w-14 h-8 rounded-full transition ${
              enabled ? 'bg-orange-500' : 'bg-slate-600'
            } disabled:opacity-50`}
            aria-label={enabled ? 'Turn follow-ups off' : 'Turn follow-ups on'}
          >
            <span
              className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${
                enabled ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="p-5 rounded-2xl bg-slate-800/50 border border-white/8 space-y-5">
        <h2 className="font-semibold text-white">Settings</h2>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            How to reach people
          </label>
          <div className="grid sm:grid-cols-3 gap-2">
            {(
              [
                ['AUTO', 'Automatic', 'Chat when they have an account, email otherwise'],
                ['IN_APP', 'Chat only', 'Never send email'],
                ['EMAIL', 'Email only', 'Never use chat'],
              ] as const
            ).map(([val, label, desc]) => (
              <button
                key={val}
                onClick={() => patch({ preferredChannel: val })}
                disabled={saving}
                className={`text-left p-3 rounded-xl border transition disabled:opacity-50 ${
                  settings?.preferredChannel === val
                    ? 'bg-orange-500/15 border-orange-500/50'
                    : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  {val === 'EMAIL' ? (
                    <Mail className="w-4 h-4" />
                  ) : (
                    <MessageSquare className="w-4 h-4" />
                  )}
                  {label}
                </div>
                <div className="text-xs text-slate-400 mt-1">{desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Send as">
            <input
              type="text"
              defaultValue={settings?.fromName ?? ''}
              placeholder="Your business name"
              onBlur={(e) => patch({ fromName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm placeholder:text-slate-500"
            />
          </Field>
          <Field label="Replies go to">
            <input
              type="email"
              defaultValue={settings?.replyToEmail ?? ''}
              placeholder="you@example.com"
              onBlur={(e) => patch({ replyToEmail: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm placeholder:text-slate-500"
            />
          </Field>
          <Field label="Most messages per lead" hint="Hard cap across all sequences">
            <input
              type="number"
              min={1}
              max={10}
              defaultValue={settings?.maxMessagesPerLead ?? 4}
              onBlur={(e) => patch({ maxMessagesPerLead: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm"
            />
          </Field>
          <Field label="Quiet hours" hint="No messages sent during these hours">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={23}
                defaultValue={settings?.quietHoursStart ?? 21}
                onBlur={(e) => patch({ quietHoursStart: Number(e.target.value) })}
                className="w-20 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm"
              />
              <span className="text-slate-500 text-sm">to</span>
              <input
                type="number"
                min={0}
                max={23}
                defaultValue={settings?.quietHoursEnd ?? 8}
                onBlur={(e) => patch({ quietHoursEnd: Number(e.target.value) })}
                className="w-20 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm"
              />
            </div>
          </Field>
        </div>

        {saving && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Loader2 className="w-3 h-3 animate-spin" /> Saving
          </div>
        )}
        {saved && (
          <div className="flex items-center gap-2 text-xs text-green-400">
            <Check className="w-3 h-3" /> Saved
          </div>
        )}
      </div>

      {/* Sequences */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white">Your sequences</h2>
          {!sequences.own.length && (
            <span className="text-xs text-slate-500">Using built-in defaults</span>
          )}
        </div>

        {activeSequences.map((seq) => (
          <div
            key={seq.id}
            className="p-5 rounded-2xl bg-slate-800/50 border border-white/8"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-white">{seq.name}</h3>
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                    {TRIGGER_LABEL[seq.trigger] || seq.trigger}
                  </span>
                  {seq.isSystem && (
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-blue-500/15 text-blue-400">
                      Built-in
                    </span>
                  )}
                </div>
                {seq.description && (
                  <p className="text-sm text-slate-400 mt-1 max-w-2xl">{seq.description}</p>
                )}
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-lg ${
                  seq.active
                    ? 'bg-green-500/15 text-green-400'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {seq.active ? 'Active' : 'Paused'}
              </span>
            </div>

            <ol className="mt-4 space-y-2">
              {seq.steps.map((step, i) => (
                <li
                  key={step.id}
                  className="flex gap-3 p-3 rounded-xl bg-slate-900/50 border border-white/5"
                >
                  <div className="shrink-0 w-6 h-6 rounded-full bg-orange-500/15 text-orange-400 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      {step.subject && (
                        <span className="text-sm font-medium text-white">{step.subject}</span>
                      )}
                      <span className="text-xs text-slate-500">
                        {formatDelay(step.delayHours)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 whitespace-pre-line">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ))}

        {!activeSequences.length && (
          <div className="p-8 rounded-2xl bg-slate-800/50 border border-white/8 text-center">
            <p className="text-sm text-slate-400">
              No sequences yet. Built-in defaults appear here once seeded.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: 'green' | 'orange' | 'blue' | 'slate';
  hint?: string;
}) {
  const tones = {
    green: 'text-green-400 bg-green-500/10',
    orange: 'text-orange-400 bg-orange-500/10',
    blue: 'text-blue-400 bg-blue-500/10',
    slate: 'text-slate-300 bg-slate-500/10',
  };
  return (
    <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/8">
      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${tones[tone]}`}>
        {icon}
      </div>
      <div className="mt-3 text-2xl font-bold text-white tabular-nums">{value}</div>
      <div className="text-xs text-slate-400 mt-0.5">{label}</div>
      {hint && <div className="text-[11px] text-slate-500 mt-1 leading-snug">{hint}</div>}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}
