// File: src/app/experts/page.tsx
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function ExpertsPage() {
  const experts = await prisma.expert.findMany();

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Experts</h1>
      <ul>
        {experts.map((expert) => (
          <li key={expert.id} className="mb-4">
            <h2 className="text-xl font-semibold">{expert.name}</h2>
            {expert.shortDesc && <p className="text-gray-600">{expert.shortDesc}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
