// File: src/app/admin/notifications/page.tsx
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function NotificationsPage() {
  const subs = await prisma.pushSubscription.findMany({
    include: { expert: true },
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Push Notifications</h2>
      <table className="w-full border-collapse border border-gray-700">
        <thead>
          <tr className="bg-gray-800">
            <th className="border border-gray-700 px-4 py-2">Expert</th>
            <th className="border border-gray-700 px-4 py-2">Browser</th>
            <th className="border border-gray-700 px-4 py-2">Device</th>
            <th className="border border-gray-700 px-4 py-2">Endpoint</th>
          </tr>
        </thead>
        <tbody>
          {subs.map((s) => (
            <tr key={s.id} className="hover:bg-gray-700">
              <td className="border border-gray-700 px-4 py-2">{s.expert.name}</td>
              <td className="border border-gray-700 px-4 py-2">{s.browser || "-"}</td>
              <td className="border border-gray-700 px-4 py-2">{s.device || "-"}</td>
              <td className="border border-gray-700 px-4 py-2 truncate">{s.endpoint}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
