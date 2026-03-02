import { prisma } from "@/lib/db";

export default async function ReviewsPage() {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        booking: true,
        expert: {
          select: {
            name: true,
          },
        },
        client: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Manage Reviews</h2>

        <form onSubmit={async (e) => {
          e.preventDefault();
          // Add review logic here
        }} className="mb-6 space-y-2">
          <input
            type="text"
            placeholder="Booking ID"
            value=""
            onChange={() => {}}
            className="border px-3 py-2 rounded w-full bg-gray-800 text-white"
          />
          <input
            type="text"
            placeholder="Expert ID"
            value=""
            onChange={() => {}}
            className="border px-3 py-2 rounded w-full bg-gray-800 text-white"
          />
          <input
            type="text"
            placeholder="Client ID"
            value=""
            onChange={() => {}}
            className="border px-3 py-2 rounded w-full bg-gray-800 text-white"
          />
          <label className="flex items-center gap-2">
            Rating:
            <select
              value="5"
              onChange={() => {}}
              className="ml-2 bg-gray-800 text-white px-2 py-1 rounded"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
            </select>
          </label>
          <textarea
            placeholder="Comment (optional)"
            value=""
            onChange={() => {}}
            className="border px-3 py-2 rounded w-full bg-gray-800 text-white"
          />

          <div className="space-y-1">
            <p className="text-red-400 text-sm">Admin interface - review creation disabled in static mode.</p>
            <button type="submit" disabled className="bg-[#b84c4c] text-white px-4 py-2 rounded">
              Add Review
            </button>
          </div>
        </form>

        <table className="w-full border-collapse border border-gray-700">
          <thead>
            <tr className="bg-gray-800">
              <th className="border px-4 py-2">Booking ID</th>
              <th className="border px-4 py-2">Expert ID</th>
              <th className="border px-4 py-2">Client ID</th>
              <th className="border px-4 py-2">Rating</th>
              <th className="border px-4 py-2">Comment</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id} className="hover:bg-gray-700">
                <td className="border px-4 py-2">{r.bookingId}</td>
                <td className="border px-4 py-2">{r.expertId}</td>
                <td className="border px-4 py-2">{r.clientId}</td>
                <td className="border px-4 py-2">{r.rating}</td>
                <td className="border px-4 py-2">{r.comment || "—"}</td>
                <td className="border px-4 py-2">
                  <button
                    onClick={async () => {
                      try {
                        await fetch(`/api/dashboard/reviews/${r.id}`, { method: "DELETE" });
                        // In static mode, page won't reload automatically
                        // Would need to refresh or use client-side state
                      } catch (err) {
                        console.error("Delete error:", err);
                      }
                    }}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-sm text-gray-400">
                  No reviews yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  } catch (e) {
    console.error("ReviewsPage error:", e);
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Manage Reviews</h2>
        <p className="text-red-500">Failed to load reviews: {String(e)}</p>
      </div>
    );
  }
}

export const dynamic = 'force-dynamic';
