// File: src/app/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";

export const revalidate = 10;

type Props = {
  params: { slug: string } | Promise<{ slug: string }>;
};

async function canEditServerSide(expertEmail: string | null) {
  try {
    // Forward cookies so the auth endpoint can read the session
    const cookieHeader = cookies().toString();
    const base = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:3000`;
    const res = await fetch(`${base}/api/auth/me`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    if (!res.ok) return false;
    const json = await res.json();
    const user = (json && (json.user ?? json)) || null;
    if (!user) return false;
    if (user.role === "admin") return true;
    if (user.email && expertEmail && user.email.toLowerCase() === expertEmail.toLowerCase()) return true;
    return false;
  } catch (err) {
    console.error("server-side auth check failed", err);
    return false;
  }
}

export default async function ExpertProfilePage(props: Props) {
  // Unwrap params safely
  const { params } = props as any;
  const resolvedParams = typeof params?.then === "function" ? await params : params;
  const slug = resolvedParams?.slug;
  if (!slug) return notFound();

  // Select only fields that exist on your Expert model
  const expert = await prisma.expert.findUnique({
    where: { profileLink: slug },
    select: {
      id: true,
      profileLink: true,
      name: true,
      email: true,
      businessName: true,
      profilePicture: true,
      coverPhoto: true,
      shortDesc: true,
      contactPerson: true,
      phone: true,
      whatsapp: true,
      mapLocation: true,
      featured: true,
      createdAt: true,
      categories: { include: { category: true } },
      services: true,
      portfolio: true,
    },
  });

  if (!expert) return notFound();

  // Server-side authorization check to decide whether to render Edit button
  const allowedToEdit = await canEditServerSide(expert.email ?? null);

  const title = expert.businessName || expert.name || "Expert";
  const cover = expert.coverPhoto || "";
  const avatar = expert.profilePicture || "";
  const desc = expert.shortDesc || "";
  const cats = (expert.categories || []).map((c) => c.category?.name).filter(Boolean).join(", ");

  return (
    <main className="max-w-4xl mx-auto py-8 px-4">
      <div className="rounded overflow-hidden shadow-sm bg-white">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={title} className="w-full h-56 object-cover" />
        ) : (
          <div className="w-full h-56 bg-gray-100 flex items-center justify-center text-gray-400">No cover photo</div>
        )}

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-xl">{(title || "").slice(0, 1)}</div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">{title}</h1>
                  {cats && <div className="text-sm text-gray-600 mt-1">{cats}</div>}
                  {desc && <p className="mt-3 text-gray-700">{desc}</p>}
                </div>

                {/* Server-rendered Edit button visible only to admin or owner */}
                {allowedToEdit && (
                  <div className="ml-4">
                    <Link href={`/dashboard/experts/${expert.id}`}>
                      <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                        Edit
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Services */}
          {expert.services && expert.services.length > 0 && (
            <section className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Services</h3>
              <ul className="space-y-3">
                {expert.services.map((s: any) => (
                  <li key={s.id} className="border rounded p-3">
                    <div className="flex items-start gap-3">
                      {s.image && <img src={s.image} alt={s.name} className="w-20 h-14 object-cover rounded" />}
                      <div>
                        <div className="font-medium">{s.name}</div>
                        {s.description && <div className="text-sm text-gray-600">{s.description}</div>}
                        {s.rateUnit && <div className="text-xs text-gray-500 mt-1">{s.rateUnit}</div>}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Contact / Map */}
          <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">Contact</h4>
              <div className="mt-2 text-sm text-gray-700">
                {expert.contactPerson && <div><strong>Contact:</strong> {expert.contactPerson}</div>}
                {expert.email && <div><strong>Email:</strong> <a href={`mailto:${expert.email}`} className="text-blue-600">{expert.email}</a></div>}
                {expert.phone && <div><strong>Phone:</strong> <a href={`tel:${expert.phone}`} className="text-blue-600">{expert.phone}</a></div>}
                {expert.whatsapp && <div><strong>WhatsApp:</strong> <a href={`https://wa.me/${expert.whatsapp.replace(/\D/g, "")}`} className="text-blue-600">{expert.whatsapp}</a></div>}
              </div>
            </div>

            <div>
              <h4 className="font-semibold">Location</h4>
              <div className="mt-2 text-sm text-gray-700">
                {expert.mapLocation && (
                  <div>
                    <a href={expert.mapLocation} target="_blank" rel="noreferrer" className="text-blue-600">
                      Open map
                    </a>
                  </div>
                )}
                {!expert.mapLocation && <div className="text-gray-500">No location provided</div>}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
