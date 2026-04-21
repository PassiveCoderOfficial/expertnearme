import { prisma } from '@/lib/db';

export default async function BookingsPage() {
  try {
    const bookings = await prisma.booking.findMany({
      include: { expert: true, client: true },
      orderBy: { createdAt: 'desc' },
    });

    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Manage Bookings</h2>
        <table className="w-full border-collapse border border-gray-700">
          <thead>
            <tr className="bg-gray-800">
              <th className="border border-gray-700 px-4 py-2">Expert</th>
              <th className="border border-gray-700 px-4 py-2">Client</th>
              <th className="border border-gray-700 px-4 py-2">Status</th>
              <th className="border border-gray-700 px-4 py-2">Scheduled At</th>
              <th className="border border-gray-700 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-gray-700">
                <td className="border border-gray-700 px-4 py-2">{b.expert?.name || "—"}</td>
                <td className="border border-gray-700 px-4 py-2">{b.client?.email || b.clientId}</td>
                <td className="border border-gray-700 px-4 py-2">{b.status}</td>
                <td className="border border-gray-700 px-4 py-2">{new Date(b.scheduledAt).toLocaleString()}</td>
                <td className="border border-gray-700 px-4 py-2">
                  <form action={`/api/dashboard/bookings/${b.id}/status`} method="post" className="flex gap-2">
                    <input type="hidden" name="id" value={b.id} />
                    <button name="status" value="APPROVED" className="bg-green-600 text-white px-3 py-1 rounded">
                      Approve
                    </button>
                    <button name="status" value="DECLINED" className="bg-red-600 text-white px-3 py-1 rounded">
                      Decline
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-6 text-sm text-gray-400">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  } catch (e) {
    console.error("BookingsPage error:", e);
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Manage Bookings</h2>
        <p className="text-red-500">Failed to load bookings: {String(e)}</p>
      </div>
    );
  }
}

export const dynamic = 'force-dynamic';
