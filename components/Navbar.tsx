"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const isMyLinksActive = pathname?.startsWith("/dashboard");

  return (
    <header className="w-full top-0 sticky z-50 bg-[#0a0a0a]/70 backdrop-blur-md border-b border-white/10">
      <div className="flex justify-between items-center w-full px-4 md:px-8 py-3 max-w-7xl mx-auto">
        <Link 
          href="/" 
          aria-label="Go to Homepage" 
          className="text-2xl font-bold text-[#bef227] tracking-tighter hover:text-[#c0f42a] transition-colors"
        >
          SNIP
        </Link>
        <nav className="flex gap-6">
          <Link 
            href="/dashboard" 
            className={`text-sm transition-all duration-200 ${isMyLinksActive ? "text-[#bef227] font-bold" : "text-muted-foreground hover:text-[#bef227]"}`}
          >
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
