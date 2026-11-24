import { describe, it, expect } from 'vitest';
import path from 'path';

// Load Gemini module from assets
const { Gemini } = require(path.join(__dirname, '..', 'assets', 'app_v2.js')).MotoCare;

describe('Gemini AI Diagnostic Assistant: Security, Privacy & Sanitization', () => {
    const mockMotor = {
        id: 'motor-test-1',
        brand: 'Honda',
        model: 'Vario 125',
        nickname: 'Si Gesit',
        plateNumber: 'B 9999 XYZ', // SENSITIVE PII
        notes: 'Beli dari tetangga di Ciledug, ada utang bengkel', // SENSITIVE PII
        year: 2021,
        currentOdo: 15400
    };

    describe('Privacy & Consent Opt-in Verification', () => {
        it('includes motor model, year, and odo when user provides consent (withConsent = true)', () => {
            const prompt = Gemini.buildPrompt('cvt', mockMotor, true);

            expect(prompt).toContain('Vario 125');
            expect(prompt).toContain('2021');
            expect(prompt).toContain('15.400 KM');
            expect(prompt).toContain('CVT');
        });

        it('excludes all specific motor details when consent is NOT given (withConsent = false)', () => {
            const prompt = Gemini.buildPrompt('cvt', mockMotor, false);

            expect(prompt).not.toContain('Vario 125');
            expect(prompt).not.toContain('2021');
            expect(prompt).not.toContain('15.400 KM');
            expect(prompt).toContain('Tipe Kendaraan: Sepeda Motor Roda Dua Indonesia');
            expect(prompt).toContain('CVT');
        });

        it('NEVER leaks sensitive PII (plateNumber, personal notes) into the prompt', () => {
            const promptWithConsent = Gemini.buildPrompt('lelet', mockMotor, true);
            const promptWithoutConsent = Gemini.buildPrompt('lelet', mockMotor, false);

            // Plate number must NEVER be exposed
            expect(promptWithConsent).not.toContain('B 9999 XYZ');
            expect(promptWithoutConsent).not.toContain('B 9999 XYZ');

            // Personal notes must NEVER be exposed
            expect(promptWithConsent).not.toContain('Ciledug');
            expect(promptWithConsent).not.toContain('utang');
            expect(promptWithoutConsent).not.toContain('Ciledug');
            expect(promptWithoutConsent).not.toContain('utang');
        });

        it('handles null or missing motor object gracefully', () => {
            const prompt = Gemini.buildPrompt('rem', null, true);
            expect(prompt).toBeDefined();
            expect(prompt).toContain('Sepeda Motor Roda Dua');
            expect(prompt).toContain('Rem depan/belakang');
        });
    });

    describe('AI Output Sanitization & XSS Neutralization', () => {
        it('neutralizes HTML tags and script injection from AI responses', () => {
            const maliciousOutput = 'Rekomendasi servis: <script>alert("XSS")</script> ganti oli.';
            const sanitized = Gemini.sanitizeAiOutput(maliciousOutput);

            expect(sanitized).not.toContain('<script>');
            expect(sanitized).toContain('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
        });

        it('neutralizes img onerror and event handlers in AI responses', () => {
            const payload = 'Penyebab: <img src="x" onerror="stealCookies()"> CVT kotor.';
            const sanitized = Gemini.sanitizeAiOutput(payload);

            expect(sanitized).not.toContain('<img');
            expect(sanitized).toContain('&lt;img src=&quot;x&quot; onerror=&quot;stealCookies()&quot;&gt;');
        });

        it('converts markdown bold syntax safely into <strong> tags', () => {
            const markdown = 'Komponen bermasalah: **Roller CVT** dan **V-Belt**.';
            const sanitized = Gemini.sanitizeAiOutput(markdown);

            expect(sanitized).toContain('<strong>Roller CVT</strong>');
            expect(sanitized).toContain('<strong>V-Belt</strong>');
            expect(sanitized).not.toContain('**');
        });

        it('converts markdown list items into safe HTML unordered lists', () => {
            const listOutput = '* Bersihkan mangkok ganda\n* Ganti 6 butir roller\n* Lumasi bearing';
            const sanitized = Gemini.sanitizeAiOutput(listOutput);

            expect(sanitized).toContain('<ul');
            expect(sanitized).toContain('<li>Bersihkan mangkok ganda</li>');
            expect(sanitized).toContain('<li>Ganti 6 butir roller</li>');
            expect(sanitized).toContain('<li>Lumasi bearing</li>');
            expect(sanitized).toContain('</ul>');
        });

        it('handles empty, null, or undefined AI outputs safely', () => {
            expect(Gemini.sanitizeAiOutput(null)).toBe('');
            expect(Gemini.sanitizeAiOutput(undefined)).toBe('');
            expect(Gemini.sanitizeAiOutput('')).toBe('');
        });
    });

    describe('Offline Troubleshooting Fallback Knowledge Base', () => {
        it('contains verified emergency tips for all core symptoms', () => {
            const symptoms = ['cvt', 'lelet', 'rem', 'asap', 'second'];
            for (const sym of symptoms) {
                const tips = Gemini.OFFLINE_DIAGNOSTIC_TIPS[sym];
                expect(tips).toBeDefined();
                expect(Array.isArray(tips)).toBe(true);
                expect(tips.length).toBeGreaterThanOrEqual(3);
            }
        });

        it('provides actionable mechanical checks in offline tips', () => {
            const cvtTips = Gemini.OFFLINE_DIAGNOSTIC_TIPS.cvt.join(' ');
            expect(cvtTips).toContain('mangkok');
            expect(cvtTips).toContain('roller');
            expect(cvtTips).toContain('v-belt');

            const asapTips = Gemini.OFFLINE_DIAGNOSTIC_TIPS.asap.join(' ');
            expect(asapTips).toContain('dipstick');
            expect(asapTips).toContain('ring piston');
        });
    });
});
