/**
 * MotoCare v2.0 - Accessibility & ARIA Markup Automation Script
 */
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const INDEX_V2 = path.join(ROOT_DIR, 'assets', 'index_v2.html');
const INDEX_MAIN = path.join(ROOT_DIR, 'assets', 'index.html');

let html = fs.readFileSync(INDEX_V2, 'utf8');

// 1. Settings Data link rows role & tabindex
html = html.replace(
    /<div class="settings-link-row" id="btn-export-json">/g,
    '<div class="settings-link-row" id="btn-export-json" role="button" tabindex="0" aria-label="Export Data ke File JSON">'
);
html = html.replace(
    /<div class="settings-link-row" id="btn-import-json">/g,
    '<div class="settings-link-row" id="btn-import-json" role="button" tabindex="0" aria-label="Import Data dari File JSON">'
);
html = html.replace(
    /<div class="settings-link-row" id="btn-reset-data" style="color: var\(--status-crit-text\);">/g,
    '<div class="settings-link-row" id="btn-reset-data" role="button" tabindex="0" aria-label="Reset Semua Data Aplikasi" style="color: var(--status-crit-text);">'
);

// 2. Baseline Motor Select & button
html = html.replace(
    /<label class="form-label">Pilih Motor<\/label>\s*<select class="form-select" id="baseline-motor-select">/g,
    '<label class="form-label" for="baseline-motor-select">Pilih Motor</label>\n        <select class="form-select" id="baseline-motor-select" aria-label="Pilih Motor untuk Baseline">'
);
html = html.replace(
    /<button class="retro-btn retro-btn-primary retro-btn-full mt-8" id="btn-simpan-baseline">Simpan Baseline<\/button>/g,
    '<button class="retro-btn retro-btn-primary retro-btn-full mt-8" id="btn-simpan-baseline" aria-label="Simpan Pengaturan Baseline">Simpan Baseline</button>'
);

// 3. GitHub Link in About
html = html.replace(
    /<a href="https:\/\/github\.com" target="_blank" rel="noopener" class="retro-btn retro-btn-outline retro-btn-sm">/g,
    '<a href="https://github.com" target="_blank" rel="noopener" class="retro-btn retro-btn-outline retro-btn-sm" aria-label="Buka repository MotoCare di GitHub">'
);

// 4. Bottom Navigation & Tab items
html = html.replace(
    /<nav class="bottom-nav" id="bottom-nav">/g,
    '<nav class="bottom-nav" id="bottom-nav" role="navigation" aria-label="Navigasi Menu Utama">'
);
html = html.replace(
    /<button class="nav-item active" data-tab="beranda">/g,
    '<button class="nav-item active" data-tab="beranda" aria-label="Tab Beranda">'
);
html = html.replace(
    /<button class="nav-item" data-tab="motorku">/g,
    '<button class="nav-item" data-tab="motorku" aria-label="Tab Motorku">'
);
html = html.replace(
    /<button class="nav-item" data-tab="bbm">/g,
    '<button class="nav-item" data-tab="bbm" aria-label="Tab BBM">'
);
html = html.replace(
    /<button class="nav-item" data-tab="servis">/g,
    '<button class="nav-item" data-tab="servis" aria-label="Tab Servis">'
);
html = html.replace(
    /<button class="nav-item" data-tab="pengaturan">/g,
    '<button class="nav-item" data-tab="pengaturan" aria-label="Tab Pengaturan">'
);

// 5. FAB Add Motor
html = html.replace(
    /<button class="fab-btn" id="fab-add-motor" title="Tambah Motor" style="display:none;">/g,
    '<button class="fab-btn" id="fab-add-motor" title="Tambah Motor" aria-label="Tambah Motor Baru" style="display:none;">'
);

// 6. Modal handles aria-hidden
html = html.replace(/<div class="modal-handle"><\/div>/g, '<div class="modal-handle" aria-hidden="true"></div>');

