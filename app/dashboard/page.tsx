"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
      const data = await response.json();
      setLinks(data.links || []);
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
        const data = await response.json();
        throw new Error(data.error || "Failed to update");
      }

      const data = await response.json();
      setLinks(links.map((l) => (l.id === editingLink.id ? data.link : l)));
      setIsEditModalOpen(false);
      toast.success("Link berhasil diperbarui");
    } catch (error: any) {
      toast.error(error.message || "Gagal memperbarui link");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLinks();
  };

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
              <Link href="/dashboard" className="text-sm text-[#bef227] font-bold">
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
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
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-[#0a0a0a] border border-[#222222] text-on-surface">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-on-surface">Edit Link</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update the destination URL or toggle the link status.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface">Slug (tidak bisa diubah)</label>
              <Input
                value={editingLink?.slug || ""}
                disabled
                className="bg-[#111111] border border-[#333333] text-muted-foreground cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface">Destination URL</label>
              <Input
                type="url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                className="bg-[#0a0a0a] border border-[#222222] text-on-surface focus:border-[#bef227] focus:ring-1 focus:ring-[#bef227]"
                placeholder="https://example.com"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="disabled"
                checked={editDisabled}
                onChange={(e) => setEditDisabled(e.target.checked)}
                className="w-4 h-4 rounded border-[#222222] bg-[#0a0a0a] text-[#bef227] focus:ring-[#bef227]"
              />
              <label htmlFor="disabled" className="text-sm text-on-surface">
                Nonaktifkan link (redirect akan jadi 404)
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="border-[#222222] hover:bg-[#111111]"
            >
              Batal
            </Button>
            <Button
              onClick={handleEdit}
              className="bg-[#bef227] text-black font-bold hover:bg-[#c0f42a]"
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#0a0a0a] border border-[#222222]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-on-surface">Hapus Link?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Link ini akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#222222] hover:bg-[#111111]">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
