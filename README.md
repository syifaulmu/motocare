# 🛵 MotoCare — Aplikasi Perawatan & Monitoring Motor Roda Dua Indonesia

Aplikasi Android khusus kendaraan roda dua untuk masyarakat Indonesia: memantau konsumsi BBM (rasio km/L), menjadwalkan servis berkala 15 komponen, pengingat pajak STNK, pemeriksaan fisik live kamera, pintasan diagnosa Gemini AI, dan notifikasi layar HP.

---

## 📥 Download Aplikasi (APK)

| File | Ukuran | Status | Tautan Unduh |
|---|---|---|---|
| **MotoCare v2.0 APK** | ~5.35 MB | ✅ Rilis Resmi (Signed) | [**Download MotoCare_v2.0.apk**](https://github.com/syifaulmu/motocare/raw/main/release/MotoCare_v2.0.apk) |

> **Cara Pasang di HP Android:**
> 1. Unduh file `MotoCare_v2.0.apk` di atas ke ponsel Anda.
> 2. Buka notifikasi unduhan selesai, lalu pilih **Install**.
> 3. Jika muncul konfirmasi *"Izinkan instalasi dari sumber tidak dikenal"*, aktifkan izin untuk browser/file manager Anda.

---

## 🌟 Fitur Unggulan Versi 2.0

- 🛵 **Default Awal Bersih**: Siap digunakan langsung oleh masyarakat umum. Cukup tap tombol *"Tambah Motor"* untuk mendaftarkan motor pertama Anda.
- 📚 **34+ Database Motor Populer Indonesia**:
  - **Honda Matic**: BeAT eSP, BeAT Street, Scoopy, Vario 110, Vario 125, Vario 160, ADV 160, PCX 160, Genio.
  - **Yamaha Matic**: Mio M3, Mio S, Gear 125, NMAX 155 (Gen 1 Old, Gen 2, Gen 3 2024), Aerox 155, Fazzio, FreeGo.
  - **Honda Sport/Bebek/Trail**: Supra GTR 150, CB150R Streetfire, CB150 Verza, CRF150L, XL150 Dax.
  - **Yamaha Sport/Bebek**: MX King 150, XSR 155, WR155R, R15 V3.
  - **Suzuki & Kawasaki**: Address, Nex II, Burgman Street 125, KLX 150, W175.
  - **Motor Kustom**: Template fleksibel untuk sepeda motor merek apa pun.
- 🎨 **Desain Halus Retro-Automotive & Tema Ganda**:
  - 🌙 **Tema Gelap (Retro Noir Amber)**: Nuansa instrumen speedometer malam hari.
  - ☀️ **Tema Terang (Classic Vintage Cream)**: Tampilan krem hangat yang ramah di bawah terik matahari.
- ⛽ **Pencatatan BBM & Rasio Konsumsi (km/L)**:
  - Metode *full-to-full* akurat.
  - Pilihan 11 jenis bahan bakar di Indonesia (Pertalite, Pertamax, Turbo, Shell, BP, Vivo).
- 🔧 **Pemantauan 15 Komponen Servis Pintar**:
  - Dinamis menyesuaikan jenis motor (motor matic memantau V-Belt/Roller/Oli Gardan; motor sport/bebek memantau pelumasan & setelan rantai).
  - Algoritma **Estimasi Siklus Ideal Pabrikan** untuk motor second / tanpa data awal.
- 📹 **Cek Fisik Kamera Live**: Pemeriksaan kasat mata dengan retikel panduan visual (ban, rembesan oli, rantai/belt, suspensi).
- ✨ **Pintasan Gemini AI Diagnostik**: Menganalisis gejala kerusakan motor dengan generator prompt otomatis sesuai metadata motor Anda.
- 🔔 **Notifikasi Layar HP**: Pengingat persiapan jarak ideal (oli mesin sisa 350 km, V-belt sisa 2.000 km, pajak H-30/14/7) serta peringatan harian jika melewati batas aman (dapat diaktifkan/dinonaktifkan).

---

## 🛠️ Build dari Source Code

Proyek ini menggunakan Gradle native Android:

```bash
git clone https://github.com/syifaulmu/motocare.git
cd motocare
./gradlew assembleDebug
```

File APK hasil build akan berada di `app/build/outputs/apk/debug/app-debug.apk`.

---

## 📄 Lisensi
Didistribusikan di bawah Lisensi MIT. Bebas digunakan, dipelajari, dan dikembangkan oleh komunitas roda dua Indonesia.
