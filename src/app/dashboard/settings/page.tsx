import { prisma } from "@/lib/db";
import { MdSettings } from "react-icons/md";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let logoUrl: string | null = null;
  let faviconUrl: string | null = null;
  let err = "";

  try {
    const settings = await prisma.setting.findMany({
      where: { key: { in: ["logo", "favicon"] } },
      select: { key: true, value: true },
    });
    logoUrl = settings.find((s) => s.key === "logo")?.value || null;
    faviconUrl = settings.find((s) => s.key === "favicon")?.value || null;
  } catch (e) {
    err = String(e);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center text-orange-400 text-xl">
          <MdSettings />
        </div>
        <h1 className="text-xl font-bold text-white">Settings</h1>
      </div>

      {err && (
        <div className="bg-red-500/15 border border-red-500/25 text-red-300 text-sm rounded-xl px-4 py-3">{err}</div>
      )}

      {/* Site Branding */}
      <div className="rounded-2xl border border-white/8 bg-slate-800/50 p-6 space-y-6">
        <h2 className="text-base font-semibold text-white">Site Branding</h2>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-slate-400 mb-2">Logo</p>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-12 mb-3 rounded" />
            ) : (
              <p className="text-sm text-slate-500 mb-3">No logo uploaded — using default SVG logo.</p>
            )}
            <button disabled className="text-sm bg-slate-700/60 text-slate-400 border border-white/8 px-4 py-2 rounded-xl cursor-not-allowed">
              Upload Logo (coming soon)
            </button>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-400 mb-2">Favicon</p>
            {faviconUrl ? (
              <img src={faviconUrl} alt="Favicon" className="h-10 mb-3 rounded" />
            ) : (
              <p className="text-sm text-slate-500 mb-3">No favicon uploaded.</p>
            )}
            <button disabled className="text-sm bg-slate-700/60 text-slate-400 border border-white/8 px-4 py-2 rounded-xl cursor-not-allowed">
              Upload Favicon (coming soon)
            </button>
          </div>
        </div>
      </div>

      {/* Expert Settings */}
      <div className="rounded-2xl border border-white/8 bg-slate-800/50 p-6">
        <h2 className="text-base font-semibold text-white mb-2">Platform Settings</h2>
        <p className="text-sm text-slate-400">
          Advanced configuration options will be available here after launch.
        </p>
      </div>
    </div>
  );
}
