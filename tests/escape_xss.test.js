import { describe, it, expect } from 'vitest';
import path from 'path';

// Load escapeHtml from assets/app_v2.js
const appModule = require(path.join(__dirname, '..', 'assets', 'app_v2.js'));
const escapeHtml = appModule.escapeHtml;

describe('escapeHtml & XSS Payload Neutralization', () => {
    describe('Basic HTML Character Escaping', () => {
        it('escapes ampersand (&) to &amp;', () => {
            expect(escapeHtml('Honda & Yamaha')).toBe('Honda &amp; Yamaha');
        });

        it('escapes less-than (<) to &lt;', () => {
            expect(escapeHtml('<motor>')).toBe('&lt;motor&gt;');
        });

        it('escapes greater-than (>) to &gt;', () => {
            expect(escapeHtml('km > 5000')).toBe('km &gt; 5000');
        });

        it('escapes double quote (") to &quot;', () => {
            expect(escapeHtml('Model "Street"')).toBe('Model &quot;Street&quot;');
        });

        it("escapes single quote (') to &#39;", () => {
            expect(escapeHtml("Motor's health")).toBe('Motor&#39;s health');
        });
    });

    describe('Edge Cases: Null, Undefined, Numbers, Booleans, Empty', () => {
        it('handles null gracefully returning empty string', () => {
            expect(escapeHtml(null)).toBe('');
        });

        it('handles undefined gracefully returning empty string', () => {
            expect(escapeHtml(undefined)).toBe('');
        });

        it('handles empty string returning empty string', () => {
            expect(escapeHtml('')).toBe('');
        });

        it('safely converts and escapes numbers', () => {
            expect(escapeHtml(150)).toBe('150');
            expect(escapeHtml(0)).toBe('0');
            expect(escapeHtml(-25.5)).toBe('-25.5');
        });

        it('safely converts and escapes booleans', () => {
            expect(escapeHtml(true)).toBe('true');
            expect(escapeHtml(false)).toBe('false');
        });
    });

    describe('XSS Payloads Sanitization', () => {
        it('neutralizes image onerror XSS: <img src=x onerror=alert(1)>', () => {
            const raw = '<img src=x onerror=alert(1)>';
            const escaped = escapeHtml(raw);
            expect(escaped).toBe('&lt;img src=x onerror=alert(1)&gt;');
            expect(escaped.includes('<')).toBe(false);
            expect(escaped.includes('>')).toBe(false);
        });

        it('neutralizes script tag injection: <script>alert("XSS")</script>', () => {
            const raw = '<script>alert("XSS")</script>';
            const escaped = escapeHtml(raw);
            expect(escaped).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
            expect(escaped.includes('<script>')).toBe(false);
            expect(escaped.includes('</script>')).toBe(false);
        });

        it('neutralizes event handler attribute breakout', () => {
            const raw = '" onfocus="alert(1)" autofocus="';
            const escaped = escapeHtml(raw);
            expect(escaped).toBe('&quot; onfocus=&quot;alert(1)&quot; autofocus=&quot;');
            expect(escaped.includes('"')).toBe(false);
        });

        it("neutralizes SVG vector: <svg/onload=alert('XSS')>", () => {
            const raw = "<svg/onload=alert('XSS')>";
            expect(escapeHtml(raw)).toBe('&lt;svg/onload=alert(&#39;XSS&#39;)&gt;');
        });

        it('neutralizes tag break and external script load', () => {
            const raw = '"><script src=evil.js></script>';
            expect(escapeHtml(raw)).toBe('&quot;&gt;&lt;script src=evil.js&gt;&lt;/script&gt;');
        });

        it('neutralizes iframe injection', () => {
            const raw = '<iframe src="javascript:alert(1)"></iframe>';
            expect(escapeHtml(raw)).toBe('&lt;iframe src=&quot;javascript:alert(1)&quot;&gt;&lt;/iframe&gt;');
        });
    });

    describe('Simulated MotoCare Template Interpolation', () => {
        it('renders motor card with malicious fields safely as text', () => {
            const maliciousMotor = {
                id: 'motor-12345',
                brand: '<script>alert(1)</script>',
                nickname: 'Vario <img src=x onerror=alert(1)>',
                plateNumber: 'B 1234 "><script>',
                year: '2023',
                engine: '160cc <svg onload=1>'
            };

            const rendered = `
                <span class="motor-badge">${escapeHtml(maliciousMotor.brand)}</span>
                <span class="font-bold">${escapeHtml(maliciousMotor.nickname)}</span>
                <div>Plat: <strong>${escapeHtml(maliciousMotor.plateNumber)}</strong></div>
                <div>Mesin: ${escapeHtml(maliciousMotor.engine)}</div>
            `;

            expect(rendered.includes('<script>')).toBe(false);
            expect(rendered.includes('<img')).toBe(false);
            expect(rendered.includes('<svg')).toBe(false);
            expect(rendered.includes('&lt;script&gt;alert(1)&lt;/script&gt;')).toBe(true);
            expect(rendered.includes('Vario &lt;img src=x onerror=alert(1)&gt;')).toBe(true);
            expect(rendered.includes('B 1234 &quot;&gt;&lt;script&gt;')).toBe(true);
        });

        it('renders service log with malicious workshop and notes safely as text', () => {
            const maliciousLog = {
                category: 'Servis CVT',
                date: '2026-11-24',
                workshop: 'Bengkel Resmi <img src=x onerror=stealCookies()>',
                notes: 'Ganti roller <script>document.location="http://evil.com"</script>'
            };

            const rendered = `
                <span>${escapeHtml(maliciousLog.category)}</span>
                <span>Bengkel: ${escapeHtml(maliciousLog.workshop)}</span>
                <div>Catatan: ${escapeHtml(maliciousLog.notes)}</div>
            `;

            expect(rendered.includes('<img src=x')).toBe(false);
            expect(rendered.includes('<script>')).toBe(false);
            expect(rendered.includes('&lt;img src=x onerror=stealCookies()&gt;')).toBe(true);
            expect(rendered.includes('&lt;script&gt;document.location=')).toBe(true);
        });
    });
});
