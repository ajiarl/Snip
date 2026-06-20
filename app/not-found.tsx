import NotFoundClient from "@/components/NotFoundClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 | SNIP",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return <NotFoundClient />;
}
