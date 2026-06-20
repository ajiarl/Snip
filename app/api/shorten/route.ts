import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { links } from "@/drizzle/schema";
import { generateSlug, isReservedSlug } from "@/lib/slug";
import { urlSchema, slugSchema } from "@/lib/validate-url";
import { checkUrlSafety } from "@/lib/safe-browsing";
import { checkRateLimit } from "@/lib/ratelimit";
import { generateAnonId, getAnonIdFromCookie, createAnonIdCookie } from "@/lib/anon-id";
import { eq } from "drizzle-orm";
import { z } from "zod";

const shortenSchema = z.object({
  url: urlSchema,
  customSlug: slugSchema.optional(),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const rateLimit = await checkRateLimit(ip, 10, 60000);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Batas percobaan terlampaui. Silakan coba lagi nanti." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = shortenSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { url, customSlug } = validation.data;

    let anonId = getAnonIdFromCookie(request.headers.get("cookie"));
    if (!anonId) {
      anonId = generateAnonId();
    }

    if (customSlug && isReservedSlug(customSlug)) {
      return NextResponse.json(
        { error: "Slug ini sudah direservasi sistem dan tidak dapat digunakan" },
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

    let slug = customSlug || generateSlug();

    const existingLink = await db.query.links.findFirst({
      where: eq(links.slug, slug),
    });

    if (existingLink) {
      if (customSlug) {
        return NextResponse.json(
          { error: "Slug kustom ini sudah digunakan" },
          { status: 400 }
        );
      }
      slug = generateSlug();
    }

    const [newLink] = await db.insert(links).values({
      slug,
      url,
      anonId,
    }).returning();

    const shortUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/${slug}`;

    const response = NextResponse.json({
      slug: newLink.slug,
      url: newLink.url,
      shortUrl,
      createdAt: newLink.createdAt,
    });

    const needsNewCookie = !getAnonIdFromCookie(request.headers.get("cookie"));
    if (needsNewCookie) {
      response.headers.set("Set-Cookie", createAnonIdCookie(anonId));
    }

    return response;
  } catch (error) {
    console.error("Shorten error:", error);
    return NextResponse.json(
      { error: "Gagal membuat link pendek" },
      { status: 500 }
    );
  }
}
