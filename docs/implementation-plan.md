# Implementation Plan — Snip
Version 1.0 | Mengikuti PRD v1.2

---

## Cara Pakai Dokumen Ini

- Kerjakan fase **berurutan**, jangan loncat — fase berikutnya butuh fondasi dari fase sebelumnya.
- Tiap fase punya **checklist task** dan **"Selesai Kalau"** (definisi done) — jangan lanjut kalau belum terpenuhi.
- Sumber kebenaran fitur & schema: `PRD.md`. Sumber kebenaran visual: `design-reference/` (hasil export Stitch + `DESIGN.md`).
- Di akhir tiap fase: tampilkan ringkasan, lalu tunggu konfirmasi sebelum lanjut.

---

## Progress Tracker

```
✅ Fase 1 — Fondasi & Setup
✅ Fase 2 — Struktur Folder & Layout Dasar
✅ Fase 3 — Database & Schema (Drizzle + Supabase)
⏭️ Fase 4 — Autentikasi (SKIP — MVP guest-only, lihat catatan)
✅ Fase 5 — Fitur Inti
✅ Fase 6 — Integrasi Eksternal & Polish
```

---

## FASE 1 — Fondasi & Setup

**Tasks:**
- [x] `npx create-next-app@latest` — Next.js 16, TypeScript, App Router, Tailwind v4
- [x] Install dependencies inti: `drizzle-orm`, `postgres`, `zod`, `react-hook-form`, `@hookform/resolvers`, `nanoid`, `qrcode`, `recharts`, `lucide-react`, `sonner`, `next-themes`
- [x] Install dev dependencies: `drizzle-kit` (vitest & playwright di FASE 6)
- [x] Init shadcn/ui (`npx shadcn@latest init`) — sesuaikan tema warna dengan `design-reference/DESIGN.md` (hitam + lime)
- [x] Generate komponen shadcn dasar: `button`, `input`, `card`, `dialog` (Sonner via package, bukan shadcn component)
- [x] Buat `.env.example` (placeholder `DATABASE_URL`, `SAFE_BROWSING_API_KEY`)
- [x] Cek `.gitignore` sudah exclude `.env`, `node_modules`, `.next`

**Selesai kalau:** `npm run dev` jalan tanpa error, halaman default Next.js tampil dengan tema dark+lime dari shadcn.

---

## FASE 2 — Struktur Folder & Layout Dasar

**Tasks:**
- [x] Buat struktur folder sesuai PRD section 9 (`middleware.ts`, `app/`, `drizzle/`, `components/`, `lib/`)
- [x] `app/layout.tsx` — root layout, dark mode default via `next-themes`, font Geist
- [x] Placeholder routes (kosong, belum ada logic): `app/page.tsx`, `app/dashboard/page.tsx`, `app/not-found.tsx`
- [x] Placeholder API routes: `app/api/shorten/route.ts`, `app/api/links/route.ts`, `app/api/analytics/[slug]/route.ts`, `app/api/report/route.ts`
- [x] `reserved-slugs.json` — isi daftar slug terlarang (`api`, `dashboard`, `admin`, `_next`, dll)

**Selesai kalau:** semua route bisa diakses (walau isinya placeholder), struktur folder match dengan PRD.

---

## FASE 3 — Database & Schema (Drizzle + Supabase)

**Tasks:**
- [x] `drizzle.config.ts` — koneksi ke `DATABASE_URL` Supabase
- [x] `drizzle/schema.ts` — table `links`, `clicks`, `reports` (copy persis dari PRD section 10)
- [x] `lib/db.ts` — Drizzle client pakai `postgres-js`
- [x] `npx drizzle-kit generate` lalu `npx drizzle-kit migrate` ke Supabase
- [x] Cek tabel benar-benar muncul di Supabase Table Editor

**Selesai kalau:** 3 tabel (`links`, `clicks`, `reports`) sudah ada di Supabase dan bisa di-query dari `lib/db.ts`.

---

## FASE 4 — Autentikasi

**STATUS: SKIP untuk MVP.**
Snip v1.0 guest-only (link disimpan per cookie anonim, bukan per akun). Auth (GitHub/Google login) baru masuk roadmap v2.0+ — lihat PRD section 7. Tidak perlu dikerjakan sekarang.

---

## FASE 5 — Fitur Inti

Urutan dipilih supaya tiap langkah bisa langsung ditest pakai data dari langkah sebelumnya.

