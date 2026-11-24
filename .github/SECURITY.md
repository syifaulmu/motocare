# Kebijakan Keamanan (Security Policy) 🔒

Keamanan pengguna dan perlindungan data kendaraan adalah prioritas utama dalam pengembangan **MotoCare**.

---

## 🛡️ Model Keamanan (Security & Threat Model)

Aplikasi MotoCare dirancang dengan prinsip **Zero Trust on Input** dan **Offline-First Sandboxing**:

1. **Isolasi Filesystem WebView**:
   - `setAllowFileAccess(false)` dan `setAllowContentAccess(false)` diaktifkan pada WebView native. Aplikasi tidak memiliki akses ke penyimpanan berkas lokal sembarangan atau Content Provider di luar aset bawaan (`file:///android_asset/`).
2. **Sanitasi Data Pengguna (XSS Prevention)**:
   - Seluruh data teks pengguna (nama motor, plat nomor, catatan servis, bensin) disanitasi menggunakan `escapeHtml()` sebelum dirender ke DOM.
   - Content Security Policy (CSP) mengunci eksekusi skrip inline dan memblokir evaluasi dinamis (`eval()`).
3. **Validasi JS Bridge (@JavascriptInterface)**:
   - Setiap parameter yang dikirim melalui jembatan JavaScript Android divalidasi panjang maksimal, pembersihan karakter kendali, dan batas nilai numerik sebelum dieksekusi oleh native OS.
4. **Resiliensi Notifikasi & Izin Alarm**:
   - Pengecekan izin exact alarm (`canScheduleExactAlarms()`) pada Android 12+ dengan fallback anggun tanpa crash.

---

## 📢 Pelaporan Kerentanan (Reporting a Vulnerability)

Jika Anda menemukan celah keamanan (*vulnerability*) pada MotoCare:
1. **Jangan publikasikan di Issue publik.**
2. Silakan laporkan secara privat melalui fitur **GitHub Private Vulnerability Reporting** di tab *Security* repositori ini, atau hubungi maintainer langsung melalui profil pengembang.
3. Sertakan langkah detail untuk mereproduksi temuan, perkiraan dampak, serta usulan solusi perbaikan jika ada.
4. Maintainer akan merespons dalam waktu 1x48 jam untuk memverifikasi dan menyiapkan patch rilis perbaikan.
