# PRD — Snip
**Product Requirements Document**
Version 1.2 | June 2026 — *Updated after stack & security research + keputusan final stack*

---

## Changelog

| Area | v1.0 | v1.1 | v1.2 (final) |
|---|---|---|---|
| Framework | Next.js 14 | Next.js 16 | **Next.js 16** (tetap) |
| ORM | Prisma + SQLite | Prisma (Drizzle opsional) | **Drizzle ORM** (keputusan final) |
| Database | SQLite | Postgres/Turso disarankan untuk prod | **Supabase Postgres** (dev *dan* prod, satu sumber) |
| UI Library | Tidak disebut | shadcn/ui | **shadcn/ui** (tetap) |
| Keamanan | Tidak ada | Validasi URL, malicious-link scan, rate limiting, reserved slug | **Tetap**, API key Safe Browsing dikonfirmasi tidak butuh billing/kartu kredit |
| Redirect arch | Route handler biasa | Edge Middleware + cache | **Tetap** |
| Privacy | Simpan data klik mentah | IP di-hash | **Tetap** |
| Open source readiness | Tidak ada | LICENSE, CONTRIBUTING, CI, issue template | **Tetap** |
| Repo | `[username]/snip` | `github.com/ajiarl/Snip` | **Tetap** |
| Domain | — | Belum ditentukan | **Tetap belum ditentukan** |

---

## 1. Overview

**Snip** adalah aplikasi link shortener open source yang bisa di-self-host. Dibuat untuk semua orang yang butuh mempersingkat URL panjang, melacak klik, dan membagikan link dengan tampilan bersih dan profesional — tanpa mengorbankan keamanan atau privasi pengguna.

**Tagline:** *Shorten. Share. Track.*

**Repo:** `github.com/ajiarl/Snip`
**Lisensi:** MIT (rekomendasi — paling ramah untuk kontribusi & dipakai siapa saja)
**Domain produksi:** belum ditentukan, menyusul

---

## 2. Problem Statement

- URL panjang tidak enak dibagikan di WhatsApp, media sosial, atau presentasi.
- Layanan seperti bit.ly membatasi fitur di versi gratis dan menyimpan data di server mereka.
- Tidak ada alternatif open source yang simpel, ringan, dan bisa self-host dengan mudah.
- Banyak shortener (termasuk yang populer) tidak melakukan pengecekan keamanan sama sekali — link bisa dipakai untuk menyembunyikan tujuan phishing/malware karena domain shortener punya reputasi baik, sehingga lolos dari filter keamanan korporat. Snip mencoba jadi shortener yang transparan: setiap link discan sebelum dibuat.

---

## 3. Target Users

| User | Kebutuhan |
|---|---|
| Mahasiswa | Shorten link tugas, presentasi, portofolio |
| Content creator | Track klik link bio, promosi |
| Developer | Self-host, customisasi, kontribusi open source |
| UMKM | Link katalog produk yang pendek dan mudah diingat |

---

## 4. Goals & Success Metrics

**Goals:**
- Bisa dipakai siapapun tanpa daftar (guest mode)
- Self-hostable dalam < 5 menit (`docker compose up` atau deploy 1-klik ke Vercel)
- Open source dan mudah dikontribusi
- Aman secara default — tidak bisa disalahgunakan untuk redirect berbahaya

**Success Metrics (3 bulan pertama):**
- ⭐ 50+ GitHub stars
- 🔗 500+ link di-shorten (jika deploy public instance)
- 🐛 < 5 open critical bugs
- 🔒 0 laporan abuse yang tidak tertangani; 0 kerentanan kritikal di `npm audit`

---

## 5. Tech Stack

### Stack final

