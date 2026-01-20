// src/lib/settings.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getSetting(key: string): Promise<string | null> {
  const s = await prisma.setting.findUnique({ where: { key } });
  return s?.value ?? null;
}

export async function getBoolean(key: string, fallback = false): Promise<boolean> {
  const v = await getSetting(key);
  if (v === null) return fallback;
  return v === "true" || v === "1" || v.toLowerCase() === "on";
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}
