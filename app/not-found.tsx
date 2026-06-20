"use client";

import { Link2Off, ArrowLeft, Headphones } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ReportDialog from "@/components/ReportDialog";

export default function NotFound() {
  const pathname = usePathname();
  const slug = pathname?.replace(/^\//, "") || "";
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      {/* Top Nav - Brand Only */}
      <header className="w-full top-0 sticky z-50 bg-background border-b border-[#343535]">
        <div className="flex justify-between items-center w-full px-8 py-2 max-w-7xl mx-auto">
          <Link
            href="/"
            aria-label="Go to Homepage"
            className="text-2xl font-bold text-[#bef227] tracking-tighter hover:text-[#c0f42a] transition-colors"
          >
            SNIP
          </Link>
        </div>
      </header>

      {/* Main 404 Canvas */}
      <main className="flex-1 flex items-center justify-center text-center px-4 md:px-8 relative">
        {/* Atmospheric Background Glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
          <div className="w-[500px] h-[500px] bg-[#bef227] rounded-full blur-[150px]"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center max-w-2xl">
          {/* Error Icon */}
          <div className="bg-[#1b1c1c] border border-[#343535] rounded-xl p-5 mb-4 flex items-center justify-center">
            <Link2Off className="text-[#bef227] w-14 h-14 stroke-1" />
          </div>

          {/* 404 Heading */}
          <h1 className="text-6xl md:text-7xl font-bold text-[#bef227] uppercase tracking-widest" style={{ textShadow: '0px 0px 20px rgba(190, 242, 39, 0.25)' }}>
            404
          </h1>

          {/* Context Subheading */}
          <h2 className="text-2xl md:text-3xl font-semibold text-white mt-4 mb-2">
            Link Tidak Ditemukan
          </h2>

          {/* Explanation */}
          <p className="text-lg text-muted-foreground max-w-md mt-3 mb-6">
            Link yang Anda klik mungkin sudah kedaluwarsa, dipindahkan ke tujuan baru, atau tidak pernah ada di sistem kami.
          </p>

          {/* Action Button */}
          <Link
            href="/"
            className="group flex items-center gap-2 bg-[#bef227] text-black font-bold py-3 px-8 rounded hover:bg-[#c0f42a] transition-all active:scale-95 hover:shadow-lg hover:shadow-[#bef227]/40"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Beranda
          </Link>

          {/* Secondary Action */}
          <div className="mt-8 flex flex-col md:flex-row gap-4 items-center justify-center border-t border-[#343535] pt-6 w-full">
            <span className="text-muted-foreground">Ada masalah?</span>
            <div className="flex gap-4">
              <ReportDialog 
                slug={slug}
                triggerClassName="text-[#bef227] hover:text-[#c0f42a] hover:underline transition-colors flex items-center gap-1"
                triggerText="Laporkan link"
              />
              <a
                href="#"
                className="text-[#bef227] hover:text-[#c0f42a] hover:underline transition-colors flex items-center gap-1"
              >
                Hubungi Dukungan
                <Headphones className="w-4 h-4" />
              </a>
            </div>
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