| Layer | Teknologi | Alasan |
|---|---|---|
| Framework | **Next.js 16** (App Router, Turbopack) | Versi 14 sudah EOL, 15 mendekati akhir dukungan; 16 adalah baseline saat ini |
| Bahasa | TypeScript | Type-safety untuk schema, API, dan komponen |
| UI Library | **shadcn/ui** (di atas Tailwind CSS v4 + Radix UI) | Komponen di-copy ke project (bukan dependency tertutup), mudah dikustom ke tema hitam/lime, aksesibel secara default |
| Icons | lucide-react | Pasangan standar shadcn/ui, ringan |
| Form & validasi | react-hook-form + zod | Validasi URL/slug di client *dan* server pakai schema yang sama |
| ORM | **Drizzle ORM** | Lebih ringan (~7KB), tanpa code-generation step, jalan native di edge runtime — cocok dengan arsitektur redirect-di-middleware di F-02 |
| Database | **Supabase Postgres** (free tier) | Satu database untuk dev *dan* prod — tidak perlu lagi pusing soal SQLite vs serverless filesystem (lihat catatan di bawah) |
| Slug generator | `nanoid` | Lebih standar untuk slug acak URL-safe dibanding cuid (cuid dipakai untuk ID internal saja) |
| QR Code | `qrcode` npm package | Tetap, sudah tepat |
| Charts (analytics) | Recharts | Untuk grafik klik harian di dashboard |
| Rate limiting | In-memory limiter sederhana (cukup untuk skala portofolio); upgrade ke Upstash Ratelimit kalau traffic naik | Cegah spam shorten & brute-force slug |
| Malicious URL check | Google Safe Browsing API (Lookup API v4/v5) | Gratis untuk non-commercial/open source use, **tidak butuh billing account/kartu kredit** — beda dengan API Google lain seperti Maps/Places yang mewajibkan billing aktif |
| Toast notification | Sonner | Feedback copy-link, error, dll |
| Testing | Vitest (unit) + Playwright (e2e) | Standar modern, ringan untuk project solo |
| Deployment | Vercel (managed) — DB tetap di Supabase baik untuk dev maupun prod | Konsisten, tidak ada lagi perbedaan setup lokal vs production |

### Kenapa Supabase, satu DB untuk semua environment

Karena keputusannya "pakai Supabase aja", Snip tidak perlu lagi membedakan dev (SQLite) vs prod (Postgres) seperti draft sebelumnya. Cukup satu project Supabase (gratis), dengan dua opsi koneksi:
- **Connection string langsung** (`postgresql://...`) untuk dipakai Drizzle di server — paling simpel untuk MVP
- **Supabase client SDK** (opsional, kalau nanti butuh fitur real-time/auth bawaan Supabase) — tidak wajib di MVP, Drizzle + connection string saja sudah cukup

Konsekuensinya: self-host Docker pun tetap konek ke Supabase cloud (bukan database lokal di container), jadi `docker-compose.yml` tidak perlu lagi service Postgres terpisah — cukup container aplikasi + `DATABASE_URL` mengarah ke Supabase.

### Referensi arsitektur

**Dub** — shortener open source paling mirip dengan Snip, pakai Next.js + Redis (Upstash) + analytics terpisah (Tinybird). Snip tidak perlu sekompleks itu di MVP, tapi pola "redirect lewat edge + cache" dari Dub relevan kalau Snip nanti naik skala.

---

## 6. Fitur MVP (v1.0)

### F-01 — Shorten URL
- Input URL panjang → generate slug pendek otomatis (6 karakter, `nanoid`, alfanumerik lowercase)
- Opsi custom slug (contoh: `snip.to/portofolio`)
- Validasi URL via zod: harus `http://` atau `https://`, **tolak** skema berbahaya (`javascript:`, `data:`, `file:`) untuk cegah XSS/SSRF
- **Reserved slug list** — slug seperti `api`, `dashboard`, `admin`, `_next`, dll otomatis ditolak agar tidak bentrok dengan route aplikasi
- Cek apakah URL sama sudah pernah di-shorten di session ini (opsional: tawarkan slug yang sudah ada)
- Copy to clipboard dengan 1 klik (pakai Web Share API juga untuk mobile)

### F-02 — Redirect
- `snip.to/[slug]` redirect ke URL asli
- Redirect lewat **Next.js Middleware** (edge), bukan API route biasa, supaya benar-benar cepat (<200ms) — lookup slug dari cache (KV/Redis) dengan fallback ke database
- Halaman 404 yang friendly kalau slug tidak ditemukan
- Tidak melakukan redirect kalau target sudah ditandai berbahaya oleh Safe Browsing check (lihat F-06)

### F-03 — QR Code
- Generate QR code otomatis untuk setiap link
- Download QR code sebagai PNG
- Preview QR di halaman hasil