// 7. Form Motor: labels for & error spans
html = html.replace(
    /<label class="form-label">1\. Merek Motor<\/label>\s*<select class="form-select" id="motor-brand">/g,
    '<label class="form-label" for="motor-brand">1. Merek Motor</label>\n        <select class="form-select" id="motor-brand" aria-label="1. Merek Motor">\n        <span class="form-error" id="err-motor-brand" role="alert"></span>'
);
html = html.replace(
    /<label class="form-label">2\. Model Motor \(Preset Pabrikan\)<\/label>\s*<select class="form-select" id="motor-model">/g,
    '<label class="form-label" for="motor-model">2. Model Motor (Preset Pabrikan)</label>\n        <select class="form-select" id="motor-model" aria-label="2. Model Motor (Preset Pabrikan)">\n        <span class="form-error" id="err-motor-model" role="alert"></span>'
);
html = html.replace(
    /<label class="form-label">Ketik Nama Model Motor<\/label>\s*<input type="text" class="form-input" id="motor-custom-model" placeholder="Contoh: Honda CB400SF \/ Vespa Sprint" \/>/g,
    '<label class="form-label" for="motor-custom-model">Ketik Nama Model Motor</label>\n        <input type="text" class="form-input" id="motor-custom-model" placeholder="Contoh: Honda CB400SF / Vespa Sprint" />\n        <span class="form-error" id="err-motor-custom-model" role="alert"></span>'
);
html = html.replace(
    /<label class="form-label">3\. Nama Panggilan Motor<\/label>\s*<input type="text" class="form-input" id="motor-nickname" placeholder="Contoh: Vario 110 Saya \/ NMAX Harian" \/>/g,
    '<label class="form-label" for="motor-nickname">3. Nama Panggilan Motor</label>\n        <input type="text" class="form-input" id="motor-nickname" placeholder="Contoh: Vario 110 Saya / NMAX Harian" />\n        <span class="form-error" id="err-motor-nickname" role="alert"></span>'
);
html = html.replace(
    /<label class="form-label">Tahun<\/label>\s*<input type="number" class="form-input" id="motor-year" placeholder="2022" min="1990" max="2030" value="2022" \/>/g,
    '<label class="form-label" for="motor-year">Tahun</label>\n          <input type="number" class="form-input" id="motor-year" placeholder="2022" min="1990" max="2030" value="2022" />\n          <span class="form-error" id="err-motor-year" role="alert"></span>'
);
html = html.replace(
    /<label class="form-label">No\. Plat<\/label>\s*<input type="text" class="form-input" id="motor-plate" placeholder="B 1234 ABC" style="text-transform:uppercase;" \/>/g,
    '<label class="form-label" for="motor-plate">No. Plat</label>\n          <input type="text" class="form-input" id="motor-plate" placeholder="B 1234 ABC" style="text-transform:uppercase;" />\n          <span class="form-error" id="err-motor-plate" role="alert"></span>'
);
html = html.replace(
    /<label class="form-label">4\. Odometer Saat Ini \(KM\)<\/label>\s*<input type="number" class="form-input" id="motor-odo" placeholder="Contoh: 15000" min="0" value="0" \/>/g,
    '<label class="form-label" for="motor-odo">4. Odometer Saat Ini (KM)</label>\n        <input type="number" class="form-input" id="motor-odo" placeholder="Contoh: 15000" min="0" value="0" />\n        <span class="form-error" id="err-motor-odo" role="alert"></span>'
);
html = html.replace(
    /<label class="form-label">Catatan Tambahan \(Opsional\)<\/label>\s*<input type="text" class="form-input" id="motor-notes" placeholder="Contoh: Dipakai harian kantor, kondisi bagus" \/>/g,
    '<label class="form-label" for="motor-notes">Catatan Tambahan (Opsional)</label>\n        <input type="text" class="form-input" id="motor-notes" placeholder="Contoh: Dipakai harian kantor, kondisi bagus" />\n        <span class="form-error" id="err-motor-notes" role="alert"></span>'
);
html = html.replace(
    /<button type="button" class="retro-btn flex-1" id="btn-modal-motor-cancel">Batal<\/button>/g,
    '<button type="button" class="retro-btn flex-1" id="btn-modal-motor-cancel" aria-label="Batal tambah motor">Batal</button>'
);
html = html.replace(
    /<button type="submit" class="retro-btn retro-btn-primary flex-1" id="btn-modal-motor-save">/g,
    '<button type="submit" class="retro-btn retro-btn-primary flex-1" id="btn-modal-motor-save" aria-label="Simpan data motor">'
);

