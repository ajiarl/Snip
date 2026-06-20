const API_KEY = process.env.SAFE_BROWSING_API_KEY;
const API_URL = "https://safebrowsing.googleapis.com/v4/threatMatches:find";

export async function checkUrlSafety(url: string): Promise<{ safe: boolean; threats?: string[] }> {
  if (!API_KEY) {
    console.warn("⚠️ SAFE_BROWSING_API_KEY not set - skipping URL safety check (DEV MODE)");
    return { safe: true };
  }

  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client: {
          clientId: "snip-link-shortener",
          clientVersion: "1.0.0",
        },
        threatInfo: {
          threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url }],
        },
      }),
    });

    if (!response.ok) {
      console.error("❌ Safe Browsing API error:", response.status, await response.text());
      throw new Error(`Safe Browsing API returned ${response.status}`);
    }

    const data = await response.json();
    
    if (data.matches && data.matches.length > 0) {
      const threats = data.matches.map((m: any) => m.threatType);
      return { safe: false, threats };
    }

    return { safe: true };
  } catch (error) {
    console.error("❌ Safe Browsing check failed (FAIL-CLOSED):", error);
    throw new Error("Tidak bisa memverifikasi keamanan link saat ini, coba lagi sebentar.");
  }
}