### F-04 — Analytics Sederhana
- Hitung total klik per link
- Tampilkan kapan link dibuat dan kapan terakhir diklik
- Grafik klik harian sederhana (Recharts)
- **Privasi:** IP pengunjung di-hash (SHA-256 + salt) sebelum disimpan, bukan disimpan mentah — cukup untuk hitung "unique click" tanpa menyimpan data pribadi

### F-05 — Dashboard Link
- List semua link yang sudah dibuat (per session/browser, via cookie anonim)
- Hapus link
- **Edit destinasi URL** tanpa mengubah slug (dipindah dari "future" ke MVP karena effort-nya kecil tapi value-nya besar)
- Lihat analytics per link

### F-06 — Keamanan & Anti-Abuse *(baru di v1.1)*
- Setiap URL yang disubmit dicek ke **Google Safe Browsing Lookup API** (gratis, non-commercial) sebelum link dibuat
- **Rate limiting**: maksimal N request shorten per menit per IP (in-memory limiter untuk self-host kecil, Upstash Ratelimit kalau pakai Redis)
- Endpoint `/api/report` sederhana untuk melaporkan link yang disalahgunakan → admin bisa disable link tersebut manual (cukup flag `disabled` di DB untuk MVP, tanpa dashboard admin penuh)

---

## 7. Fitur Future (v2.0+)

- 🔐 Auth (login dengan GitHub/Google) — link tersimpan per akun
- 📊 Analytics lanjutan (referrer, device, negara — tanpa menyimpan data pribadi mentah)
- ⏰ Link expiry (link otomatis expired setelah X hari atau X klik)
- 🔒 Password-protected link
- 🌐 Custom domain support
- 📦 Bulk shorten (upload CSV)
- 🔌 API publik dengan API key + rate limiting per key
- 🖼️ Custom OG image / social preview saat link dibagikan ke Twitter/WhatsApp (bot dapat preview image, manusia tetap redirect ke URL asli)
- 🛠️ Dashboard admin penuh untuk moderasi link yang dilaporkan
- 🌍 Internationalization (UI multi-bahasa)

---

## 8. User Stories (MVP)

```
SEBAGAI guest user,
SAYA INGIN memasukkan URL panjang dan mendapatkan link pendek,
AGAR SAYA bisa membagikan link dengan mudah.

SEBAGAI guest user,
SAYA INGIN membuat custom slug,
AGAR link lebih mudah diingat (contoh: snip.to/cv-saya).

SEBAGAI guest user,
SAYA INGIN melihat QR code dari link saya,
AGAR bisa dibagikan dalam bentuk gambar atau presentasi.

SEBAGAI guest user,
SAYA INGIN melihat berapa kali link saya diklik,
AGAR tahu seberapa ramai link tersebut.

SEBAGAI guest user,
SAYA INGIN diberi tahu kalau URL yang saya masukkan terdeteksi berbahaya,
AGAR saya tidak tanpa sadar menyebarkan link phishing/malware.

SEBAGAI pengunjung publik,
SAYA INGIN melaporkan link yang mencurigakan,
AGAR platform tetap aman dipakai bersama.

SEBAGAI developer,
SAYA INGIN bisa self-host Snip dalam < 5 menit,
AGAR saya punya kontrol penuh atas data saya.
```

---

## 9. Arsitektur Aplikasi

```
snip/
├── proxy.ts                  ← ✨ BARU: redirect handler (Node.js runtime)
├── app/
│   ├── page.tsx              ← Homepage (form shorten)
│   ├── dashboard/
│   │   └── page.tsx          ← List semua link user
│   ├── not-found.tsx         ← 404 friendly untuk slug tidak ditemukan
│   └── api/
│       ├── shorten/
│       │   └── route.ts      ← POST: buat link baru (validasi + safe browsing check + rate limit)
│       ├── links/
│       │   └── route.ts      ← GET: list links, PATCH: edit URL, DELETE: hapus
│       ├── analytics/
│       │   └── [slug]/
│       │       └── route.ts  ← GET: data klik
│       └── report/
│           └── route.ts      ← ✨ BARU: POST laporan abuse
├── drizzle/
│   ├── schema.ts              ← Model Link, Click, Report (Drizzle schema)
│   └── migrations/            ← Hasil generate `drizzle-kit`
├── drizzle.config.ts          ← Config koneksi ke Supabase
├── components/
│   ├── ui/                   ← ✨ shadcn/ui generated components (button, input, card, dialog)
│   ├── ShortenForm.tsx
│   ├── LinkCard.tsx
│   ├── QRCode.tsx
│   └── AnalyticsChart.tsx
├── lib/
│   ├── db.ts                 ← Drizzle client (koneksi ke Supabase via `postgres-js`)
│   ├── slug.ts                ← Generate slug (nanoid) + reserved slug check
│   ├── validate-url.ts        ← ✨ Zod schema, blokir skema berbahaya
│   ├── safe-browsing.ts       ← ✨ Wrapper Google Safe Browsing API
│   ├── ratelimit.ts           ← ✨ Rate limiter (in-memory atau Upstash)
│   └── hash-ip.ts             ← ✨ Hash IP untuk privasi analytics
├── reserved-slugs.json        ← ✨ Daftar slug yang tidak boleh dipakai
├── .github/
│   ├── workflows/ci.yml       ← ✨ Lint + typecheck + build di setiap PR
│   └── ISSUE_TEMPLATE/
├── LICENSE                    ← ✨ MIT
├── CONTRIBUTING.md            ← ✨
└── .env.example                ← ✨
```