// 8. Form Odometer
html = html.replace(
    /<label class="form-label">Odometer Sekarang \(km\)<\/label>\s*<input type="number" class="form-input" id="odo-input"/g,
    '<label class="form-label" for="odo-input">Odometer Sekarang (km)</label>\n        <input type="number" class="form-input" id="odo-input"'
);
html = html.replace(
    /(<input type="number" class="form-input" id="odo-input"[^>]*>)/g,
    '$1\n        <span class="form-error" id="err-odo-input" role="alert"></span>'
);
html = html.replace(
    /<label class="form-label">Tanggal<\/label>\s*<input type="date" class="form-input" id="odo-date" required>/g,
    '<label class="form-label" for="odo-date">Tanggal</label>\n        <input type="date" class="form-input" id="odo-date" required>\n        <span class="form-error" id="err-odo-date" role="alert"></span>'
);
html = html.replace(
    /<button type="button" class="retro-btn flex-1" id="btn-modal-odo-cancel">Batal<\/button>/g,
    '<button type="button" class="retro-btn flex-1" id="btn-modal-odo-cancel" aria-label="Batal update odometer">Batal</button>'
);

// 9. Form Ganti Komponen
html = html.replace(
    /<label class="form-label">Komponen<\/label>\s*<input type="text" class="form-input" id="ganti-komp-name"/g,
    '<label class="form-label" for="ganti-komp-name">Komponen</label>\n        <input type="text" class="form-input" id="ganti-komp-name"'
);
html = html.replace(
    /<label class="form-label">Odometer Saat Ganti \(km\)<\/label>\s*<input type="number" class="form-input" id="ganti-komp-odo" placeholder="0" min="0" required>/g,
    '<label class="form-label" for="ganti-komp-odo">Odometer Saat Ganti (km)</label>\n          <input type="number" class="form-input" id="ganti-komp-odo" placeholder="0" min="0" required>\n          <span class="form-error" id="err-ganti-komp-odo" role="alert"></span>'
);
html = html.replace(
    /<label class="form-label">Tanggal<\/label>\s*<input type="date" class="form-input" id="ganti-komp-date" required>/g,
    '<label class="form-label" for="ganti-komp-date">Tanggal</label>\n          <input type="date" class="form-input" id="ganti-komp-date" required>\n          <span class="form-error" id="err-ganti-komp-date" role="alert"></span>'
);
html = html.replace(
    /<label class="form-label">Biaya \(Rp\)<\/label>\s*<input type="number" class="form-input" id="ganti-komp-biaya" placeholder="0" min="0">/g,
    '<label class="form-label" for="ganti-komp-biaya">Biaya (Rp)</label>\n        <input type="number" class="form-input" id="ganti-komp-biaya" placeholder="0" min="0">\n        <span class="form-error" id="err-ganti-komp-biaya" role="alert"></span>'
);
html = html.replace(
    /<label class="form-label">Merek \/ Produk<\/label>\s*<input type="text" class="form-input" id="ganti-komp-produk" placeholder="Contoh: Yamalube, AHM Oil, \.\.\.">/g,
    '<label class="form-label" for="ganti-komp-produk">Merek / Produk</label>\n        <input type="text" class="form-input" id="ganti-komp-produk" placeholder="Contoh: Yamalube, AHM Oil, ...">\n        <span class="form-error" id="err-ganti-komp-produk" role="alert"></span>'
);
html = html.replace(
    /<label class="form-label">Catatan<\/label>\s*<textarea class="form-textarea" id="ganti-komp-notes" placeholder="Catatan\.\.\."><\/textarea>/g,
    '<label class="form-label" for="ganti-komp-notes">Catatan</label>\n        <textarea class="form-textarea" id="ganti-komp-notes" placeholder="Catatan..."></textarea>'
);
html = html.replace(
    /<button type="button" class="retro-btn flex-1" id="btn-modal-komp-cancel">Batal<\/button>/g,
    '<button type="button" class="retro-btn flex-1" id="btn-modal-komp-cancel" aria-label="Batal catat penggantian komponen">Batal</button>'
);

