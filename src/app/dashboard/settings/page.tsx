import { prisma } from "@/lib/db";

export default async function SettingsPage() {
  try {
    const settings = await prisma.setting.findMany({
      where: { key: { in: ["logo", "favicon"] } },
      select: { key: true, value: true },
    });

    const logoUrl = settings.find(s => s.key === "logo")?.value || null;
    const faviconUrl = settings.find(s => s.key === "favicon")?.value || null;

    return (
      <main className="p-8 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        {/* Common settings */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Profile Settings</h2>
          <p className="text-sm text-gray-600 mb-3">
            Update your name, avatar, and notification preferences.
          </p>
        </section>

        {/* Admin-only site settings */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Site Settings (Admin Only)</h2>
          <p className="text-sm text-gray-600 mb-3">
            Configure site logo, favicon, and global branding.
          </p>

          {/* Logo */}
          <div className="mb-6">
            <h3 className="text-md font-medium mb-2">Logo</h3>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-12 mb-3" />
            ) : (
              <p className="text-sm text-gray-600 mb-3">No logo selected.</p>
            )}
            <button
              onClick={() => {}}
              disabled
              className="px-4 py-2 bg-gray-400 text-gray-600 rounded-md"
            >
              Upload / Select Logo
            </button>
            <p className="text-sm text-gray-500 mt-2">Media upload disabled in static mode.</p>
          </div>

          {/* Favicon */}
          <div className="mb-6">
            <h3 className="text-md font-medium mb-2">Favicon</h3>
            {faviconUrl ? (
              <img src={faviconUrl} alt="Favicon" className="h-10 mb-3" />
            ) : (
              <p className="text-sm text-gray-600 mb-3">No favicon selected.</p>
            )}
            <button
              onClick={() => {}}
              disabled
              className="px-4 py-2 bg-gray-400 text-gray-600 rounded-md"
            >
              Upload / Select Favicon
            </button>
            <p className="text-sm text-gray-500 mt-2">Media upload disabled in static mode.</p>
          </div>

          <button
            onClick={() => {}}
            disabled
            className="px-4 py-2 rounded-md bg-gray-400 text-gray-600"
          >
            Save site settings
          </button>
        </section>

        {/* Expert settings */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Expert Settings</h2>
          <p className="text-sm text-gray-600 mb-3">
            Manage your categories, availability, and business profile.
          </p>
        </section>
      </main>
    );
  } catch (e) {
    console.error("SettingsPage error:", e);
    return (
      <main className="p-8 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <p className="text-red-500">Failed to load settings: {String(e)}</p>
      </main>
    );
  }
}

export const dynamic = 'force-dynamic';
