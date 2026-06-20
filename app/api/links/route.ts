import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { links } from "@/drizzle/schema";
import { eq, and, or, like, desc, sql } from "drizzle-orm";
import { getAnonIdFromCookie } from "@/lib/anon-id";
import { urlSchema } from "@/lib/validate-url";
import { checkUrlSafety } from "@/lib/safe-browsing";
import { checkRateLimit } from "@/lib/ratelimit";
import { validateOrigin } from "@/lib/csrf";
import { API_CONSTANTS } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const anonId = getAnonIdFromCookie(request.headers.get("cookie"));
    if (!anonId) {
      return NextResponse.json({ links: [], total: 0, hasMore: false });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || API_CONSTANTS.DEFAULT_PAGINATION_LIMIT.toString(), 10), API_CONSTANTS.MAX_PAGINATION_LIMIT);
    const offset = (page - 1) * limit;

    const condition = and(
      eq(links.anonId, anonId),
      search
        ? or(
            like(links.slug, `%${search}%`),
            like(links.url, `%${search}%`)
          )
        : undefined
    );

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(links)
      .where(condition);
    const total = Number(countResult.count);

    const allLinks = await db.query.links.findMany({
      where: condition,
      orderBy: [desc(links.createdAt)],
      limit,
      offset,
    });

    const hasMore = offset + allLinks.length < total;

    return NextResponse.json({ links: allLinks, total, hasMore });
  } catch (error) {
    console.error("Get links error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil daftar link" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  // Fix: CSRF check
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fix: Rate limit — 10 req/menit per IP
  const rawPatchIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const patchIp = rawPatchIp.split(",")[0].trim();
  const patchRateLimit = await checkRateLimit(patchIp, API_CONSTANTS.RATE_LIMIT_SHORTEN_MAX_REQUESTS, API_CONSTANTS.RATE_LIMIT_WINDOW_MS);
  if (!patchRateLimit.success) {
    return NextResponse.json(
      { error: "Batas percobaan terlampaui. Silakan coba lagi nanti." },
      { status: 429 }
    );
  }

  try {
    const anonId = getAnonIdFromCookie(request.headers.get("cookie"));
    if (!anonId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, url, disabled } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID link diperlukan" },
        { status: 400 }
      );
    }

    const link = await db.query.links.findFirst({
      where: eq(links.id, id),
    });

    if (!link || link.anonId !== anonId) {
      return NextResponse.json(
        { error: "Link tidak ditemukan atau tidak terautentikasi" },
        { status: 403 }
      );
    }

    const updates: Partial<typeof links.$inferInsert> = { updatedAt: new Date() };
    
    if (url !== undefined) {
      const validation = urlSchema.safeParse(url);
      if (!validation.success) {
        return NextResponse.json(
          { error: validation.error.errors[0].message },
          { status: 400 }
        );
      }

      const safetyCheck = await checkUrlSafety(url);
      if (!safetyCheck.safe) {
        return NextResponse.json(
          { 
            error: "URL ini terdeteksi berbahaya dan tidak dapat dipersingkat",
            threats: safetyCheck.threats 
          },
          { status: 400 }
        );
      }

      updates.url = url;
    }

    if (disabled !== undefined) {
      updates.disabled = disabled;
    }

    const [updatedLink] = await db
      .update(links)
      .set(updates)
      .where(eq(links.id, id))
      .returning();

    if (!updatedLink) {
      return NextResponse.json(
        { error: "Gagal memperbarui link di database" },
        { status: 500 }
      );
    }

    return NextResponse.json({ link: updatedLink });
  } catch (error) {
    console.error("Update link error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui link" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Fix: CSRF check
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fix: Rate limit — 10 req/menit per IP
  const rawDeleteIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const deleteIp = rawDeleteIp.split(",")[0].trim();
  const deleteRateLimit = await checkRateLimit(deleteIp, API_CONSTANTS.RATE_LIMIT_SHORTEN_MAX_REQUESTS, API_CONSTANTS.RATE_LIMIT_WINDOW_MS);
  if (!deleteRateLimit.success) {
    return NextResponse.json(
      { error: "Batas percobaan terlampaui. Silakan coba lagi nanti." },
      { status: 429 }
    );
  }

  try {
    const anonId = getAnonIdFromCookie(request.headers.get("cookie"));
    if (!anonId) {
      return NextResponse.json(
        { error: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID link diperlukan" },
        { status: 400 }
      );
    }

    const link = await db.query.links.findFirst({
      where: eq(links.id, id),
    });

    if (!link || link.anonId !== anonId) {
      return NextResponse.json(
        { error: "Link tidak ditemukan atau tidak terautentikasi" },
        { status: 403 }
      );
    }

    await db.delete(links).where(eq(links.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete link error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus link" },
      { status: 500 }
    );
  }
}