// 10. Form BBM
html = html.replace(
    /<label class="form-label">Odometer \(km\)<\/label>\s*<input type="number" class="form-input" id="bbm-odo" placeholder="0" min="0" required>/g,
    '<label class="form-label" for="bbm-odo">Odometer (km)</label>\n          <input type="number" class="form-input" id="bbm-odo" placeholder="0" min="0" required>\n          <span class="form-error" id="err-bbm-odo" role="alert"></span>'
);
html = html.replace(
    /<label class="form-label">Tanggal<\/label>\s*<input type="date" class="form-input" id="bbm-tanggal" required>/g,
    '<label class="form-label" for="bbm-tanggal">Tanggal</label>\n          <input type="date" class="form-input" id="bbm-tanggal" required>\n          <span class="form-error" id="err-bbm-tanggal" role="alert"></span>'
);
html = html.replace(
    /<label class="form-label">Jenis BBM<\/label>\s*<select class="form-select" id="bbm-jenis" required>/g,
    '<label class="form-label" for="bbm-jenis">Jenis BBM</label>\n        <select class="form-select" id="bbm-jenis" aria-label="Pilih Jenis BBM" required>\n        <span class="form-error" id="err-bbm-jenis" role="alert"></span>'
);
html = html.replace(
    /<label class="form-label">Volume \(Liter\)<\/label>\s*<input type="number" class="form-input" id="bbm-volume" placeholder="0\.0" step="0\.1" min="0" required>/g,
    '<label class="form-label" for="bbm-volume">Volume (Liter)</label>\n          <input type="number" class="form-input" id="bbm-volume" placeholder="0.0" step="0.1" min="0" required>\n          <span class="form-error" id="err-bbm-volume" role="alert"></span>'
);
html = html.replace(
    /<label class="form-label">Harga\/Liter \(Rp\)<\/label>\s*<input type="number" class="form-input" id="bbm-harga" placeholder="0" min="0">/g,
    '<label class="form-label" for="bbm-harga">Harga/Liter (Rp)</label>\n          <input type="number" class="form-input" id="bbm-harga" placeholder="0" min="0">\n          <span class="form-error" id="err-bbm-harga" role="alert"></span>'
);
html = html.replace(
    /<label class="form-label">Total Bayar \(Rp\)<\/label>\s*<input type="number" class="form-input" id="bbm-total" placeholder="Otomatis dihitung" min="0">/g,
    '<label class="form-label" for="bbm-total">Total Bayar (Rp)</label>\n        <input type="number" class="form-input" id="bbm-total" placeholder="Otomatis dihitung" min="0">\n        <span class="form-error" id="err-bbm-total" role="alert"></span>'
);
html = html.replace(
    /<label class="form-label">Catatan<\/label>\s*<input type="text" class="form-input" id="bbm-notes" placeholder="SPBU, kondisi, dll\.">/g,
    '<label class="form-label" for="bbm-notes">Catatan</label>\n        <input type="text" class="form-input" id="bbm-notes" placeholder="SPBU, kondisi, dll.">'
);
html = html.replace(
    /<button type="button" class="retro-btn flex-1" id="btn-modal-bbm-cancel">Batal<\/button>/g,
    '<button type="button" class="retro-btn flex-1" id="btn-modal-bbm-cancel" aria-label="Batal catat pengisian BBM">Batal</button>'
);

// 11. Form Servis Log
html = html.replace(
    /<label class="form-label">Odometer \(km\)<\/label>\s*<input type="number" class="form-input" id="servis-log-odo" placeholder="0" min="0" required>/g,
    '<label class="form-label" for="servis-log-odo">Odometer (km)</label>\n          <input type="number" class="form-input" id="servis-log-odo" placeholder="0" min="0" required>\n          <span class="form-error" id="err-servis-log-odo" role="alert"></span>'
);
html = html.replace(
    /<label class="form-label">Tanggal<\/label>\s*<input type="date" class="form-input" id="servis-log-date" required>/g,
    '<label class="form-label" for="servis-log-date">Tanggal</label>\n          <input type="date" class="form-input" id="servis-log-date" required>\n          <span class="form-error" id="err-servis-log-date" role="alert"></span>'
);
html = html.replace(
    /<label class="form-label">Jenis Servis<\/label>\s*<select class="form-select" id="servis-log-jenis">/g,
    '<label class="form-label" for="servis-log-jenis">Jenis Servis</label>\n        <select class="form-select" id="servis-log-jenis" aria-label="Pilih Jenis Servis">\n        <span class="form-error" id="err-servis-log-jenis" role="alert"></span>'
);
html = html.replace(
    /<label class="form-label">Bengkel<\/label>\s*<input type="text" class="form-input" id="servis-log-bengkel" placeholder="Nama bengkel \/ AHASS \/ Yamaha">/g,
    '<label class="form-label" for="servis-log-bengkel">Bengkel</label>\n        <input type="text" class="form-input" id="servis-log-bengkel" placeholder="Nama bengkel / AHASS / Yamaha">\n        <span class="form-error" id="err-servis-log-bengkel" role="alert"></span>'
);
html = html.replace(
    /<label class="form-label">Total Biaya \(Rp\)<\/label>\s*<input type="number" class="form-input" id="servis-log-biaya" placeholder="0" min="0">/g,
    '<label class="form-label" for="servis-log-biaya">Total Biaya (Rp)</label>\n        <input type="number" class="form-input" id="servis-log-biaya" placeholder="0" min="0">\n        <span class="form-error" id="err-servis-log-biaya" role="alert"></span>'
);
html = html.replace(
    /<label class="form-label">Catatan \/ Detail<\/label>\s*<textarea class="form-textarea" id="servis-log-notes" placeholder="Komponen apa yang diganti, kondisi motor, dll\."><\/textarea>/g,
    '<label class="form-label" for="servis-log-notes">Catatan / Detail</label>\n        <textarea class="form-textarea" id="servis-log-notes" placeholder="Komponen apa yang diganti, kondisi motor, dll."></textarea>'
);
html = html.replace(
    /<button type="button" class="retro-btn flex-1" id="btn-modal-servis-log-cancel">Batal<\/button>/g,
    '<button type="button" class="retro-btn flex-1" id="btn-modal-servis-log-cancel" aria-label="Batal tambah log servis">Batal</button>'
);

