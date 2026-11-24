import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const ROOT_DIR = path.resolve(__dirname, '..');
const styleCss = fs.readFileSync(path.join(ROOT_DIR, 'assets', 'style.css'), 'utf8');
const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'assets', 'index.html'), 'utf8');
const { Utils } = require(path.join(ROOT_DIR, 'assets', 'app_v2.js'));

/**
 * WCAG 2.1 Relative Luminance & Contrast Ratio calculation helpers
 */
function hexToRgb(hex) {
    const cleanHex = hex.replace('#', '').trim();
    const bigint = parseInt(cleanHex, 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function getLuminance(hex) {
    const rgb = hexToRgb(hex).map((v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function getContrastRatio(hex1, hex2) {
    const l1 = getLuminance(hex1);
    const l2 = getLuminance(hex2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

function extractCssVar(css, selector, varName) {
    const selIndex = css.indexOf(selector);
    if (selIndex === -1) return null;
    const block = css.slice(selIndex, css.indexOf('}', selIndex));
    const match = block.match(new RegExp(`${varName}:\\s*([^;]+);`));
    return match ? match[1].trim() : null;
}

describe('Accessibility & Responsiveness (WCAG AA) Audit', () => {
    describe('1. Color Contrast Ratios (WCAG AA Compliance)', () => {
        // Extract design tokens from assets/style.css
        const darkBgPrimary = extractCssVar(styleCss, 'body.theme-dark', '--bg-primary');
        const darkBgCard = extractCssVar(styleCss, 'body.theme-dark', '--bg-card');
        const darkTextPrimary = extractCssVar(styleCss, 'body.theme-dark', '--text-primary');
        const darkTextSecondary = extractCssVar(styleCss, 'body.theme-dark', '--text-secondary');
        const darkTextMuted = extractCssVar(styleCss, 'body.theme-dark', '--text-muted');
        const darkAccent = extractCssVar(styleCss, 'body.theme-dark', '--accent-primary');
        const darkSafeText = extractCssVar(styleCss, 'body.theme-dark', '--status-safe-text');
        const darkWarnText = extractCssVar(styleCss, 'body.theme-dark', '--status-warn-text');
        const darkCritText = extractCssVar(styleCss, 'body.theme-dark', '--status-crit-text');

        const lightBgPrimary = extractCssVar(styleCss, 'body.theme-light', '--bg-primary');
        const lightBgCard = extractCssVar(styleCss, 'body.theme-light', '--bg-card');
        const lightTextPrimary = extractCssVar(styleCss, 'body.theme-light', '--text-primary');
        const lightTextSecondary = extractCssVar(styleCss, 'body.theme-light', '--text-secondary');
        const lightTextMuted = extractCssVar(styleCss, 'body.theme-light', '--text-muted');
        const lightAccent = extractCssVar(styleCss, 'body.theme-light', '--accent-primary');
        const lightSafeText = extractCssVar(styleCss, 'body.theme-light', '--status-safe-text');
        const lightWarnText = extractCssVar(styleCss, 'body.theme-light', '--status-warn-text');
        const lightCritText = extractCssVar(styleCss, 'body.theme-light', '--status-crit-text');

        it('Dark theme: primary text meets WCAG AAA (>= 7:1)', () => {
            expect(getContrastRatio(darkTextPrimary, darkBgPrimary)).toBeGreaterThanOrEqual(7.0);
            expect(getContrastRatio(darkTextPrimary, darkBgCard)).toBeGreaterThanOrEqual(7.0);
        });

        it('Dark theme: secondary text meets WCAG AA for normal text (>= 4.5:1)', () => {
            expect(getContrastRatio(darkTextSecondary, darkBgPrimary)).toBeGreaterThanOrEqual(4.5);
            expect(getContrastRatio(darkTextSecondary, darkBgCard)).toBeGreaterThanOrEqual(4.5);
        });

        it('Dark theme: muted text meets WCAG AA (>= 4.5:1)', () => {
            expect(getContrastRatio(darkTextMuted, darkBgPrimary)).toBeGreaterThanOrEqual(4.5);
            expect(getContrastRatio(darkTextMuted, darkBgCard)).toBeGreaterThanOrEqual(4.5);
        });

        it('Dark theme: amber accent meets UI components & text requirements (>= 4.5:1)', () => {
            expect(getContrastRatio(darkAccent, darkBgPrimary)).toBeGreaterThanOrEqual(4.5);
            expect(getContrastRatio(darkAccent, darkBgCard)).toBeGreaterThanOrEqual(4.5);
        });

        it('Dark theme: status colors (safe, warn, crit) meet WCAG AA (>= 4.5:1)', () => {
            expect(getContrastRatio(darkSafeText, darkBgCard)).toBeGreaterThanOrEqual(4.5);
            expect(getContrastRatio(darkWarnText, darkBgCard)).toBeGreaterThanOrEqual(4.5);
            expect(getContrastRatio(darkCritText, darkBgCard)).toBeGreaterThanOrEqual(4.5);
        });

        it('Light theme: primary text meets WCAG AAA (>= 7:1)', () => {
            expect(getContrastRatio(lightTextPrimary, lightBgPrimary)).toBeGreaterThanOrEqual(7.0);
            expect(getContrastRatio(lightTextPrimary, lightBgCard)).toBeGreaterThanOrEqual(7.0);
        });

        it('Light theme: secondary text meets WCAG AA for normal text (>= 4.5:1)', () => {
            expect(getContrastRatio(lightTextSecondary, lightBgPrimary)).toBeGreaterThanOrEqual(4.5);
            expect(getContrastRatio(lightTextSecondary, lightBgCard)).toBeGreaterThanOrEqual(4.5);
        });

        it('Light theme: muted text meets WCAG AA (>= 4.5:1)', () => {
            expect(getContrastRatio(lightTextMuted, lightBgPrimary)).toBeGreaterThanOrEqual(4.5);
            expect(getContrastRatio(lightTextMuted, lightBgCard)).toBeGreaterThanOrEqual(4.5);
        });

        it('Light theme: accent primary meets WCAG AA (>= 4.5:1)', () => {
            expect(getContrastRatio(lightAccent, lightBgPrimary)).toBeGreaterThanOrEqual(4.5);
            expect(getContrastRatio(lightAccent, lightBgCard)).toBeGreaterThanOrEqual(4.5);
        });

        it('Light theme: status colors (safe, warn, crit) meet WCAG AA (>= 4.5:1)', () => {
            expect(getContrastRatio(lightSafeText, lightBgCard)).toBeGreaterThanOrEqual(4.5);
            expect(getContrastRatio(lightWarnText, lightBgCard)).toBeGreaterThanOrEqual(4.5);
            expect(getContrastRatio(lightCritText, lightBgCard)).toBeGreaterThanOrEqual(4.5);
        });
    });

    describe('2. Interactive Elements ARIA Labels & Roles Audit', () => {
        it('ensures all buttons have accessible labels (text or aria-label)', () => {
            const buttonRegex = /<button\b([^>]*)>([\s\S]*?)<\/button>/gi;
            let match;
            let buttonCount = 0;

            while ((match = buttonRegex.exec(indexHtml)) !== null) {
                buttonCount++;
                const attrs = match[1];
                const innerText = match[2].replace(/<[^>]*>/g, '').trim();

                const hasAriaLabel = /aria-label\s*=\s*["'][^"']+["']/i.test(attrs);
                const hasAriaLabelledby = /aria-labelledby\s*=\s*["'][^"']+["']/i.test(attrs);
                const hasVisibleText = innerText.length > 0;

                const hasAccessibleName = hasVisibleText || hasAriaLabel || hasAriaLabelledby;
                expect(hasAccessibleName, `Button must have visible text or aria-label: ${match[0].slice(0, 80)}`).toBe(
                    true
                );
            }

            expect(buttonCount).toBeGreaterThan(15);
        });

        it('ensures all role="button" elements have aria-label and tabindex', () => {
            const roleBtnRegex = /<[^>]+role=["']button["'][^>]*>/gi;
            let match;
            let count = 0;

            while ((match = roleBtnRegex.exec(indexHtml)) !== null) {
                count++;
                const tag = match[0];
                expect(/aria-label\s*=\s*["'][^"']+["']/i.test(tag)).toBe(true);
                expect(/tabindex\s*=\s*["'][0-9]+["']/i.test(tag)).toBe(true);
            }
            expect(count).toBeGreaterThanOrEqual(3);
        });

        it('ensures decorative SVGs have aria-hidden="true"', () => {
            const svgRegex = /<svg\b([^>]*)>/gi;
            let match;
            let svgCount = 0;

            while ((match = svgRegex.exec(indexHtml)) !== null) {
                svgCount++;
                const attrs = match[1];
                expect(
                    /aria-hidden\s*=\s*["']true["']/i.test(attrs),
                    `SVG should be marked aria-hidden="true": ${match[0]}`
                ).toBe(true);
            }
            expect(svgCount).toBeGreaterThan(10);
        });

        it('ensures modal dialogs have role="dialog", aria-modal="true", and aria-labelledby', () => {
            const modalRegex = /<div class="modal-overlay"[^>]*>/gi;
            let match;
            let modalCount = 0;

            while ((match = modalRegex.exec(indexHtml)) !== null) {
                modalCount++;
                const tag = match[0];
                expect(/role=["']dialog["']/i.test(tag)).toBe(true);
                expect(/aria-modal=["']true["']/i.test(tag)).toBe(true);
                expect(/aria-labelledby=["'][^"']+["']/i.test(tag)).toBe(true);
            }
            expect(modalCount).toBeGreaterThanOrEqual(6);
        });

        it('ensures all modal forms have dedicated .form-error containers with role="alert"', () => {
            expect(indexHtml).toContain('id="err-motor-brand"');
            expect(indexHtml).toContain('id="err-motor-model"');
            expect(indexHtml).toContain('id="err-motor-nickname"');
            expect(indexHtml).toContain('id="err-motor-year"');
            expect(indexHtml).toContain('id="err-motor-plate"');
            expect(indexHtml).toContain('id="err-motor-odo"');
            expect(indexHtml).toContain('id="err-odo-input"');
            expect(indexHtml).toContain('id="err-bbm-volume"');
            expect(indexHtml).toContain('id="err-servis-log-odo"');

            // Form error containers should have role="alert"
            const errorMatches = indexHtml.match(/<span class="form-error"[^>]*role=["']alert["'][^>]*>/gi);
            expect(errorMatches).toBeDefined();
            expect(errorMatches.length).toBeGreaterThanOrEqual(10);
        });

        it('ensures toast element has role="status" and aria-live="polite"', () => {
            expect(indexHtml).toMatch(/<div class="toast" id="toast-msg"[^>]*role=["']status["']/i);
            expect(indexHtml).toMatch(/<div class="toast" id="toast-msg"[^>]*aria-live=["']polite["']/i);
        });

        it('ensures bottom navigation has role="navigation" and accessible label', () => {
            expect(indexHtml).toMatch(/<nav class="bottom-nav" id="bottom-nav"[^>]*role=["']navigation["']/i);
            expect(indexHtml).toMatch(/<nav class="bottom-nav" id="bottom-nav"[^>]*aria-label=["'][^"']+["']/i);
        });

        it('ensures secondary tabs have role="tablist" and role="tab"', () => {
            expect(indexHtml).toMatch(/<div class="tab-secondary" id="servis-tabs"[^>]*role=["']tablist["']/i);
            expect(indexHtml).toMatch(/data-servis-tab="komponen"[^>]*role=["']tab["']/i);
            expect(indexHtml).toMatch(/data-servis-tab="log"[^>]*role=["']tab["']/i);
            expect(indexHtml).toMatch(/data-servis-tab="checklist"[^>]*role=["']tab["']/i);
        });
    });

    describe('3. CSS Touch Targets & Focus Ring Audit', () => {
        it('defines high-contrast visible focus outline on :focus-visible', () => {
            expect(styleCss).toContain(':focus-visible');
            expect(styleCss).toMatch(/outline:\s*2px solid var\(--accent-primary\)/);
            expect(styleCss).toMatch(/outline-offset:\s*2px/);
        });

        it('ensures touch targets meet minimum 44x44px for buttons and controls', () => {
            expect(styleCss).toMatch(/\.theme-toggle-btn\s*\{[^}]*min-width:\s*44px;[^}]*min-height:\s*44px;/);
            expect(styleCss).toMatch(/\.notif-btn\s*\{[^}]*min-width:\s*44px;[^}]*min-height:\s*44px;/);
            expect(styleCss).toMatch(/\.retro-btn\s*\{[^}]*min-height:\s*44px;/);
            expect(styleCss).toMatch(/\.retro-btn-sm\s*\{[^}]*min-height:\s*44px;/);
            expect(styleCss).toMatch(/\.tab-secondary-item\s*\{[^}]*min-height:\s*44px;/);
            expect(styleCss).toMatch(/\.gemini-chip\s*\{[^}]*min-height:\s*44px;/);
            expect(styleCss).toMatch(/\.checklist-item\s*\{[^}]*min-height:\s*44px;/);
            expect(styleCss).toMatch(/\.form-input,\s*\.form-select\s*\{[^}]*min-height:\s*44px;/);
        });

        it('defines responsive media query for small screens (<= 360px)', () => {
            expect(styleCss).toContain('@media (max-width: 360px)');
            const smallScreenBlock = styleCss.slice(styleCss.indexOf('@media (max-width: 360px)'));
            expect(smallScreenBlock).toContain('.form-row');
            expect(smallScreenBlock).toContain('grid-template-columns: 1fr');
            expect(smallScreenBlock).toContain('.quick-status-grid');
        });

        it('defines responsive media query for landscape orientation (compact height)', () => {
            expect(styleCss).toContain('@media (max-height: 520px) and (orientation: landscape)');
            const landscapeBlock = styleCss.slice(styleCss.indexOf('@media (max-height: 520px)'));
            expect(landscapeBlock).toContain('.modal-sheet');
            expect(landscapeBlock).toContain('max-height: 85vh');
        });

        it('supports font scaling with scalable word-break on body', () => {
            expect(styleCss).toMatch(/body\s*\{[^}]*word-break:\s*break-word;/);
            expect(styleCss).toMatch(/body\s*\{[^}]*overflow-wrap:\s*break-word;/);
        });
    });

    describe('4. Form Error Management Helpers (Utils)', () => {
        // Lightweight DOM mock for testing setFieldError, clearFieldError, clearFormErrors
        function createMockDOM() {
            const listeners = {};
            const elements = {};

            function createElement(tag, id = '') {
                const el = {
                    tagName: tag.toUpperCase(),
                    id,
                    className: '',
                    textContent: '',
                    style: {},
                    attributes: {},
                    classList: {
                        add: (c) => {
                            if (!el.className.includes(c)) el.className += ' ' + c;
                        },
                        remove: (c) => {
                            el.className = el.className.replace(new RegExp('\\b' + c + '\\b', 'g'), '').trim();
                        },
                        contains: (c) => el.className.includes(c)
                    },
                    setAttribute: (k, v) => {
                        el.attributes[k] = v;
                    },
                    getAttribute: (k) => el.attributes[k] || null,
                    removeAttribute: (k) => {
                        delete el.attributes[k];
                    },
                    addEventListener: (event, handler) => {
                        listeners[event] = listeners[event] || [];
                        listeners[event].push(handler);
                    },
                    removeEventListener: (event, handler) => {
                        if (listeners[event]) {
                            listeners[event] = listeners[event].filter((h) => h !== handler);
                        }
                    },
                    dispatchEvent: (event) => {
                        if (listeners[event.type]) {
                            listeners[event.type].forEach((h) => h(event));
                        }
                    },
                    parentNode: null,
                    appendChild: (child) => {
                        child.parentNode = el;
                    }
                };
                if (id) elements[id] = el;
                return el;
            }

            const mockDocument = {
                getElementById: (id) => elements[id] || null,
                createElement
            };

            return { mockDocument, elements, createElement };
        }

        it('setFieldError applies is-invalid class, aria-invalid="true", and displays error text', () => {
            const { mockDocument, elements, createElement } = createMockDOM();
            global.document = mockDocument;

            const input = createElement('input', 'test-input');
            const errSpan = createElement('span', 'err-test-input');
            elements['test-input'] = input;
            elements['err-test-input'] = errSpan;

            Utils.setFieldError(input, 'Tahun motor tidak valid');

            expect(input.classList.contains('is-invalid')).toBe(true);
            expect(input.getAttribute('aria-invalid')).toBe('true');
            expect(input.getAttribute('aria-describedby')).toBe('err-test-input');
            expect(errSpan.textContent).toBe('Tahun motor tidak valid');
            expect(errSpan.style.display).toBe('block');
        });

        it('clearFieldError removes is-invalid, aria-invalid, and hides error message', () => {
            const { mockDocument, elements, createElement } = createMockDOM();
            global.document = mockDocument;

            const input = createElement('input', 'test-input');
            const errSpan = createElement('span', 'err-test-input');
            elements['test-input'] = input;
            elements['err-test-input'] = errSpan;

            Utils.setFieldError(input, 'Wajib diisi');
            expect(input.getAttribute('aria-invalid')).toBe('true');

            Utils.clearFieldError(input);

            expect(input.classList.contains('is-invalid')).toBe(false);
            expect(input.getAttribute('aria-invalid')).toBeNull();
            expect(errSpan.textContent).toBe('');
            expect(errSpan.style.display).toBe('none');
        });

        it('clearFormErrors clears all error states within a form', () => {
            const { mockDocument, elements, createElement } = createMockDOM();
            global.document = mockDocument;

            const form = createElement('form', 'form-test');
            const input1 = createElement('input', 'input1');
            const input2 = createElement('input', 'input2');
            const err1 = createElement('span', 'err-input1');
            const err2 = createElement('span', 'err-input2');

            form.querySelectorAll = (selector) => {
                if (selector.includes('is-invalid')) return [input1, input2];
                if (selector.includes('form-error')) return [err1, err2];
                return [];
            };

            elements['input1'] = input1;
            elements['input2'] = input2;
            elements['err-input1'] = err1;
            elements['err-input2'] = err2;

            Utils.setFieldError(input1, 'Err 1');
            Utils.setFieldError(input2, 'Err 2');

            Utils.clearFormErrors(form);

            expect(input1.classList.contains('is-invalid')).toBe(false);
            expect(input2.classList.contains('is-invalid')).toBe(false);
            expect(err1.textContent).toBe('');
            expect(err2.textContent).toBe('');
        });
    });
});
