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
      <div className="flex-1 w-full relative flex flex-col">
        {children}
      </div>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
