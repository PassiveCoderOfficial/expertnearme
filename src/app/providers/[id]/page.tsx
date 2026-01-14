import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function ProviderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const provider = await prisma.provider.findUnique({
    where: { id: Number(id) },
    include: {
      categories: {
        include: { category: true },
      },
    },
  });

  if (!provider) {
    return (
      <main className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Provider not found</h1>
        <p className="text-gray-600">No provider exists with ID {id}.</p>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{provider.name}</h1>
      <p className="text-gray-600 mb-1">Email: {provider.email}</p>
      {provider.phone && <p className="text-gray-600 mb-1">Phone: {provider.phone}</p>}
      <p className="text-gray-600 mb-4">
        Type: {provider.isBusiness ? "Business" : "Individual"}
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Categories</h2>
      {provider.categories.length === 0 ? (
        <p className="text-gray-500 italic">No categories linked.</p>
      ) : (
        <ul className="list-disc ml-6">
          {provider.categories.map((link) => (
            <li key={link.category.id}>
              {link.category.name} ({link.category.slug})
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
