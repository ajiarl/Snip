"use client";

import { useEffect, useRef, useState } from "react";
import QRCodeLib from "qrcode";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface QRCodeProps {
  value: string;
  size?: number;
  showDownload?: boolean;
}

export default function QRCode({ value, size = 128, showDownload = true }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    const generateQR = async () => {
      if (!canvasRef.current || !value) {
        return;
      }

      try {
        await QRCodeLib.toCanvas(canvasRef.current, value, {
          width: 200,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        });
      } catch (error) {
        toast.error("Failed to generate QR code");
      }
    };

    generateQR();
  }, [value, size]);

  const handleDownload = async () => {
    if (!canvasRef.current) return;

    try {
      const url = canvasRef.current.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `qr-code-${Date.now()}.png`;
      link.href = url;
      link.click();
      toast.success("QR code downloaded!");
    } catch (error) {
      console.error("Failed to download QR code:", error);
      toast.error("Failed to download QR code");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-32 h-32 bg-[#111111] border border-[#333333] rounded-lg p-2 flex items-center justify-center shrink-0 relative">
        {isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#111111] rounded-sm z-10">
            <div className="w-full h-full bg-muted-foreground/20 rounded-sm flex items-center justify-center text-xs text-muted-foreground animate-pulse">
              QR
            </div>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="w-full h-full rounded-sm"
          style={{ imageRendering: "pixelated" }}
        />
      </div>
      {showDownload && !isGenerating && (
        <button
          onClick={handleDownload}
          className="bg-transparent border border-[#222222] text-on-surface font-bold text-sm px-3 py-2 rounded-lg hover:border-on-surface hover:bg-[#111111] transition-all flex flex-col items-center justify-center gap-1"
        >
          <Download className="w-4 h-4" />
          Unduh QR
        </button>
      )}
    </div>
  );
}
