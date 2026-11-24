/**
 * MotoCare v2.0 - Utilities Module
 * General UI and formatting helpers: XSS escaping, modal controllers, toasts.
 */
(function (root, factory) {
    const exported = factory();
    if (typeof root !== 'undefined' && root) {
        root.MotoCare = root.MotoCare || {};
        root.MotoCare.Utils = exported;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = exported;
    }
})(typeof self !== 'undefined' ? self : typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    let toastTimeout = null;

    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        const s = String(str);
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return s.replace(/[&<>"']/g, (c) => map[c]);
    }

    function openModal(modalId) {
        const el = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
        if (el) {
            el.classList.add('active');
        }
    }

    function closeModal(modalId) {
        const el = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
        if (el) {
            el.classList.remove('active');
        }
    }

    function showToast(msg) {
        const el = document.getElementById('toast-msg');
        if (!el) {
            console.log('[Toast]', msg);
            return;
        }
        el.textContent = msg;
        el.className = 'toast show';
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            el.className = 'toast';
        }, 3200);

        if (typeof window !== 'undefined' && window.Android && window.Android.showToast) {
            window.Android.showToast(msg);
        }
    }

    function initDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        ['bbm-tanggal', 'servis-log-date', 'ganti-komp-date', 'odo-date'].forEach((id) => {
            const el = document.getElementById(id);
            if (el && !el.value) el.value = today;
        });
    }

    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
        }
        if (typeof window !== 'undefined' && window.Android && window.Android.copyToClipboard) {
            window.Android.copyToClipboard(text);
            return Promise.resolve();
        }
        fallbackCopy(text);
        return Promise.resolve();
    }

    function fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
    }

    /**
     * Accessible Form Validation Error Helpers (WCAG 3.3.1 / 3.3.2)
     */
    function setFieldError(fieldOrId, errorMessage) {
        if (!fieldOrId) return;
        const inputEl = typeof fieldOrId === 'string' ? document.getElementById(fieldOrId) : fieldOrId;
        if (!inputEl) return;

        inputEl.classList.add('is-invalid');
        inputEl.setAttribute('aria-invalid', 'true');

        const errorSpanId = 'err-' + (inputEl.id || 'field');
        inputEl.setAttribute('aria-describedby', errorSpanId);

        let errEl = document.getElementById(errorSpanId);
        if (!errEl && inputEl.parentNode) {
            errEl = document.createElement('span');
            errEl.id = errorSpanId;
            errEl.className = 'form-error';
            errEl.setAttribute('role', 'alert');
            errEl.setAttribute('aria-live', 'assertive');
            inputEl.parentNode.appendChild(errEl);
        }
        if (errEl) {
            errEl.textContent = errorMessage;
            errEl.style.display = 'block';
        }

        const clearHandler = function () {
            clearFieldError(inputEl);
            inputEl.removeEventListener('input', clearHandler);
            inputEl.removeEventListener('change', clearHandler);
        };
        inputEl.addEventListener('input', clearHandler);
        inputEl.addEventListener('change', clearHandler);
    }

    function clearFieldError(fieldOrId) {
        if (!fieldOrId) return;
        const inputEl = typeof fieldOrId === 'string' ? document.getElementById(fieldOrId) : fieldOrId;
        if (!inputEl) return;

        inputEl.classList.remove('is-invalid');
        inputEl.removeAttribute('aria-invalid');
        inputEl.removeAttribute('aria-describedby');

        const errorSpanId = 'err-' + (inputEl.id || 'field');
        const errEl = document.getElementById(errorSpanId);
        if (errEl) {
            errEl.textContent = '';
            errEl.style.display = 'none';
        }
    }

    function clearFormErrors(formOrId) {
        if (!formOrId) return;
        const formEl = typeof formOrId === 'string' ? document.getElementById(formOrId) : formOrId;
        if (!formEl) return;

        const invalidFields = formEl.querySelectorAll('.is-invalid, [aria-invalid="true"]');
        invalidFields.forEach((el) => clearFieldError(el));

        const errorSpans = formEl.querySelectorAll('.form-error');
        errorSpans.forEach((el) => {
            el.textContent = '';
            el.style.display = 'none';
        });
    }

    return {
        escapeHtml,
        openModal,
        closeModal,
        showToast,
        initDefaultDates,
        copyToClipboard,
        setFieldError,
        clearFieldError,
        clearFormErrors
    };
});
