import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShortenForm from "@/components/ShortenForm";
import { getStats } from "@/lib/stats";

export default async function HomePage() {
  const { totalLinks, totalClicks } = await getStats();
  const showStats = totalLinks !== null && totalClicks !== null;

  return (
    <div className="min-h-screen flex flex-col antialiased">
      <Navbar />

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
            {showStats && (
              <p className="text-xs text-muted-foreground/60 font-medium select-none mt-1">
                🔗 {totalLinks} link sudah diperpendek · {totalClicks} total klik
              </p>
            )}
          </div>

          <ShortenForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
