/**
 * MotoCare v2.0 - Gemini AI Diagnostic Assistant Module
 * Generates motorcycle symptom prompts, enforces user privacy opt-in (no PII),
 * provides offline troubleshooting fallback, and safely sanitizes AI responses.
 */
(function (root, factory) {
    const exported = factory();
    if (typeof root !== 'undefined' && root) {
        root.MotoCare = root.MotoCare || {};
        root.MotoCare.Gemini = exported;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = exported;
    }
})(typeof self !== 'undefined' ? self : typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    let _store = null;
    let _utils = null;
    let currentGeminiSymptom = 'cvt';
    let includeMotorData = true;
    let lastQueryTimestamp = 0;
    const RATE_LIMIT_COOLDOWN_MS = 10000; // 10 seconds client-side throttle

    const OFFLINE_DIAGNOSTIC_TIPS = Object.freeze({
        cvt: [
            'Pembersihan CVT: Gredek getar di rpm rendah umumnya disebabkan penumpukan debu kampas ganda pada tromol mangkok kopling.',
            'Pemeriksaan Roller: Cek apakah permukaan 6 butir roller sudah termakan / aus tidak bulat merata.',
            'V-Belt: Periksa apakah sisi dalam karet v-belt sudah pecah-pecah atau melar melewati batas limit jarak.'
        ],
        lelet: [
            'Busi: Buka dan periksa elektroda busi. Jika hitam pekat berkerak, bersihkan atau ganti baru.',
            'Filter Udara: Cek filter udara. Jika filter jenis kering berviskositas oli sudah kotor pekat, segera ganti (jangan dicuci bensin).',
            'Tekanan Angin Ban: Pastikan tekanan ban depan (~29 psi) dan belakang (~33 psi) tidak kempis.'
        ],
        rem: [
            'Ketebalan Kampas Rem: Intip sisa kampas rem. Jika kurang dari 1.5 mm, segera ganti agar piringan cakram tidak tergores.',
            'Minyak Rem: Periksa kaca intip master rem. Jika warna minyak rem sudah cokelat gelap atau di bawah garis lower, segera kuras.',
            'Kotoran Kaliper: Semprot area kaliper dengan brake cleaner untuk membuang partikel pasir yang memicu bunyi decit.'
        ],
        asap: [
            'Level Oli Mesin: SEGERA cabut dipstick oli! Jika volume oli di bawah garis batas bawah, jangan paksa nyalakan mesin.',
            'Ring Piston & Boring: Asap putih tebal saat gas tinggi mengindikasikan oli terbakar di ruang bakar akibat ring piston aus.',
            'Sil Klep: Asap putih saat starter pagi hari menandakan sil klep getas sehingga oli merembes ke payung klep.'
        ],
        second: [
            'Rangka & Segitiga: Lepas stang saat kecepatan rendah di jalan lurus sepi untuk memastikan stang tidak membuang ke samping.',
            'Suara Rantai Keteng: Dengarkan sisi kiri mesin; suara gemericik menandakan tensioner atau rantai keteng aus.',
            'Kebocoran Paking: Periksa bagian bawah bak mesin dan sambungan blok silinder dari rembesan oli basah.'
        ]
    });

    function init(deps) {
        _store = deps && deps.Store;
        _utils = deps && deps.Utils;
        initListeners();
    }

    function open() {
        checkConnectivity();
        updatePromptPreview();
        if (_utils) _utils.openModal('modal-gemini');
    }

    function close() {
        if (_utils) _utils.closeModal('modal-gemini');
    }

    function checkConnectivity() {
        const isOnline = typeof navigator !== 'undefined' ? navigator.onLine !== false : true;
        const banner = document.getElementById('gemini-offline-banner');
        const tipsContainer = document.getElementById('gemini-offline-tips');

        if (banner) banner.style.display = isOnline ? 'none' : 'block';
        if (tipsContainer) {
            tipsContainer.style.display = isOnline ? 'none' : 'block';
            if (!isOnline) {
                renderOfflineTips(tipsContainer);
            }
        }
    }

    function renderOfflineTips(container) {
        const tips = OFFLINE_DIAGNOSTIC_TIPS[currentGeminiSymptom] || [];
        const escapeHtml = _utils ? _utils.escapeHtml : (s) => s;
        let html =
            '<div class="font-bold mb-4" style="color:var(--accent-primary);">📋 Panduan Pengecekan Cepat (Offline):</div>';
        html += '<ul style="margin:0; padding-left:18px; color:var(--text-secondary); line-height:1.4;">';
        tips.forEach((tip) => {
            html += '<li class="mb-4">' + escapeHtml(tip) + '</li>';
        });
        html += '</ul>';
        container.innerHTML = html;
    }

    function buildPrompt(symptomKey, motor, withConsent) {
        let symptomText = '';
        switch (symptomKey) {
            case 'cvt':
                symptomText =
                    'Terdengar bunyi getar / gredek kasar pada area CVT transmisi otomatis saat akselerasi awal (0 - 30 km/jam).';
                break;
            case 'lelet':
                symptomText =
                    'Tarikan mesin terasa berat, loyo di tanjakan, dan konsumsi bensin terasa lebih boros dari biasanya.';
                break;
            case 'rem':
                symptomText = 'Rem depan/belakang berdecit keras saat ditekan dan tuas rem terasa ambles/kurang pakem.';
                break;
            case 'asap':
                symptomText =
                    'Knalpot mengeluarkan sedikit asap putih/abu-abu saat digas tinggi dan volume oli mesin berkurang drastis.';
                break;
            case 'second':
                symptomText =
                    'Motor ini dibeli dalam kondisi second/bekas. Saya butuh panduan pemeriksaan menyeluruh komponen yang rawan rusak pada tipe motor ini.';
                break;
            default:
                symptomText = 'Pemeriksaan performa dan kondisi umum mesin motor.';
        }

        let motorHeader = '';
        if (withConsent && motor) {
            // Strictly exclude plateNumber and personal notes (No PII)
            const motorName = motor.model || motor.nickname || 'Sepeda Motor Roda Dua';
            const motorYear = motor.year || '-';
            const motorOdo = (Number(motor.currentOdo) || 0).toLocaleString('id-ID') + ' KM';

            motorHeader =
                '• Motor: ' + motorName + ' (Tahun ' + motorYear + ')\n' + '• Odometer saat ini: ' + motorOdo + '\n';
        } else {
            motorHeader = '• Tipe Kendaraan: Sepeda Motor Roda Dua Indonesia\n';
        }

        return (
            'Halo Google Gemini, tolong bantu analisa masalah teknis pada sepeda motor saya:\n' +
            motorHeader +
            '• Gejala kendala: ' +
            symptomText +
            '\n\n' +
            'Pertanyaan untuk analisa:\n' +
            '1. Apa akar penyebab yang paling sering memicu masalah tersebut?\n' +
            '2. Komponen spesifik mana saja yang harus diperiksa atau diganti di bengkel?\n' +
            '3. Apakah motor masih aman dipakai harian atau berisiko mogok/rusak parah?\n' +
            '4. Berapa perkiraan kisaran biaya servis atau harga suku cadang tersebut di Indonesia?'
        );
    }

    function updatePromptPreview() {
        const motor = _store ? _store.getActiveMotor() : null;
        const preview = document.getElementById('gemini-prompt-preview');
        const optinCheckbox = document.getElementById('gemini-optin-motor-data');

        if (optinCheckbox) {
            includeMotorData = optinCheckbox.checked;
        }

        const prompt = buildPrompt(currentGeminiSymptom, motor, includeMotorData);
        if (preview) {
            preview.value = prompt;
        }
    }

    function sanitizeAiOutput(rawText) {
        if (!rawText || typeof rawText !== 'string') return '';

        // Step 1: Escape raw HTML entities completely
        const escapeHtml = _utils
            ? _utils.escapeHtml
            : (str) => {
                  return String(str).replace(
                      /[&<>"']/g,
                      (c) =>
                          ({
                              '&': '&amp;',
                              '<': '&lt;',
                              '>': '&gt;',
                              '"': '&quot;',
                              "'": '&#39;'
                          })[c]
                  );
              };

        const escaped = escapeHtml(rawText);

        // Step 2: Safe Markdown transformation (bold and list items)
        const lines = escaped.split('\n');
        let inList = false;
        let result = [];

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (!line) {
                if (inList) {
                    result.push('</ul>');
                    inList = false;
                }
                result.push('<br/>');
                continue;
            }

            // Bold: **text** -> <strong>text</strong>
            line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

            // List items: * or - or numbers
            if (/^[-*]\s+/.test(line)) {
                if (!inList) {
                    result.push('<ul style="margin:4px 0; padding-left:20px;">');
                    inList = true;
                }
                const content = line.replace(/^[-*]\s+/, '');
                result.push('<li>' + content + '</li>');
            } else if (/^\d+\.\s+/.test(line)) {
                if (!inList) {
                    result.push('<ol style="margin:4px 0; padding-left:20px;">');
                    inList = true;
                }
                const content = line.replace(/^\d+\.\s+/, '');
                result.push('<li>' + content + '</li>');
            } else {
                if (inList) {
                    result.push('</ul>');
                    inList = false;
                }
                result.push('<p class="mb-4" style="margin:4px 0;">' + line + '</p>');
            }
        }

        if (inList) {
            result.push('</ul>');
        }

        return result.join('');
    }

    function copyPrompt() {
        const preview = document.getElementById('gemini-prompt-preview');
        if (!preview) return;
        const text = preview.value;
        if (_utils && typeof _utils.copyToClipboard === 'function') {
            _utils.copyToClipboard(text).then(() => {
                if (_utils.showToast) _utils.showToast('📋 Prompt disalin ke clipboard!');
            });
        }
    }

    function launch() {
        const preview = document.getElementById('gemini-prompt-preview');
        const prompt = preview ? preview.value : '';

        copyPrompt();

        if (typeof window !== 'undefined' && window.Android && window.Android.openGeminiWithPrompt) {
            window.Android.openGeminiWithPrompt(prompt);
        } else {
            const encoded = encodeURIComponent(prompt);
            window.open('https://gemini.google.com/app?q=' + encoded, '_blank');
        }
    }

    async function askDiagnosticApi(proxyUrl) {
        const isOnline = typeof navigator !== 'undefined' ? navigator.onLine !== false : true;
        if (!isOnline) {
            if (_utils && _utils.showToast) _utils.showToast('⚠️ Tidak dapat menghubungi AI saat offline.');
            checkConnectivity();
            return;
        }

        const now = Date.now();
        if (now - lastQueryTimestamp < RATE_LIMIT_COOLDOWN_MS) {
            const waitSeconds = Math.ceil((RATE_LIMIT_COOLDOWN_MS - (now - lastQueryTimestamp)) / 1000);
            if (_utils && _utils.showToast) {
                _utils.showToast(`⏳ Mohon tunggu ${waitSeconds} detik sebelum meminta analisa baru.`);
            }
            return;
        }

        const preview = document.getElementById('gemini-prompt-preview');
        const prompt = preview ? preview.value : '';
        if (!prompt) return;

        const container = document.getElementById('gemini-response-container');
        const textEl = document.getElementById('gemini-response-text');
        const statusEl = document.getElementById('gemini-status-indicator');

        if (container) container.style.display = 'block';
        if (statusEl) statusEl.textContent = 'Sedang menganalisa... ⏳';
        if (textEl) textEl.innerHTML = '<em>Mengirim pertanyaan ke asisten Gemini AI melalui proxy aman...</em>';

        lastQueryTimestamp = now;

        try {
            const endpoint = proxyUrl || '/api/gemini-diagnostic';
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, symptom: currentGeminiSymptom })
            });

            if (!response.ok) {
                throw new Error(`Server proxy mengembalikan kode status ${response.status}`);
            }

            const data = await response.json();
            const replyText = data.reply || data.text || 'Tidak ada teks diagnosa yang diterima.';

            if (statusEl) statusEl.textContent = 'Selesai ✅';
            if (textEl) {
                textEl.innerHTML = sanitizeAiOutput(replyText);
            }
        } catch (err) {
            console.error('[Gemini API Proxy Error]', err);
            if (statusEl) statusEl.textContent = 'Gagal ❌';
            if (textEl) {
                textEl.innerHTML =
                    '<span style="color:var(--status-danger);">⚠️ Gagal terhubung ke proxy backend: ' +
                    (_utils ? _utils.escapeHtml(err.message) : err.message) +
                    '. Silakan gunakan tombol <strong>"Buka Gemini"</strong> untuk membuka langsung web Gemini.</span>';
            }
        }
    }

    function initListeners() {
        const btnOpenGemini = document.getElementById('btn-open-gemini');
        if (btnOpenGemini) btnOpenGemini.addEventListener('click', open);

        const btnGeminiClose = document.getElementById('btn-modal-gemini-close');
        if (btnGeminiClose) btnGeminiClose.addEventListener('click', close);

        const btnGeminiCopy = document.getElementById('btn-gemini-copy');
        if (btnGeminiCopy) btnGeminiCopy.addEventListener('click', copyPrompt);

        const btnGeminiLaunch = document.getElementById('btn-gemini-launch');
        if (btnGeminiLaunch) btnGeminiLaunch.addEventListener('click', launch);

        const btnGeminiAskApi = document.getElementById('btn-gemini-ask-api');
        if (btnGeminiAskApi) {
            btnGeminiAskApi.addEventListener('click', () => askDiagnosticApi());
        }

        const optinCheckbox = document.getElementById('gemini-optin-motor-data');
        if (optinCheckbox) {
            optinCheckbox.addEventListener('change', () => {
                includeMotorData = optinCheckbox.checked;
                updatePromptPreview();
            });
        }

        document.querySelectorAll('.gemini-chip').forEach((chip) => {
            chip.addEventListener('click', function () {
                document.querySelectorAll('.gemini-chip').forEach((c) => {
                    c.classList.remove('active');
                    c.setAttribute('aria-pressed', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-pressed', 'true');
                currentGeminiSymptom = this.getAttribute('data-symptom');
                updatePromptPreview();
                checkConnectivity();
            });
        });

        if (typeof window !== 'undefined') {
            window.addEventListener('online', checkConnectivity);
            window.addEventListener('offline', checkConnectivity);
        }
    }

    return {
        init,
        open,
        close,
        buildPrompt,
        sanitizeAiOutput,
        updatePromptPreview,
        copyPrompt,
        launch,
        askDiagnosticApi,
        checkConnectivity,
        OFFLINE_DIAGNOSTIC_TIPS,
        initListeners
    };
});
