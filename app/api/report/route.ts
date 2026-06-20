import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { links, reports } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const reportSchema = z.object({
  slug: z.string().min(1, "Slug tidak boleh kosong"),
  reason: z.string().min(3, "Alasan minimal 3 karakter").max(500, "Alasan maksimal 500 karakter"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = reportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { slug, reason } = validation.data;

    const link = await db.query.links.findFirst({
      where: eq(links.slug, slug),
    });

    if (!link) {
      return NextResponse.json(
        { error: "Link tidak ditemukan" },
        { status: 404 }
      );
    }

    await db.insert(reports).values({
      linkId: link.id,
      reason,
    });

    return NextResponse.json(
      { message: "Laporan berhasil dikirim. Terima kasih atas kontribusi Anda!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json(
      { error: "Gagal mengirim laporan" },
      { status: 500 }
    );
  }
}
