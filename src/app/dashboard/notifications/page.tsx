import { prisma } from "@/lib/db";
import { MdNotifications } from "react-icons/md";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  let subs: any[] = [];
  let err = "";

  try {
    subs = await prisma.pushSubscription.findMany();
  } catch (e) {
    err = String(e);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center text-orange-400 text-xl">
          <MdNotifications />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Notifications</h1>
          <p className="text-xs text-slate-400">Push subscriptions: {subs.length}</p>
        </div>
      </div>

      {err && (
        <div className="bg-red-500/15 border border-red-500/25 text-red-300 text-sm rounded-xl px-4 py-3">
          Failed to load: {err}
        </div>
      )}

      {subs.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-slate-800/40 p-10 text-center text-slate-500 text-sm">
          No push subscriptions registered yet.
        </div>
      ) : (
        <div className="space-y-3">
          {subs.map((sub) => (
            <div key={sub.id} className="rounded-xl border border-white/8 bg-slate-800/40 p-4 text-sm">
              <p className="text-xs text-slate-500 font-mono mb-1">ID: {sub.id}</p>
              <p className="text-slate-400 text-xs truncate">{sub.endpoint}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
