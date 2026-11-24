# Panduan Kontribusi MotoCare (CONTRIBUTING) 🛵

Terima kasih atas ketertarikan Anda untuk berkontribusi pada pengembangan **MotoCare** — aplikasi monitoring dan perawatan motor roda dua untuk masyarakat Indonesia!

Dokumen ini menjelaskan alur kerja, standar kode, cara build, pengujian, serta aturan pembuatan *Pull Request* (PR).

---

## 📋 Daftar Isi
1. [Prasyarat Lingkungan Pengembangan](#prasyarat-lingkungan-pengembangan)
2. [Struktur Proyek](#struktur-proyek)
3. [Alur Pengembangan Lokal](#alur-pengembangan-lokal)
   - [Instalasi Dependensi](#1-instalasi-dependensi)
   - [Membangun Bundle Frontend](#2-membangun-bundle-frontend)
   - [Menjalankan Unit Test](#3-menjalankan-unit-test)
   - [Pengecekan Linter & Format](#4-pengecekan-linter--format)
   - [Kompilasi Aplikasi Android](#5-kompilasi-aplikasi-android)
4. [Aturan Pembuatan Pull Request (PR)](#aturan-pembuatan-pull-request-pr)
5. [Standar Keamanan Kode](#standar-keamanan-kode)

---

## 💻 Prasyarat Lingkungan Pengembangan

Pastikan perangkat Anda memiliki:
- **Node.js**: v20.0 atau lebih baru (direkomendasikan v22 LTS) & npm v10+.
- **Java Development Kit (JDK)**: Temurin / OpenJDK 17.
- **Android SDK**: `compileSdk 34`, `targetSdk 34`, `minSdk 24` (Android Studio Koala / Ladybug atau Android CLI command-line tools).
- **Git**: v2.30+.

---

## 📂 Struktur Proyek

```
motocare/
├── .github/
│   ├── workflows/ci.yml       # Pipeline otomatis GitHub Actions
│   ├── dependabot.yml         # Pembaruan dependensi otomatis
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/        # Template pelaporan bug & request fitur
├── app/                       # Modul Native Android (Java)
│   ├── src/main/java/         # MainActivity, BootReceiver, WorkManager, AlarmReceiver
│   ├── src/main/assets/       # Salinan runtime aset Web SPA untuk WebView Android
│   └── build.gradle
├── assets/                    # Kode Sumber Web SPA (Single Page Application)
│   ├── modules/               # Modul mandiri (Single Responsibility):
│   │   ├── event_bus.js       # Pub/Sub observer terpusat
│   │   ├── utils.js           # Sanitasi XSS & kontrol UI modal
│   │   ├── storage.js         # Abstraksi IndexedDB & migrasi skema
│   │   ├── state.js           # Central Store & action dispatchers
│   │   ├── notifications.js   # Evaluasi notifikasi jatuh tempo & overdue
│   │   ├── fuel.js            # Modul BBM & statistik km/L
│   │   ├── service.js         # 15 komponen, riwayat servis, & checklist
│   │   ├── wizard.js          # Wizard tambah motor & preset model
│   │   ├── camera.js          # Live camera visual check
│   │   ├── gemini.js          # Prompt generator Google Gemini AI
│   │   ├── render.js          # Orkestrasi render reaktif DOM
│   │   └── app.js             # Bootstrap & navigasi tab
│   ├── moto_logic.js          # Logika murni perhitungan BBM, status, pajak, & validasi
│   ├── data.js                # Database preset 34+ motor & spesifikasi pabrikan
│   └── style.css              # Desain antarmuka Retro-Automotive
├── scripts/
│   └── build_bundle.js        # Bundler otomatis assets/modules/ -> app.js
├── tests/                     # Unit test suite (Vitest)
├── package.json
└── README.md
```

---

## 🚀 Alur Pengembangan Lokal

### 1. Instalasi Dependensi
```bash
git clone https://github.com/syifaulmu/motocare.git
cd motocare
npm install
```

### 2. Membangun Bundle Frontend
Setiap kali Anda mengubah berkas di dalam `assets/modules/` atau `assets/moto_logic.js`, jalankan bundler untuk menyinkronkan berkas ke `assets/app.js` dan aset runtime Android (`app/src/main/assets/`):
```bash
npm run build
```

### 3. Menjalankan Unit Test
Semua logika bisnis murni, sanitasi keamanan XSS, abstraksi penyimpanan, dan interaksi event bus dilindungi oleh test otomatis:
```bash
# Menjalankan seluruh test suite (77 tests)
npm test

# Menjalankan test dengan laporan code coverage (Target: >= 80% coverage)
npm run test:coverage
```

### 4. Pengecekan Linter & Format
Sebelum mengajukan perubahan, pastikan kode mematuhi standar linter dan format:
```bash
# Pengecekan ESLint (wajib lolos 0 errors)
npm run lint

# Memeriksa format Prettier
npm run format:check

# Merapikan format kode secara otomatis
npm run format
```

### 5. Kompilasi Aplikasi Android
Untuk memvalidasi bahwa aplikasi Android dapat di-compile dengan sukses:
```bash
# Di Linux/macOS
./gradlew assembleDebug

# Di Windows PowerShell
./gradlew assembleDebug
```
Berkas debug APK akan dihasilkan pada: `app/build/outputs/apk/debug/app-debug.apk` (diabaikan oleh git).

---

## 🔀 Aturan Pembuatan Pull Request (PR)

1. **Gunakan Branch Terpisah**:
   - Fitur baru: `feat/nama-fitur`
   - Perbaikan bug: `fix/deskripsi-bug`
   - Dokumentasi: `docs/nama-dokumen`
2. **Format Pesan Commit (Conventional Commits)**:
   - `feat: tambah template motor Suzuki Burgman 125`
   - `fix: koreksi validasi volume liter bensin negatif`
   - `test: tambah kasus batas odometer nol pada calculateFuelStats`
   - `docs: perbarui panduan pengujian Doze mode via adb`
3. **Checklist Wajib Sebelum Membuka PR**:
   - [ ] Menjalankan `npm run build` dan memastikan output terkompilasi rapi.
   - [ ] Menjalankan `npm test` dan seluruh test lulus (100% pass).
   - [ ] Menjalankan `npm run lint` dan tidak ada error (`0 errors`).
   - [ ] Tidak ada berkas binary (`*.apk`, `*.aab`, `*.keystore`) yang ikut ter-commit.
   - [ ] Tidak ada data sensitif, API secret, atau token yang di-hardcode.

---

## 🔒 Standar Keamanan Kode

1. **Pencegahan XSS**:
   - Hindari penggunaan `innerHTML` secara langsung untuk data dinamis pengguna (nama motor, plat nomor, catatan servis).
   - Selalu gunakan `escapeHtml(string)` atau manipulasi DOM aman via `textContent` dan `createElement()`.
2. **Validasi Input JS Bridge**:
   - Semua input yang melintasi `@JavascriptInterface` antara WebView dan native Android harus divalidasi panjang maksimal (*length constraint*) dan sanitasi karakter.
3. **Offline-First & Sandbox**:
   - Fitur utama aplikasi harus tetap dapat dioperasikan 100% secara lokal tanpa bergantung pada koneksi internet.
   - Jangan menyalakan akses filesystem bebas (`setAllowFileAccess(true)`) atau skema lintas-origin tidak aman pada WebView.