---

## 10. Database Schema

`drizzle/schema.ts` — target: Supabase Postgres

```typescript
import { pgTable, text, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const links = pgTable("links", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  url: text("url").notNull(),
  disabled: boolean("disabled").default(false).notNull(),   // ✨ flag kalau dilaporkan/terdeteksi berbahaya
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(), // ✨ untuk fitur edit URL
});

export const clicks = pgTable("clicks", {
  id: uuid("id").defaultRandom().primaryKey(),
  linkId: uuid("link_id").notNull().references(() => links.id, { onDelete: "cascade" }),
  ipHash: text("ip_hash"),                                   // ✨ SHA-256(IP + salt), bukan IP mentah
  clickedAt: timestamp("clicked_at").defaultNow().notNull(),
});

export const reports = pgTable("reports", {                  // ✨ baru — laporan abuse
  id: uuid("id").defaultRandom().primaryKey(),
  linkId: uuid("link_id").notNull().references(() => links.id, { onDelete: "cascade" }),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const linksRelations = relations(links, ({ many }) => ({
  clicks: many(clicks),
  reports: many(reports),
}));
```

Migrasi dijalankan dengan `npx drizzle-kit generate` lalu `npx drizzle-kit migrate`, mengarah ke `DATABASE_URL` Supabase yang sama baik di lokal maupun production — tidak ada lagi perbedaan schema antar environment.

---

## 11. UI/UX Notes

- **Warna:** Hitam + aksen hijau/lime (modern, developer-friendly) — diimplementasikan via CSS variables shadcn/ui supaya konsisten di semua komponen
- **Font:** Geist (default Next.js, sudah dioptimasi, tidak perlu setup tambahan)
- **Komponen:** shadcn/ui (`button`, `input`, `card`, `dialog`, `sonner` untuk toast) — di-generate via CLI, jadi kode komponen ada di repo (bukan dependency hitam-kotak)
- **Homepage:** Form besar di tengah, minimal, fokus ke action
- **Mobile-first:** semua fitur accessible di HP, termasuk Web Share API untuk share link/QR langsung dari HP
- **Dark mode:** default dark, toggle light (pakai `next-themes`)
- **Aksesibilitas:** otomatis lebih baik karena shadcn/ui dibangun di atas Radix UI (ARIA-compliant by default)

---

## 12. Keamanan & Privasi *(section baru)*

| Risiko | Mitigasi |
|---|---|
| URL berbahaya (phishing/malware) disembunyikan di balik short link | Cek setiap URL baru ke Google Safe Browsing API sebelum link dibuat |
| Spam/abuse — bot generate ribuan link | Rate limiting per IP di endpoint `/api/shorten` |
| Slug bentrok dengan route aplikasi (`/api`, `/dashboard`) | Reserved slug list, divalidasi sebelum slug disimpan |
| Open redirect / SSRF lewat skema URL aneh | Whitelist skema `http`/`https` saja, tolak `javascript:`, `data:`, `file:`, IP lokal/private (`127.0.0.1`, `169.254.x.x`, dll); validasi hostname via `new URL()` untuk menangkap representasi integer/hex/IPv6 |
| DNS Rebinding — domain publik yang berhasil dibuat saat shorten (karena hostname terlihat publik), namun kemudian DNS A Record-nya diubah attacker menjadi IP private (e.g. `127.0.0.1`) sehingga browser korban meng-akses endpoint internal saat klik redirect | **Accepted Risk / Known Limitation.** Validasi hostname dilakukan sekali saat link dibuat; tidak ada re-validasi DNS saat redirect di `proxy.ts` karena akan menambah latensi signifikan di setiap klik. Mitigasi parsial: Google Safe Browsing dapat mendeteksi domain yang diketahui melakukan DNS rebinding aktif. Penanganan penuh memerlukan TTL-based re-check atau interstitial warning page — di luar scope MVP. |
| Data pribadi pengunjung (IP) tersimpan tanpa consent | Hash IP (SHA-256 + salt) sebelum disimpan, jangan simpan IP mentah |
| Link berbahaya lolos scan awal (database threat berubah setiap saat) | Endpoint report abuse + flag `disabled` manual oleh maintainer |

