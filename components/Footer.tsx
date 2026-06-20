import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-10 border-t border-[#222222] bg-background z-10 relative mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-6 text-center md:text-left">
        <div className="text-sm font-bold text-muted-foreground">
          © 2026 SNIP Link Management. All rights reserved.
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <Link href="#" className="text-muted-foreground hover:text-[#bef227] underline transition-all">
            Privacy
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-[#bef227] underline transition-all">
            Terms
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-[#bef227] underline transition-all">
            API Docs
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-[#bef227] underline transition-all">
            Status
          </Link>
        </div>
      </div>
    </footer>
  );
}
