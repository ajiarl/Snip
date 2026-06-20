"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, BarChart3, Clock, CalendarDays, RefreshCcw, Lock, Link2Off } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SkeletonAnalyticsCard, SkeletonChart } from "@/components/SkeletonLoaders";

interface AnalyticsData {
  slug: string;
  url: string;
  createdAt: string;
  totalClicks: number;
  uniqueClicks: number;
  lastClickedAt: string | null;
  clicksByDay: Record<string, number>;
}

interface ChartDataPoint {
  date: string;
  clicks: number;
}

export default function AnalyticsDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ status: number; message: string } | null>(null);
  const [timeRange, setTimeRange] = useState<"7d" | "30d">("7d");

  useEffect(() => {
    if (slug) {
      fetchAnalytics();
    }
  }, [slug, timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/analytics/${slug}`);
      const data = await response.json();

      if (!response.ok) {
        let errorMessage = "Gagal memuat analytics";
        if (response.status === 403) {
          errorMessage = "Anda bukan pemilik link ini";
        } else if (response.status === 404) {
          errorMessage = "Link tidak ditemukan";
        } else {
          errorMessage = data.error || errorMessage;
        }
        
        setError({ status: response.status, message: errorMessage });
        toast.error(errorMessage);
        return;
      }
      setAnalytics(data);
    } catch (error) {
      const errorMessage = "Terjadi kesalahan saat mengambil data analytics";
      setError({ status: 500, message: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredChartData = (): ChartDataPoint[] => {
    if (!analytics) return [];

    const data: ChartDataPoint[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const numDays = timeRange === "7d" ? 7 : 30;

    for (let i = numDays - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split("T")[0];
      data.push({
        date: date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
        clicks: analytics.clicksByDay[dateString] || 0,
      });
    }
    return data;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
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

        {/* Main Content with Skeleton */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-on-surface transition-colors mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Dashboard
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <SkeletonAnalyticsCard />
            <SkeletonAnalyticsCard />
          </div>

          <SkeletonChart />
        </main>
      </div>
    );
  }

  if (error || !analytics) {
    const is403 = error?.status === 403;
    const is404 = error?.status === 404;
    const ErrorIcon = is403 ? Lock : Link2Off;
    const errorTitle = is403 ? "Akses Ditolak" : is404 ? "Link Tidak Ditemukan" : "Terjadi Kesalahan";
    const errorMessage = error?.message || "Gagal memuat analytics";
    
    return (
      <div className="min-h-screen flex flex-col bg-background">
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

        {/* Error Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 py-16 relative">
          {/* Atmospheric Background Glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
            <div className="w-[500px] h-[500px] bg-[#bef227] rounded-full blur-[150px]"></div>
          </div>

          <div className="relative z-10 flex flex-col items-center max-w-2xl">
            {/* Error Icon */}
            <div className="bg-[#1b1c1c] border border-[#343535] rounded-xl p-6 mb-6 flex items-center justify-center">
              <ErrorIcon className="text-[#bef227] w-16 h-16 stroke-1" />
            </div>

            {/* Error Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-[#bef227] uppercase tracking-wide mb-4">
              {errorTitle}
            </h1>

            {/* Error Message */}
            <p className="text-lg text-muted-foreground max-w-md text-center mb-10">
              {errorMessage}
            </p>

            {/* Action Button */}
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 bg-[#bef227] text-black font-bold py-3 px-8 rounded hover:bg-[#c0f42a] transition-all active:scale-95 hover:shadow-lg hover:shadow-[#bef227]/40"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Kembali ke Dashboard
            </Link>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full py-10 border-t border-[#222222] bg-background z-10 relative">
          <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-6 text-center md:text-left">
            <div className="text-sm font-bold">
              © 2026 SNIP Link Management. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <a href="#" className="text-muted-foreground hover:text-[#bef227] underline transition-all">
                Privacy
              </a>
              <a href="#" className="text-muted-foreground hover:text-[#bef227] underline transition-all">
                Terms
              </a>
              <a href="#" className="text-muted-foreground hover:text-[#bef227] underline transition-all">
                API Docs
              </a>
              <a href="#" className="text-muted-foreground hover:text-[#bef227] underline transition-all">
                Status
              </a>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
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
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
        <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-on-surface transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Dashboard
        </Link>

        <div className="flex items-baseline justify-between mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-on-surface flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-[#bef227]" />
            Analitik: /{analytics.slug}
          </h1>
          <button onClick={fetchAnalytics} className="text-muted-foreground hover:text-on-surface transition-colors flex items-center gap-1">
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <p className="text-muted-foreground mb-8 break-all">URL asli: {analytics.url}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Total Clicks Card */}
          <div
            className="bg-[#0a0a0a] border border-[#222222] rounded-xl p-6 flex flex-col items-center justify-center gap-4"
            style={{ background: "linear-gradient(145deg, rgba(27, 28, 28, 0.4) 0%, rgba(13, 14, 15, 0.8) 100%)", backdropFilter: "blur(12px)" }}
          >
            <BarChart3 className="w-10 h-10 text-[#bef227]" />
            <span className="text-5xl font-bold text-on-surface">{analytics.totalClicks}</span>
            <span className="text-lg text-muted-foreground">Total Klik</span>
          </div>

          {/* Last Clicked & Created At */}
          <div
            className="bg-[#0a0a0a] border border-[#222222] rounded-xl p-6 flex flex-col justify-center gap-4"
            style={{ background: "linear-gradient(145deg, rgba(27, 28, 28, 0.4) 0%, rgba(13, 14, 15, 0.8) 100%)", backdropFilter: "blur(12px)" }}
          >
            <div className="flex items-center gap-3">
              <CalendarDays className="w-6 h-6 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground text-sm">Dibuat pada</p>
                <p className="text-on-surface text-base font-medium">
                  {new Date(analytics.createdAt).toLocaleDateString()} {new Date(analytics.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground text-sm">Terakhir Diklik</p>
                <p className="text-on-surface text-base font-medium">
                  {analytics.lastClickedAt
                    ? `${new Date(analytics.lastClickedAt).toLocaleDateString()} ${new Date(analytics.lastClickedAt).toLocaleTimeString()}`
                    : "Belum pernah diklik"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Clicks per Day Chart */}
        <div
          className="bg-[#0a0a0a] border border-[#222222] rounded-xl p-6"
          style={{ background: "linear-gradient(145deg, rgba(27, 28, 28, 0.4) 0%, rgba(13, 14, 15, 0.8) 100%)", backdropFilter: "blur(12px)" }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-on-surface">Klik per Hari</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeRange("7d")}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  timeRange === "7d"
                    ? "bg-[#bef227] text-black"
                    : "bg-[#1b1c1c] text-muted-foreground hover:bg-[#292a2a]"
                }`}
              >
                7 Hari
              </button>
              <button
                onClick={() => setTimeRange("30d")}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  timeRange === "30d"
                    ? "bg-[#bef227] text-black"
                    : "bg-[#1b1c1c] text-muted-foreground hover:bg-[#292a2a]"
                }`}
              >
                30 Hari
              </button>
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getFilteredChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="date"
                  stroke="#8e937a"
                  tick={{ fill: '#8e937a', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  stroke="#8e937a"
                  tick={{ fill: '#8e937a', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111111",
                    borderColor: "#333333",
                    borderRadius: "8px",
                    color: "#e3e2e2",
                  }}
                  itemStyle={{ color: "#bef227" }}
                />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#bef227"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#bef227", strokeWidth: 1 }}
                  activeDot={{ r: 6, fill: "#bef227", stroke: "#000000", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-10 border-t border-[#222222] bg-background z-10 relative">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-6 text-center md:text-left">
          <div className="text-sm font-bold">
            © 2026 SNIP Link Management. All rights reserved.
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a href="#" className="text-muted-foreground hover:text-[#bef227] underline transition-all">
              Privacy
            </a>
            <a href="#" className="text-muted-foreground hover:text-[#bef227] underline transition-all">
              Terms
            </a>
            <a href="#" className="text-muted-foreground hover:text-[#bef227] underline transition-all">
              API Docs
            </a>
            <a href="#" className="text-muted-foreground hover:text-[#bef227] underline transition-all">
              Status
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