> Catatan: Google Safe Browsing API resmi berlabel **gratis untuk non-commercial use** — ini cocok untuk Snip karena open source dan tidak dijual. Kalau suatu saat Snip dikomersialkan, perlu pindah ke Web Risk API (berbayar).

---

## 13. Testing & QA

- **Unit test** (Vitest): logic validasi URL, generate slug, reserved slug check, hash IP
- **E2E test** (Playwright): flow shorten → redirect → lihat analytics
- **CI** (`.github/workflows/ci.yml`): jalan `lint`, `typecheck`, `build`, dan test di setiap PR — penting untuk project open source supaya kontributor luar tidak gampang merusak `main`

---

## 14. Open Source Readiness Checklist *(baru)*

Supaya target "50+ GitHub stars & mudah dikontribusi" realistis, repo butuh:

- [ ] `LICENSE` — MIT (paling permisif, paling umum dipakai untuk project portofolio)
- [ ] `README.md` — badge build status, screenshot, quickstart, demo link
- [ ] `CONTRIBUTING.md` — cara setup lokal, coding convention, cara submit PR
- [ ] `CODE_OF_CONDUCT.md` — standar untuk project komunitas
- [ ] `.github/ISSUE_TEMPLATE/` — template bug report & feature request
- [ ] `.env.example` — semua env var didokumentasikan (DATABASE_URL, SAFE_BROWSING_API_KEY, dll)
- [ ] GitHub Actions CI — lint, typecheck, build otomatis

---

## 15. Deployment Guide (README)

### Setup Supabase (sekali saja, dipakai untuk dev *dan* prod)

1. Buka [supabase.com](https://supabase.com) → buat akun (gratis, tidak butuh kartu kredit) → New Project
2. Setelah project jadi, buka **Project Settings → Database → Connection String** → pilih mode `URI`
3. Copy connection string-nya, ini yang jadi `DATABASE_URL`

### Setup Google Safe Browsing API key (sekali saja)

1. Buka [console.cloud.google.com](https://console.cloud.google.com) → buat project baru (boleh pakai akun Google biasa)
2. **APIs & Services → Library** → cari "Safe Browsing API" → Enable
3. **APIs & Services → Credentials** → Create Credentials → API Key → copy key-nya
4. Tidak perlu mengaktifkan billing/kartu kredit untuk API ini — beda dengan Vertex AI atau Maps API yang mewajibkan billing account aktif

### Clone & jalankan

```bash
# Clone
git clone https://github.com/ajiarl/Snip
cd Snip

# Install
npm install

# Setup .env
cp .env.example .env
# isi DATABASE_URL (connection string Supabase) dan SAFE_BROWSING_API_KEY

# Migrate schema ke Supabase
npx drizzle-kit migrate

# Run lokal
npm run dev
```

### Deploy ke Vercel

1 klik via GitHub integration. Tambahkan `DATABASE_URL` dan `SAFE_BROWSING_API_KEY` yang sama di environment variables Vercel — karena DB-nya sama-sama Supabase, tidak ada perbedaan konfigurasi antara lokal dan production.

### Self-host (Docker, opsional)

```bash
git clone https://github.com/ajiarl/Snip
cd Snip
docker compose up -d
```

`docker-compose.yml` cukup berisi container aplikasi (tidak perlu container database terpisah) — `DATABASE_URL` di `.env` tetap mengarah ke Supabase cloud yang sama.

---

*PRD ini adalah living document — akan diupdate seiring development.*