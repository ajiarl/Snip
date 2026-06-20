import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://snip.to";

  return [
    {
      url: baseUrl,
      lastModified: new Date("2026-06-21"),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