// 12. Modal Konfirmasi & Notif & Kamera & Gemini
html = html.replace(
    /<button type="button" class="retro-btn flex-1" id="btn-konfirmasi-cancel">Batal<\/button>/g,
    '<button type="button" class="retro-btn flex-1" id="btn-konfirmasi-cancel" aria-label="Batal hapus motor">Batal</button>'
);
html = html.replace(
    /<button type="button" class="retro-btn retro-btn-danger flex-1" id="btn-konfirmasi-ok">Hapus<\/button>/g,
    '<button type="button" class="retro-btn retro-btn-danger flex-1" id="btn-konfirmasi-ok" aria-label="Konfirmasi hapus motor secara permanen">Hapus</button>'
);
html = html.replace(
    /<input type="checkbox" id="toggle-notif-master" checked \/>/g,
    '<input type="checkbox" id="toggle-notif-master" aria-label="Notifikasi Sistem HP" checked />'
);
html = html.replace(
    /<input type="checkbox" id="toggle-notif-overdue" checked \/>/g,
    '<input type="checkbox" id="toggle-notif-overdue" aria-label="Peringatan Harian Overdue" checked />'
);
html = html.replace(
    /<input type="checkbox" id="toggle-notif-ideal" checked \/>/g,
    '<input type="checkbox" id="toggle-notif-ideal" aria-label="Jarak Ideal dan Wajar" checked />'
);
html = html.replace(
    /<input type="checkbox" id="toggle-notif-tax" checked \/>/g,
    '<input type="checkbox" id="toggle-notif-tax" aria-label="Pengingat Pajak STNK" checked />'
);
html = html.replace(
    /<button type="button" class="retro-btn retro-btn-outline w-100" id="btn-test-notification">/g,
    '<button type="button" class="retro-btn retro-btn-outline w-100" id="btn-test-notification" aria-label="Kirim Uji Coba Notifikasi ke Layar">'
);
html = html.replace(
    /<button type="button" class="retro-btn retro-btn-primary flex-1" id="btn-modal-notif-close">Tutup<\/button>/g,
    '<button type="button" class="retro-btn retro-btn-primary flex-1" id="btn-modal-notif-close" aria-label="Tutup pengaturan notifikasi">Tutup</button>'
);
html = html.replace(
    /<button type="button" class="retro-btn retro-btn-sm" id="btn-camera-flip">🔄 Ganti Kamera<\/button>/g,
    '<button type="button" class="retro-btn retro-btn-sm" id="btn-camera-flip" aria-label="Ganti kamera depan atau belakang">🔄 Ganti Kamera</button>'
);
html = html.replace(
    /<button type="button" class="btn-shutter" id="btn-camera-snap" title="Ambil Foto Pemeriksaan"><\/button>/g,
    '<button type="button" class="btn-shutter" id="btn-camera-snap" title="Ambil Foto Pemeriksaan" aria-label="Ambil foto pemeriksaan fisik motor"></button>'
);
html = html.replace(
    /<button type="button" class="retro-btn flex-1" id="btn-modal-camera-close">Selesai<\/button>/g,
    '<button type="button" class="retro-btn flex-1" id="btn-modal-camera-close" aria-label="Selesai dan tutup kamera">Selesai</button>'
);

