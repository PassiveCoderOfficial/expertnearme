import { prisma } from "@/lib/db";
import { MdCalendarToday } from "react-icons/md";

export const dynamic = "force-dynamic";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  APPROVED: "bg-green-500/15 text-green-400 border-green-500/20",
  DECLINED: "bg-red-500/15 text-red-400 border-red-500/20",
  COMPLETED: "bg-blue-500/15 text-blue-400 border-blue-500/20",
};

export default async function BookingsPage() {
  let bookings: any[] = [];
  let err = "";

  try {
    bookings = await prisma.booking.findMany({
      include: { expert: true, client: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    err = String(e);
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center text-orange-400 text-xl">
          <MdCalendarToday />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Bookings</h1>
          <p className="text-xs text-slate-400">{bookings.length} total</p>
        </div>
      </div>

      {err && (
        <div className="bg-red-500/15 border border-red-500/25 text-red-300 text-sm rounded-xl px-4 py-3">
          Failed to load: {err}
        </div>
      )}

      <div className="rounded-2xl border border-white/8 bg-slate-800/40 overflow-hidden">
        {bookings.length === 0 ? (
          <div className="text-center py-14 text-slate-500 text-sm">No bookings yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 text-slate-500 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">Expert</th>
                <th className="text-left px-5 py-3 hidden sm:table-cell">Client</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">Scheduled</th>
                <th className="text-left px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3 text-white font-medium">{b.expert?.name || "—"}</td>
                  <td className="px-5 py-3 text-slate-400 hidden sm:table-cell">{b.client?.email || b.clientId}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColors[b.status] || "bg-slate-700 text-slate-400"}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-400 text-xs hidden md:table-cell">
                    {new Date(b.scheduledAt).toLocaleString()}
                  </td>
                  <td className="px-5 py-3">
                    <form action={`/api/dashboard/bookings/${b.id}/status`} method="post" className="flex gap-2">
                      <input type="hidden" name="id" value={b.id} />
                      <button name="status" value="APPROVED" className="text-xs bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/25 px-3 py-1 rounded-lg transition-colors">
                        Approve
                      </button>
                      <button name="status" value="DECLINED" className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/25 px-3 py-1 rounded-lg transition-colors">
                        Decline
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
