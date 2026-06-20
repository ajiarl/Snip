"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, BarChart3, Lock, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { urlSchema } from "@/lib/validate-url";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SkeletonLinkCard } from "@/components/SkeletonLoaders";

interface Link {
  id: string;
  slug: string;
  url: string;
  disabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editDisabled, setEditDisabled] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState(false);

  useEffect(() => {
    fetchLinks();
  }, [page, search]);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
      });
      const response = await fetch(`/api/links?${params}`);
      const linkListPayload = await response.json();
      setLinks(linkListPayload.links || []);
    } catch (error) {
      toast.error("Gagal memuat daftar link");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLinkToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!linkToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/links?id=${linkToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      setLinks(links.filter((link) => link.id !== linkToDelete));
      toast.success("Link berhasil dihapus");
      setDeleteDialogOpen(false);
      setLinkToDelete(null);
    } catch (error) {
      toast.error("Gagal menghapus link");
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (link: Link) => {
    setEditingLink(link);
    setEditUrl(link.url);
    setEditDisabled(link.disabled);
    setIsEditModalOpen(true);
  };

  const handleEdit = async () => {
    if (!editingLink) return;

    const urlValidation = urlSchema.safeParse(editUrl);
    if (!urlValidation.success) {
      toast.error(urlValidation.error.errors[0].message);
      return;
    }

    setIsEditing(true);
    try {
      const response = await fetch("/api/links", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingLink.id,
          url: editUrl,
          disabled: editDisabled,
        }),
      });

      if (!response.ok) {
        const errorPayload = await response.json();
        throw new Error(errorPayload.error || "Failed to update");
      }

      const updatePayload = await response.json();
      setLinks(links.map((l) => (l.id === editingLink.id ? updatePayload.link : l)));
      setIsEditModalOpen(false);
      toast.success("Link berhasil diperbarui");
    } catch (error: any) {
      toast.error(error.message || "Gagal memperbarui link");
    } finally {
      setIsEditing(false);
    }
  };

  const handleCopySlug = async () => {
    if (!editingLink) return;
    try {
      const shortUrl = `${window.location.origin}/${editingLink.slug}`;
      await navigator.clipboard.writeText(shortUrl);
      toast.success("Slug disalin");
      setCopiedSlug(true);
      setTimeout(() => setCopiedSlug(false), 2000);
    } catch (error) {
      toast.error("Gagal menyalin slug");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLinks();
  };

  return (
    <>
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-on-surface">Link Saya</h1>
            <p className="text-muted-foreground mt-2">
              Kelola dan pantau URL yang Anda perpendek.
            </p>
          </div>
          <Link href="/">
            <Button className="bg-[#bef227] text-black font-bold hover:bg-[#c0f42a]">
              <Plus className="w-5 h-5 mr-2" />
              Buat Link Baru
            </Button>
          </Link>
        </div>

        {/* Search & Filters */}
        <form onSubmit={handleSearch} className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              className="w-full bg-[#0a0a0a] border border-[#222222] rounded-lg pl-12 pr-4 py-3 text-on-surface focus:border-[#bef227] focus:ring-1 focus:ring-[#bef227] transition-all placeholder:text-muted-foreground/50"
              placeholder="Cari link berdasarkan slug atau URL..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </form>

        {/* Links List */}
        {loading ? (
          <div className="flex flex-col gap-4">
            <SkeletonLinkCard />
            <SkeletonLinkCard />
            <SkeletonLinkCard />
            <SkeletonLinkCard />
          </div>
        ) : links.length === 0 ? (
          <div className="bg-[#0a0a0a] border border-[#222222] rounded-xl p-12 text-center">
            <p className="text-muted-foreground">
              {search ? "Tidak ada link yang cocok dengan pencarian Anda." : "Belum ada link. Buat link pertama Anda!"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <div
                key={link.id}
                className="bg-[#0a0a0a] border border-[#222222] rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-[#bef227]/50 transition-colors"
                style={{
                  background: "linear-gradient(145deg, rgba(27, 28, 28, 0.4) 0%, rgba(13, 14, 15, 0.8) 100%)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm font-bold text-[#bef227] bg-[#bef227]/10 px-2 py-1 rounded">
                      snip.to/{link.slug}
                    </span>
                    {link.disabled && (
                      <span className="text-xs uppercase font-bold text-muted-foreground border border-muted-foreground px-2 py-0.5 rounded">
                        Nonaktif
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate max-w-2xl">{link.url}</p>
                </div>
                <div className="flex items-center gap-6 md:gap-8 justify-between md:justify-end border-t border-[#222222] md:border-t-0 pt-4 md:pt-0">
                  <Link href={`/dashboard/${link.slug}`}>
                    <button className="p-2 text-muted-foreground hover:text-[#bef227] hover:bg-[#222222] rounded transition-colors flex items-center gap-1">
                      <BarChart3 className="w-4 h-4" />
                      <span className="text-sm">Analytics</span>
                    </button>
                  </Link>
                  <div className="text-right hidden sm:block">
                    <p className="font-mono text-sm text-muted-foreground">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground/50">Dibuat</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => openEditModal(link)}
                      className="p-2 text-muted-foreground hover:text-on-surface hover:bg-[#222222] rounded transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(link.id)}
                      className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && links.length > 0 && (
          <div className="mt-8 flex justify-center items-center gap-4">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 text-muted-foreground hover:text-on-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-on-surface">Halaman {page}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={links.length < 20}
              className="p-2 text-muted-foreground hover:text-on-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </main>

      {/* Edit Link Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={(open) => !isEditing && setIsEditModalOpen(open)}>
        <DialogContent className={`bg-[#0a0a0a]/95 backdrop-blur-xl border border-[#222222] text-on-surface shadow-[0_0_40px_-15px_rgba(190,242,39,0.15)] ${isEditing ? "[&>button]:pointer-events-none [&>button]:opacity-20" : ""}`}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-on-surface">Edit Link</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update the destination URL or toggle the link status.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface">Slug (tidak bisa diubah)</label>
              <div 
                className="flex items-center gap-2 bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-muted-foreground w-full select-all cursor-not-allowed relative"
                style={{
                  backgroundImage: "repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.03) 0px, rgba(255, 255, 255, 0.03) 10px, transparent 10px, transparent 20px)"
                }}
              >
                <Lock className="w-4 h-4 text-muted-foreground/45 shrink-0" />
                <span className="text-muted-foreground/30 font-mono select-none">snip.to/</span>
                <span className="text-muted-foreground/80 font-mono font-medium truncate flex-1 select-all">
                  {editingLink?.slug || ""}
                </span>
                <button
                  type="button"
                  onClick={handleCopySlug}
                  disabled={isEditing}
                  className="p-3 hover:bg-[#222222] rounded transition-colors text-muted-foreground hover:text-on-surface disabled:opacity-50 shrink-0"
                  title="Salin slug"
                >
                  {copiedSlug ? (
                    <Check className="w-5 h-5 text-[#bef227]" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface">Destination URL</label>
              <Input
                type="url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                disabled={isEditing}
                className="bg-[#0a0a0a] border border-[#222222] text-on-surface focus:border-[#bef227] focus:ring-1 focus:ring-[#bef227] disabled:opacity-50"
                placeholder="https://example.com"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={editDisabled}
                disabled={isEditing}
                onClick={() => setEditDisabled(!editDisabled)}
                className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#bef227] disabled:cursor-not-allowed disabled:opacity-50 ${
                  editDisabled ? "bg-[#bef227]" : "bg-zinc-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-7 w-7 rounded-full shadow-lg ring-0 transition-transform duration-200 ${
                    editDisabled ? "translate-x-[26px] bg-black" : "translate-x-0.5 bg-zinc-400"
                  }`}
                />
              </button>
              <span className="text-sm text-on-surface">
                Nonaktifkan link (redirect akan jadi 404)
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isEditing}
              className="border-[#222222] hover:bg-[#111111] uppercase tracking-wider text-xs font-semibold min-h-[44px]"
            >
              BATAL
            </Button>
            <Button
              onClick={handleEdit}
              disabled={isEditing}
              className="bg-[#bef227] text-black font-bold hover:bg-[#c0f42a] uppercase tracking-wider text-xs font-semibold min-h-[44px]"
            >
              {isEditing ? "MENYIMPAN..." : "SIMPAN PERUBAHAN"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => !isDeleting && setDeleteDialogOpen(open)}>
        <AlertDialogContent className="bg-[#0a0a0a]/95 backdrop-blur-xl border border-[#222222] shadow-[0_0_40px_-15px_rgba(220,38,38,0.15)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-on-surface">Hapus Link?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Link ini akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className="border-[#222222] hover:bg-[#111111]"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