// Gemini chips from span to button
html = html.replace(
    /<div class="d-flex gap-8 mb-12" style="flex-wrap:wrap;">\s*<span class="gemini-chip active" data-symptom="cvt">Suara Gredek di CVT<\/span>\s*<span class="gemini-chip" data-symptom="lelet">Tarikan Berat & Boros<\/span>\s*<span class="gemini-chip" data-symptom="rem">Rem Berdecit \/ Ambles<\/span>\s*<span class="gemini-chip" data-symptom="asap">Knalpot Asap & Oli Kurang<\/span>\s*<span class="gemini-chip" data-symptom="second">Pemeriksaan Motor Second<\/span>\s*<\/div>/g,
    `<div class="d-flex gap-8 mb-12" style="flex-wrap:wrap;" role="group" aria-label="Pilih Gejala Kerusakan">
      <button type="button" class="gemini-chip active" data-symptom="cvt" aria-pressed="true">Suara Gredek di CVT</button>
      <button type="button" class="gemini-chip" data-symptom="lelet" aria-pressed="false">Tarikan Berat & Boros</button>
      <button type="button" class="gemini-chip" data-symptom="rem" aria-pressed="false">Rem Berdecit / Ambles</button>
      <button type="button" class="gemini-chip" data-symptom="asap" aria-pressed="false">Knalpot Asap & Oli Kurang</button>
      <button type="button" class="gemini-chip" data-symptom="second" aria-pressed="false">Pemeriksaan Motor Second</button>
    </div>`
);
html = html.replace(
    /<input type="checkbox" id="gemini-optin-motor-data" checked style="accent-color:var\(--accent-primary\);" \/>/g,
    '<input type="checkbox" id="gemini-optin-motor-data" checked aria-label="Sertakan data umum motor untuk diagnosa akurat" style="accent-color:var(--accent-primary);" />'
);
html = html.replace(
    /<label class="form-label">Prompt Diagnosa Otomatis:<\/label>\s*<textarea class="form-textarea" id="gemini-prompt-preview"/g,
    '<label class="form-label" for="gemini-prompt-preview">Prompt Diagnosa Otomatis:</label>\n      <textarea class="form-textarea" id="gemini-prompt-preview"'
);
html = html.replace(
    /<button type="button" class="retro-btn flex-1" id="btn-gemini-copy">\s*📋 Salin Prompt\s*<\/button>/g,
    '<button type="button" class="retro-btn flex-1" id="btn-gemini-copy" aria-label="Salin prompt diagnosa">\n        📋 Salin Prompt\n      </button>'
);
html = html.replace(
    /<button type="button" class="retro-btn flex-1" id="btn-gemini-ask-api" style="display:none;">\s*⚡ Diagnosa Langsung\s*<\/button>/g,
    '<button type="button" class="retro-btn flex-1" id="btn-gemini-ask-api" aria-label="Kirim diagnosa langsung ke Gemini API" style="display:none;">\n        ⚡ Diagnosa Langsung\n      </button>'
);
html = html.replace(
    /<button type="button" class="retro-btn retro-btn-primary flex-1" id="btn-gemini-launch">\s*🚀 Buka Gemini\s*<\/button>/g,
    '<button type="button" class="retro-btn retro-btn-primary flex-1" id="btn-gemini-launch" aria-label="Buka web atau aplikasi Google Gemini">\n        🚀 Buka Gemini\n      </button>'
);
html = html.replace(
    /<button type="button" class="retro-btn flex-1" id="btn-modal-gemini-close">Tutup<\/button>/g,
    '<button type="button" class="retro-btn flex-1" id="btn-modal-gemini-close" aria-label="Tutup dialog Gemini AI">Tutup</button>'
);

// Ensure every SVG has aria-hidden="true"
html = html.replace(/<svg\b([^>]*?)>/gi, (match, attrs) => {
    if (/aria-hidden/i.test(attrs)) return match;
    return '<svg aria-hidden="true"' + attrs + '>';
});

// Save updated index_v2.html and copy to index.html
fs.writeFileSync(INDEX_V2, html, 'utf8');
fs.writeFileSync(INDEX_MAIN, html, 'utf8');

console.log('✓ Accessibility ARIA markup applied to index_v2.html and index.html');
