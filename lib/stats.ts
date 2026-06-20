import { db } from "@/lib/db";
import { links, clicks } from "@/drizzle/schema";
import { eq, count } from "drizzle-orm";

export interface StatsResult {
  totalLinks: number | null;
  totalClicks: number | null;
}

/**
 * Retrieve total count of non-disabled links and total click counts from DB.
 * Safely handles database connection/query failures by logging a warning and
 * returning nulls instead of throwing, ensuring homepage rendering is non-blocking.
 */
export async function getStats(): Promise<StatsResult> {
  try {
    const [linksResult, clicksResult] = await Promise.all([
      db.select({ count: count() }).from(links).where(eq(links.disabled, false)),
      db.select({ count: count() }).from(clicks),
    ]);

    return {
      totalLinks: linksResult[0]?.count ?? 0,
      totalClicks: clicksResult[0]?.count ?? 0,
    };
  } catch (error) {
    console.warn("Failed to retrieve public statistics from database:", error);
    return {
      totalLinks: null,
      totalClicks: null,
    };
  }
}
