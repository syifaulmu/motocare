## 📌 Deskripsi Perubahan
<!-- Jelaskan secara ringkas perubahan apa yang Anda buat dan motivasi di baliknya. -->

Fixes #(issue)

## 🔍 Tipe Perubahan
- [ ] 🐛 Perbaikan Bug (Bug fix non-breaking)
- [ ] ✨ Fitur Baru (New feature non-breaking)
- [ ] ♻️ Refactoring / Peningkatan Arsitektur
- [ ] 📝 Dokumentasi
- [ ] 🧪 Penambahan / Pembaruan Unit Test
- [ ] ⚡ Optimasi Performa

---

## 🔒 Checklist Keamanan (Security Checklist)
- [ ] **Tidak ada binary artefak**: Tidak ada file `*.apk`, `*.aab`, `*.jks`, atau `*.idsig` yang ikut ter-commit.
- [ ] **Tidak ada rahasia (No hardcoded secrets)**: Tidak ada API token, password, atau secret pribadi yang di-commit.
- [ ] **Pencegahan XSS**: Data input pengguna (nama motor, plat, catatan) disanitasi menggunakan `escapeHtml()` atau `textContent`.
- [ ] **Validasi JS Bridge**: Parameter pada `@JavascriptInterface` divalidasi tipe, panjang, dan batas nilainya.
- [ ] **Offline-first terjamin**: Aplikasi tetap berfungsi penuh secara offline dari `file:///android_asset/`.
- [ ] **CSP compliant**: Tidak ada penambahan inline script atau evaluasi `eval()`.

---

## 🧪 Checklist Pengujian & Kualitas Kode
- [ ] Menjalankan `npm run build` dengan sukses.
- [ ] Menjalankan `npm run lint` tanpa error (`0 errors`).
- [ ] Menjalankan `npm test` dan seluruh unit test lulus (`100% pass`).
- [ ] Menjalankan `npm run test:coverage` (coverage fungsi inti tetap >= 80%).
- [ ] `./gradlew assembleDebug` berhasil dikompilasi tanpa kegagalan build.

---

## 📸 Tangkapan Layar / Bukti Uji (Opsional)
<!-- Jika perubahan mempengaruhi tampilan UI, sertakan screenshot sebelum & sesudah. -->
