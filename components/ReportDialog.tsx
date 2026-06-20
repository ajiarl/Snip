"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Flag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ReportDialogProps {
  slug?: string;
  triggerClassName?: string;
  triggerText?: string;
}

export default function ReportDialog({ 
  slug, 
  triggerClassName = "text-muted-foreground hover:text-[#bef227] underline transition-colors text-sm",
  triggerText = "Laporkan link"
}: ReportDialogProps) {
  const domain = process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '') || 'snip.to';
  const [open, setOpen] = useState(false);
  const [reportSlug, setReportSlug] = useState(slug || "");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reportSlug.trim()) {
      toast.error("Slug tidak boleh kosong");
      return;
    }

    if (reason.trim().length < 3) {
      toast.error("Alasan minimal 3 karakter");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: reportSlug.replace(/^\//, ""),
          reason: reason.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Gagal mengirim laporan");
        return;
      }

      toast.success(data.message);
      setOpen(false);
      setReportSlug(slug || "");
      setReason("");
    } catch (error) {
      toast.error("Terjadi kesalahan saat mengirim laporan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={triggerClassName}>
        <Flag className="w-4 h-4 inline mr-1" />
        {triggerText}
      </DialogTrigger>
      <DialogContent className="bg-[#0a0a0a] border border-[#222222] text-on-surface max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="w-5 h-5 text-[#bef227]" />
            Laporkan Link Bermasalah
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Bantu kami menjaga keamanan platform dengan melaporkan link yang mencurigakan atau berbahaya.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="slug" className="text-sm font-medium text-on-surface">
              Slug Link <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2 bg-[#111111] border border-[#333333] rounded-lg px-3 py-2">
              <span className="text-muted-foreground text-sm font-mono">{domain}/</span>
              <input
                id="slug"
                type="text"
                placeholder="contoh-slug"
                value={reportSlug}
                onChange={(e) => setReportSlug(e.target.value)}
                disabled={!!slug || loading}
                className="flex-1 bg-transparent border-none text-on-surface outline-none focus:ring-0 font-mono text-sm"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="reason" className="text-sm font-medium text-on-surface">
              Alasan Laporan <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              placeholder="Jelaskan mengapa link ini berbahaya atau melanggar aturan..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
              rows={4}
              maxLength={500}
              className="bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-on-surface placeholder:text-muted-foreground/50 outline-none focus:border-[#bef227] transition-colors resize-none"
              required
            />
            <span className="text-xs text-muted-foreground text-right">
              {reason.length}/500 karakter
            </span>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="flex-1 bg-[#1b1c1c] text-muted-foreground font-medium px-4 py-2 rounded-lg hover:bg-[#292a2a] transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#bef227] text-black font-bold px-4 py-2 rounded-lg hover:bg-[#c0f42a] transition-colors disabled:opacity-50 active:scale-95"
            >
              {loading ? "Mengirim..." : "Kirim Laporan"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
