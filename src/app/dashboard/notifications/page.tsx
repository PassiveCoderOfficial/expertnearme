import { prisma } from "@/lib/db";

export default async function NotificationsPage() {
  try {
    // Fetch all push subscriptions without any relation includes
    const subs = await prisma.pushSubscription.findMany();

    return (
      <main className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Notifications</h1>

        {subs.length === 0 ? (
          <p className="text-gray-600">No push subscriptions found.</p>
        ) : (
          <ul className="space-y-4">
            {subs.map((sub) => (
              <li
                key={sub.id}
                className="border rounded p-4 bg-white shadow-sm"
              >
                <div className="text-sm text-gray-700">
                  <div>
                    <strong>ID:</strong> {sub.id}
                  </div>
                  <div>
                    <strong>Endpoint:</strong> {sub.endpoint}
                  </div>
                  {/* Add other fields from your PushSubscription model here */}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    );
  } catch (e) {
    console.error("NotificationsPage error:", e);
    return (
      <main className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Notifications</h1>
        <p className="text-red-500">Failed to load notifications: {String(e)}</p>
      </main>
    );
  }
}

export const dynamic = 'force-dynamic';
