import { nanoid } from "nanoid";
import reservedSlugs from "@/reserved-slugs.json";

export function generateSlug(length: number = 6): string {
  return nanoid(length);
}

export function isReservedSlug(slug: string): boolean {
  return reservedSlugs.includes(slug.toLowerCase());
}
