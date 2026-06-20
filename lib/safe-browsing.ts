const API_URL = "https://safebrowsing.googleapis.com/v4/threatMatches:find";

export async function checkUrlSafety(url: string): Promise<{ safe: boolean; threats?: string[] }> {
  const apiKey = process.env.SAFE_BROWSING_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ SAFE_BROWSING_API_KEY not set - skipping URL safety check (DEV MODE)");
    return { safe: true };
  }

  try {
    const response = await fetch(`${API_URL}?key=${apiKey}`, {
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
      const errorText = await response.text();
      console.warn(`⚠️ Safe Browsing API returned status ${response.status}: ${errorText}. Bypassing check (FAIL-OPEN).`);
      return { safe: true };
    }

    const data = await response.json();
    
    if (data.matches && data.matches.length > 0) {
      const threats = data.matches.map((m: any) => m.threatType);
      return { safe: false, threats };
    }

    return { safe: true };
  } catch (error) {
    console.warn("⚠️ Safe Browsing API connection failed. Bypassing check (FAIL-OPEN). Error:", error);
    return { safe: true };
  }
}
