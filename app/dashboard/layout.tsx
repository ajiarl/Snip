import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Main Content */}
      <div className="flex-1 w-full relative flex flex-col bg-[radial-gradient(circle_500px_at_50%_200px,rgba(190,242,39,0.20)_0%,transparent_100%)]">
        {children}
      </div>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
