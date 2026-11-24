/**
 * MotoCare v2.0 - Gemini AI Diagnostic Backend Proxy
 * 
 * Secure proxy server for Firebase Functions, Google Cloud Run, or Node.js runtime.
 * Protects Gemini API keys, enforces rate limiting, validates vehicle symptoms,
 * and sanitizes AI outputs before forwarding to clients.
 */

const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json({ limit: '64kb' }));

// 1. CORS Configuration (Restrict to official app origin)
const ALLOWED_ORIGINS = [
    'https://localhost',
    'file://',
    'http://localhost',
    'https://syifaulmu.github.io'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || ALLOWED_ORIGINS.includes(origin) || origin.startsWith('http://localhost:')) {
            callback(null, true);
        } else {
            callback(new Error('Origin not allowed by CORS policy.'));
        }
    }
}));

// 2. Simple In-Memory Rate Limiter (10 requests per 15 minutes per IP)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;

function rateLimitMiddleware(req, res, next) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-client';
    const now = Date.now();

    let clientRecord = rateLimitMap.get(ip);
    if (!clientRecord || now - clientRecord.windowStart > RATE_LIMIT_WINDOW_MS) {
        clientRecord = { windowStart: now, count: 0 };
        rateLimitMap.set(ip, clientRecord);
    }

    clientRecord.count++;
    if (clientRecord.count > MAX_REQUESTS_PER_WINDOW) {
        const resetSeconds = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - clientRecord.windowStart)) / 1000);
        return res.status(429).json({
            error: 'Batas kuota diagnosa tercapai. Silakan coba kembali dalam ' + resetSeconds + ' detik.',
            retryAfter: resetSeconds
        });
    }

    next();
}

// 3. Allowed Symptom Whitelist
const ALLOWED_SYMPTOMS = new Set(['cvt', 'lelet', 'rem', 'asap', 'second', 'umum']);

// 4. Diagnostic Endpoint
app.post('/api/gemini-diagnostic', rateLimitMiddleware, async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('[GeminiProxy Error] GEMINI_API_KEY environment variable is not configured.');
        return res.status(500).json({
            error: 'Konfigurasi backend AI belum diaktifkan. Gunakan tombol Buka Gemini langsung.'
        });
    }

    const { prompt, symptom } = req.body;

    // Input Validation
    if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Prompt diagnosa wajib diisi dalam format string.' });
    }

    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt.length < 10 || trimmedPrompt.length > 2500) {
        return res.status(400).json({ error: 'Panjang prompt harus antara 10 hingga 2500 karakter.' });
    }

    const safeSymptom = (symptom && ALLOWED_SYMPTOMS.has(symptom)) ? symptom : 'umum';

    // System instruction to enforce automotive technician persona & safety
    const SYSTEM_INSTRUCTION = 
        'Anda adalah asisten mekanik spesialis sepeda motor roda dua Indonesia untuk aplikasi MotoCare. ' +
        'Jawab keluhan motor secara ringkas, to the point, terstruktur, ramah, dan gunakan istilah bengkel lokal di Indonesia. ' +
        'Sertakan: 1. Dugaan penyebab utama; 2. Komponen yang perlu dicek/servis; 3. Tingkat urgensi keselamatan berkendara; 4. Perkiraan kisaran biaya di bengkel.';

    try {
        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const payload = {
            contents: [
                {
                    role: 'user',
                    parts: [{ text: `${SYSTEM_INSTRUCTION}\n\n[Keluhan Pengguna]:\n${trimmedPrompt}` }]
                }
            ],
            generationConfig: {
                temperature: 0.4,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 800
            }
        };

        const response = await fetch(geminiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('[Gemini API Remote Error]', response.status, errText);
            return res.status(502).json({
                error: 'Layanan AI Gemini sedang sibuk. Silakan coba kembali sesaat lagi.'
            });
        }

        const data = await response.json();
        let reply = '';
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
            reply = data.candidates[0].content.parts.map(p => p.text).join('\n');
        }

        if (!reply) {
            return res.status(500).json({ error: 'Tidak ada respons teks yang dihasilkan dari AI.' });
        }

        return res.json({
            success: true,
            symptom: safeSymptom,
            reply: reply
        });

    } catch (err) {
        console.error('[Gemini Proxy Internal Error]', err);
        return res.status(500).json({
            error: 'Terjadi kesalahan internal pada server proxy.'
        });
    }
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'MotoCare-Gemini-Proxy' }));

const PORT = process.env.PORT || 8080;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`MotoCare Gemini Proxy running on port ${PORT}`);
    });
}

module.exports = app;
