import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { links, clicks } from "@/drizzle/schema";
import { eq, countDistinct, sql, count, and, gte } from "drizzle-orm";
import { API_CONSTANTS } from "@/lib/constants";
import { getAnonIdFromCookie } from "@/lib/anon-id";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const anonId = getAnonIdFromCookie(request.headers.get("cookie"));

    const link = await db.query.links.findFirst({
      where: eq(links.slug, slug),
    });

    if (!link) {
      return NextResponse.json(
        { error: "Link tidak ditemukan" },
        { status: 404 }
      );
    }

    if (link.anonId !== anonId) {
      return NextResponse.json(
        { error: "Tidak terautentikasi" },
        { status: 403 }
      );
    }

    const totalResult = await db.select({ count: count() })
      .from(clicks)
      .where(eq(clicks.linkId, link.id));

    const totalClicks = totalResult[0]?.count || 0;

    const uniqueClicksResult = await db.select({ count: countDistinct(clicks.ipHash) })
      .from(clicks)
      .where(eq(clicks.linkId, link.id));

    const uniqueClicks = uniqueClicksResult[0]?.count || 0;

    const lastClickResult = await db.query.clicks.findFirst({
      where: eq(clicks.linkId, link.id),
      orderBy: (clicks, { desc }) => [desc(clicks.clickedAt)],
    });

    const lastClickedAt = lastClickResult?.clickedAt || null;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - API_CONSTANTS.ANALYTICS_CUTOFF_DAYS);

    const recentClicks = await db.select({ clickedAt: clicks.clickedAt })
      .from(clicks)
      .where(
        and(
          eq(clicks.linkId, link.id),
          gte(clicks.clickedAt, cutoffDate)
        )
      );

    const clicksByDay = recentClicks.reduce((acc: Record<string, number>, click) => {
      const date = new Date(click.clickedAt).toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      slug: link.slug,
      url: link.url,
      createdAt: link.createdAt,
      totalClicks,
      uniqueClicks,
      lastClickedAt,
      clicksByDay,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data analytics" },
      { status: 500 }
    );
  }
}
