import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { links, clicks } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { hashIP } from "@/lib/hash-ip";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname === "/") {
    return NextResponse.next();
  }

  const slug = pathname.slice(1);

  if (!slug) {
    return NextResponse.next();
  }

  try {
    const link = await db.query.links.findFirst({
      where: eq(links.slug, slug),
    });

    if (!link || link.disabled) {
      return NextResponse.rewrite(new URL("/not-found", request.url));
    }

    // Record click in a non-blocking way
    const rawIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const ip = rawIp.split(",")[0].trim();
    hashIP(ip).then(ipHash => {
      db.insert(clicks).values({
        linkId: link.id,
        ipHash,
      }).execute().catch(console.error);
    });

    const response = NextResponse.redirect(link.url, { status: 302 });
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.rewrite(new URL("/not-found", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|dashboard).*)"],
};