### 5.1 — F-01 Shorten URL + F-06 (validasi & keamanan dasar)
- [x] `lib/validate-url.ts` — zod schema, tolak skema `javascript:`/`data:`/`file:`, tolak IP lokal/private
- [x] `lib/slug.ts` — generate slug `nanoid` 6 karakter + cek reserved slug
- [x] `lib/safe-browsing.ts` — wrapper Google Safe Browsing API
- [x] `lib/ratelimit.ts` — in-memory rate limiter per IP
- [x] `POST /api/shorten` — gabungkan semua validasi di atas, simpan ke tabel `links`
- [x] Homepage UI (`app/page.tsx`) — form shorten + result card, **sesuai `design-reference/homepage.html`**

**Selesai kalau:** submit URL di homepage → masuk ke DB, hasil short link muncul, URL berbahaya/skema aneh ditolak dengan pesan jelas.

### 5.2 — F-02 Redirect
- [x] `proxy.ts` — lookup slug di edge, redirect ke URL asli, cek flag `disabled`
- [x] `app/not-found.tsx` — halaman 404, **sesuai `design-reference/404.html`**

**Selesai kalau:** akses `/[slug]` redirect ke URL asli; slug nggak ada atau `disabled=true` → tampil 404.

### 5.3 — F-03 QR Code
- [x] `components/QRCode.tsx` — generate QR code pakai `qrcode`
- [x] Tombol download QR sebagai PNG di result card homepage

**Selesai kalau:** QR code muncul setelah shorten, dan bisa di-download, hasil scan-nya benar.

### 5.4 — F-05 Dashboard Link
- [x] `GET /api/links` — list link (filter by cookie anonim)
- [x] `PATCH /api/links/[id]` — edit destination URL (slug immutable) + toggle status aktif
- [x] `DELETE /api/links/[id]` — hapus link
- [x] `app/dashboard/page.tsx` — list card, search, pagination, **sesuai `design-reference/dashboard.html`**
- [x] Modal Edit Link — **sesuai `design-reference/edit-modal.html`**

**Selesai kalau:** dari dashboard bisa lihat semua link, edit destination URL, toggle aktif/nonaktif, dan hapus link.

**Selesai kalau:** dari dashboard bisa lihat semua link, edit destination URL, toggle aktif/nonaktif, dan hapus link.

### 5.5 — F-04 Analytics
- [x] `lib/hash-ip.ts` — SHA-256 hash IP + salt
- [x] Proxy.ts — record clicks in fire-and-forget manner
- [x] GET /api/analytics/[slug] — total clicks, clicksByDay for 7D/30D, ownership validation
- [x] app/dashboard/[slug]/page.tsx — analytics page dengan grafik, card info
- [x] Tambahkan tombol analytics per link di dashboard

**Selesai kalau:** setiap redirect tercatat sebagai klik, grafik menampilkan data klik harian yang benar, analytics link hanya bisa diakses oleh pemilik.

### 5.6 — F-06 (sisa) Report Abuse
- [x] `POST /api/report` — simpan laporan ke tabel `reports`
- [x] Link kecil "Laporkan link" di halaman 404 / homepage
- [x] Perbaikan error handling di dashboard analytics (pisahkan pesan 403 dan 404)

**Selesai kalau:** laporan tersimpan di tabel `reports`, terhubung ke `linkId` yang benar.

---

## FASE 6 — Integrasi Eksternal & Polish

**Tasks:**
- [x] Test Safe Browsing API end-to-end dengan URL test malware Google ([testsafebrowsing.appspot.com](https://testsafebrowsing.appspot.com))
- [x] Error handling global (toast error via Sonner di semua API call gagal)
- [x] Loading state & empty state UI (dashboard kosong, hasil shorten loading, dll)
- [x] Validasi konsisten client (`react-hook-form` + `zod`) dan server (schema yang sama)
- [x] Finalisasi `.env.example` — semua env var terdokumentasi
- [x] Open Source Readiness (PRD section 14): `LICENSE` (MIT), `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `.github/ISSUE_TEMPLATE/`, `.github/workflows/ci.yml` (lint, typecheck, build)
- [x] Unit test dasar (Vitest): validasi URL, generate slug, hash IP
- [x] E2E test dasar (Playwright): flow shorten → redirect → lihat analytics

**Selesai kalau:** repo siap di-push ke GitHub publik, CI hijau, README punya quickstart yang bisa diikuti orang lain dari nol.

---

*Dokumen ini living document — update checklist seiring progress development bareng Kilo Code.*