"use client";

import { useState } from "react";
import { Link2, Scissors, Copy, Shield } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import QRCode from "@/components/QRCode";
import ReportDialog from "@/components/ReportDialog";
import { urlSchema, slugSchema } from "@/lib/validate-url";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    shortUrl: string;
    slug: string;
    url: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const urlValidation = urlSchema.safeParse(url);
      if (!urlValidation.success) {
        toast.error(urlValidation.error.errors[0].message);
        setLoading(false);
        return;
      }

      if (customSlug) {
        const slugValidation = slugSchema.safeParse(customSlug);
        if (!slugValidation.success) {
          toast.error(slugValidation.error.errors[0].message);
          setLoading(false);
          return;
        }
      }

      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          customSlug: customSlug || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Gagal memperpendek URL");
        return;
      }

      setResult({
        shortUrl: data.shortUrl,
        slug: data.slug,
        url: data.url,
      });
      setUrl("");
      setCustomSlug("");
      toast.success("Link berhasil diperpendek!");
    } catch (error) {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!result) return;
    
    try {
      await navigator.clipboard.writeText(result.shortUrl);
      toast.success("Copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="min-h-screen flex flex-col antialiased">
      {/* TopNavBar */}
      <header className="w-full top-0 sticky z-50 bg-background border-b border-[#222222]">
        <div className="flex justify-between items-center w-full px-8 py-2 max-w-7xl mx-auto">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-2xl font-bold text-[#bef227] tracking-tighter">
              SNIP
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-[#bef227] transition-all duration-200">
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 md:px-8 py-16 relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-[600px] h-[600px] bg-[#bef227] rounded-full blur-[120px]"></div>
        </div>

        <div className="z-10 w-full max-w-3xl flex flex-col items-center text-center gap-10">
          <div className="flex flex-col gap-4">
            <h1 className="text-5xl md:text-6xl font-bold text-on-background leading-tight tracking-tight">
              Perpendek. Bagikan. Lacak.
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Platform manajemen link berperforma tinggi untuk tim engineering modern.
            </p>
          </div>

          {/* Form Area */}
          <div className="w-full bg-[#0a0a0a] border border-[#222222] rounded-xl p-6 flex flex-col gap-6">
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 w-full">
              <div className="flex-grow relative glow-effect rounded-lg transition-all duration-300 border border-[#222222] bg-[#0a0a0a] flex items-center">
                <Link2 className="text-muted-foreground ml-3 h-5 w-5" />
                <input
                  className="w-full bg-transparent border-none text-on-background px-3 py-3 focus:ring-0 placeholder:text-muted-foreground/50 outline-none"
                  placeholder="Tempel URL panjang Anda di sini..."
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#bef227] text-black font-bold px-8 py-3 rounded-lg hover:bg-[#c0f42a] transition-colors whitespace-nowrap active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Scissors className="h-5 w-5" />
                {loading ? "Memproses..." : "Perpendek"}
              </button>
            </form>

            <div className="flex items-center gap-4">
              <div className="relative glow-effect rounded-lg transition-all duration-300 border border-[#222222] bg-[#0a0a0a] flex items-center w-full md:w-1/2">
                <span className="text-muted-foreground pl-3 text-sm select-none font-mono">
                  snip.to/
                </span>
                <input
                  className="w-full bg-transparent border-none text-on-background px-3 py-3 focus:ring-0 placeholder:text-muted-foreground/50 outline-none font-mono text-sm"
                  placeholder="slug-kustom (opsional)"
                  type="text"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Trust Badge with Report Link */}
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#bef227]" />
                <span>Link discan otomatis sebelum aktif</span>
              </div>
              <span className="text-[#333333]">•</span>
              <ReportDialog 
                triggerClassName="text-muted-foreground hover:text-[#bef227] transition-colors text-sm flex items-center gap-1"
                triggerText="Laporkan link bermasalah"
              />
            </div>
          </div>

          {/* Success Card */}
          {result && (
            <div 
              data-testid="result-card"
              className="w-full bg-[#0a0a0a] border border-[#bef227]/30 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[#bef227]/5 pointer-events-none"></div>
              <div className="flex flex-col gap-2 z-10 w-full md:w-auto">
                <span className="text-xs text-[#bef227] uppercase tracking-wider font-bold">
                  BERHASIL DIPERPENDEK
                </span>
                <div className="flex items-center gap-2 bg-[#111111] border border-[#333333] rounded-lg p-3">
                  <a
                    href={result.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-mono text-[#bef227] hover:underline truncate max-w-[200px] md:max-w-xs"
                  >
                    {result.shortUrl}
                  </a>
                  <button
                    onClick={copyToClipboard}
                    className="text-muted-foreground hover:text-[#bef227] transition-colors ml-auto p-1"
                    title="Copy to clipboard"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-xs font-mono text-muted-foreground/50 truncate max-w-[250px] md:max-w-sm">
                  Aslinya: {result.url}
                </span>
              </div>
              <div className="flex items-start gap-4 z-10 w-full md:w-auto justify-end">
                <QRCode value={result.shortUrl} />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-10 bg-background border-t border-[#222222]">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-6">
          <span className="text-sm font-bold">
            © 2026 SNIP Link Management. Hak cipta dilindungi undang-undang.
          </span>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-muted-foreground hover:text-[#bef227] underline transition-all">
              Privasi
            </a>
            <a href="#" className="text-muted-foreground hover:text-[#bef227] underline transition-all">
              Ketentuan
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
