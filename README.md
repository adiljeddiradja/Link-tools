# 🚀 LinkManager (Linktree Clone + URL Shortener)

LinkManager adalah aplikasi manajemen link all-in-one yang memungkinkan Anda memendekkan URL, membuat QR Code otomatis, dan membangun halaman Bio (Linktree) kustom dengan banyak profil.

![Preview](https://img.shields.io/badge/Status-Ready_to_Host-success)
![Framework](https://img.shields.io/badge/Next.js-15-black)
![Database](https://img.shields.io/badge/Supabase-Auth_&_DB-emerald)

## ✨ Fitur Utama

- **🔗 URL Shortener**: Memendekkan link panjang dengan slug kustom.
- **🖼️ QR Code Generator**: Otomatis membuat QR Code berkualitas tinggi (High-Res) untuk setiap link.
- **📄 Multi-Profile Bio Pages**: Buat lebih dari satu halaman daftar link (seperti Linktree) dalam satu akun.
- **🎨 Custom Editor**: Sesuaikan nama, bio, foto, warna tema, dan gaya tombol secara real-time.
- **📱 Responsive UI**: Tampilan modern yang nyaman di desktop maupun handphone.
- **🔐 Secure Auth**: Sistem login, signup, dan reset password menggunakan Supabase Auth terbaru (@supabase/ssr).
- **🌗 Theme Toggle**: Mendukung mode Terang (Light) dan Gelap (Dark).

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **QR Engine**: [qrcode.react](https://www.npmjs.com/package/qrcode.react)

## 🚀 Persiapan Lokal (Local Setup)

1. **Clone project**:
   ```bash
   git clone <link-repo-anda>
   cd link-tool
   ```

2. **Install dependensi**:
   ```bash
   npm install
   ```

3. **Setting Environment Variables**:
   Buat file `.env.local` di root folder dan isi dengan kredensial Supabase Anda:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Jalankan aplikasi**:
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## 🗄️ Struktur Database (Supabase)

Pastikan Anda memiliki dua table ini di Supabase:

### Table: `profiles`
- `id`: uuid (primary key)
- `user_id`: uuid (references auth.users)
- `handle`: text (unique, misal: 'john-doe')
- `display_name`: text
- `bio`: text
- `avatar_url`: text
- `theme_color`: text (default: 'blue')
- `button_style`: text (default: 'rounded-xl')

### Table: `links`
- `id`: uuid (primary key)
- `user_id`: uuid (references auth.users)
- `profile_id`: uuid (references profiles.id, nullable)
- `original_url`: text
- `slug`: text (unique)
- `title`: text
- `is_for_bio`: boolean (default: false)

## 🌍 Hosting di Vercel

1. Hubungkan repository GitHub Anda ke **Vercel**.
2. Masukkan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` di tab Environment Variables.
3. Klik **Deploy**.
4. **PENTING**: Update **Site URL** dan **Redirect URL** di Dashboard Supabase (Settings > Auth) menggunakan URL aplikasi yang diberikan oleh Vercel.

---

Dibuat dengan ❤️ untuk manajemen link yang lebih mudah.
