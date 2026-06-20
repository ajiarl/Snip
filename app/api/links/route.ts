import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { links } from "@/drizzle/schema";
import { eq, and, or, like, desc } from "drizzle-orm";
import { getAnonIdFromCookie } from "@/lib/anon-id";
import { urlSchema } from "@/lib/validate-url";

export async function GET(request: NextRequest) {
  try {
    const anonId = getAnonIdFromCookie(request.headers.get("cookie"));
    if (!anonId) {
      return NextResponse.json({ links: [] });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = (page - 1) * limit;

    const query = db.query.links.findMany({
      where: and(
        eq(links.anonId, anonId),
        search
          ? or(
              like(links.slug, `%${search}%`),
              like(links.url, `%${search}%`)
            )
          : undefined
      ),
      orderBy: [desc(links.createdAt)],
      limit,
      offset,
    });

    const allLinks = await query;

    return NextResponse.json({ links: allLinks });
  } catch (error) {
    console.error("Get links error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil daftar link" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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

    const updates: any = { updatedAt: new Date() };
    
    if (url !== undefined) {
      const validation = urlSchema.safeParse(url);
      if (!validation.success) {
        return NextResponse.json(
          { error: validation.error.errors[0].message },
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
