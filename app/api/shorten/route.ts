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
import { API_CONSTANTS, POSTGRES_ERROR_CODES } from "@/lib/constants";

const shortenSchema = z.object({
  url: urlSchema,
  customSlug: slugSchema.optional(),
});

/** Build the short URL response object from a saved link record. */
function buildResponse(
  newLink: { slug: string; url: string; createdAt: Date },
  anonId: string,
  request: NextRequest
): NextResponse {
  const shortUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/${newLink.slug}`;
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
}

export async function POST(request: NextRequest) {
  try {
    // Fix #4: ambil hanya IP pertama dari x-forwarded-for (cegah rate-limit bypass)
    const rawIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const ip = rawIp.split(",")[0].trim();

    const rateLimit = await checkRateLimit(ip, API_CONSTANTS.RATE_LIMIT_SHORTEN_MAX_REQUESTS, API_CONSTANTS.RATE_LIMIT_WINDOW_MS);
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

    const safetyCheck = await checkUrlSafety(url);
    if (!safetyCheck.safe) {
      return NextResponse.json(
        {
          error: "URL ini terdeteksi berbahaya dan tidak dapat dipersingkat",
          threats: safetyCheck.threats,
        },
        { status: 400 }
      );
    }

    let slug: string;
    if (customSlug) {
      if (isReservedSlug(customSlug)) {
        return NextResponse.json(
          { error: "Slug ini sudah direservasi sistem dan tidak dapat digunakan" },
          { status: 400 }
        );
      }
      const existingLink = await db.query.links.findFirst({
        where: eq(links.slug, customSlug),
      });
      if (existingLink) {
        return NextResponse.json(
          { error: "Slug kustom ini sudah digunakan" },
          { status: 409 }
        );
      }
      slug = customSlug;
    } else {
      let attempts = 0;
      const maxAttempts = API_CONSTANTS.MAX_SLUG_GENERATION_ATTEMPTS;
      let generated = "";
      let isUnique = false;

      while (attempts < maxAttempts && !isUnique) {
        generated = generateSlug();
        attempts++;
        if (isReservedSlug(generated)) continue;
        const existing = await db.query.links.findFirst({
          where: eq(links.slug, generated),
        });
        if (!existing) isUnique = true;
      }

      if (!isUnique) {
        return NextResponse.json(
          { error: "Gagal membuat slug unik setelah beberapa percobaan. Silakan coba lagi." },
          { status: 500 }
        );
      }
      slug = generated;
    }

    // Fix #1: inner try-catch untuk menangkap unique_violation (Postgres 23505)
    // yang bisa terjadi sebagai race condition walau sudah ada pre-check di atas.
    try {
      const [newLink] = await db.insert(links).values({ slug, url, anonId }).returning();

      // Fix #2a: guard newLink undefined
      if (!newLink) {
        return NextResponse.json(
          { error: "Gagal menyimpan link ke database" },
          { status: 500 }
        );
      }

      return buildResponse(newLink, anonId, request);
    } catch (insertError: any) {
      // Kode error Postgres unique_violation = '23505'
      if (insertError?.code === POSTGRES_ERROR_CODES.UNIQUE_VIOLATION) {
        if (customSlug) {
          // Custom slug: race condition — orang lain baru saja pakai slug yang sama
          return NextResponse.json(
            { error: "Slug kustom ini sudah digunakan" },
            { status: 409 }
          );
        }
        // Auto-slug: retry sekali dengan slug baru
        let retrySlug = generateSlug();
        let retryAttempts = 0;
        while (isReservedSlug(retrySlug) && retryAttempts < API_CONSTANTS.MAX_SLUG_GENERATION_ATTEMPTS) {
          retrySlug = generateSlug();
          retryAttempts++;
        }
        if (isReservedSlug(retrySlug)) {
          return NextResponse.json(
            { error: "Gagal membuat slug unik setelah beberapa percobaan." },
            { status: 500 }
          );
        }
        const [retryLink] = await db.insert(links).values({ slug: retrySlug, url, anonId }).returning();
        if (!retryLink) {
          return NextResponse.json(
            { error: "Gagal menyimpan link ke database setelah retry" },
            { status: 500 }
          );
        }
        return buildResponse(retryLink, anonId, request);
      }
      // Error lain: re-throw ke outer catch
      throw insertError;
    }
  } catch (error) {
    console.error("Shorten error:", error);
    return NextResponse.json(
      { error: "Gagal membuat link pendek" },
      { status: 500 }
    );
  }
}
