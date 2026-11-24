/**
 * MotoCare v2.0 - UI Rendering Orchestrator Module
 * Coordinates UI views (Dashboard, Motor Selector, Motorku List, Theme, Empty States).
 * Subscribes to EventBus for targeted, granular re-renders.
 */
(function (root, factory) {
    const exported = factory();
    if (typeof root !== 'undefined' && root) {
        root.MotoCare = root.MotoCare || {};
        root.MotoCare.Render = exported;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = exported;
    }
})(typeof self !== 'undefined' ? self : typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    let _store = null;
    let _eventBus = null;
    let _utils = null;
    let _motoLogic = null;
    let _componentDefinitions = [];
    let _wizard = null;

    function init(deps) {
        _store = deps && deps.Store;
        _eventBus = deps && deps.EventBus;
        _utils = deps && deps.Utils;
        _motoLogic = deps && deps.MotoLogic;
        _componentDefinitions =
            (deps && deps.COMPONENT_DEFINITIONS) ||
            (typeof COMPONENT_DEFINITIONS !== 'undefined' ? COMPONENT_DEFINITIONS : []);
        _wizard = deps && deps.Wizard;

        if (_eventBus && _eventBus.EVENTS) {
            _eventBus.on(_eventBus.EVENTS.STATE_LOADED, () => renderAll());
            _eventBus.on(_eventBus.EVENTS.DATA_RESET, () => renderAll());
            _eventBus.on(_eventBus.EVENTS.MOTOR_SELECTED, (p) => {
                renderMotorSelector();
                renderDashboard(p.motor);
                renderMotorkuList();
            });
            _eventBus.on(_eventBus.EVENTS.MOTOR_ADDED, () => renderAll());
            _eventBus.on(_eventBus.EVENTS.MOTOR_DELETED, () => renderAll());
            _eventBus.on(_eventBus.EVENTS.ODOMETER_UPDATED, (p) => renderDashboard(p.motor));
            _eventBus.on(_eventBus.EVENTS.THEME_CHANGED, (p) => applyThemeUI(p.theme));
        }

        initListeners();
    }

    function toggleEmptyStates(hasMotors) {
        const berandaEmpty = document.getElementById('beranda-empty');
        const berandaDashboard = document.getElementById('beranda-dashboard');
        const motorkuEmpty = document.getElementById('motorku-empty');
        const motorkuList = document.getElementById('motorku-list');
        const bbmEmpty = document.getElementById('bbm-empty');
        const bbmContent = document.getElementById('bbm-content');
        const servisEmpty = document.getElementById('servis-empty');
        const servisContent = document.getElementById('servis-content');

        if (berandaEmpty && berandaDashboard) {
            berandaEmpty.style.display = hasMotors ? 'none' : 'block';
            berandaDashboard.style.display = hasMotors ? 'block' : 'none';
        }
        if (motorkuEmpty && motorkuList) {
            motorkuEmpty.style.display = hasMotors ? 'none' : 'block';
            motorkuList.style.display = hasMotors ? 'block' : 'none';
        }
        if (bbmEmpty && bbmContent) {
            bbmEmpty.style.display = hasMotors ? 'none' : 'block';
            bbmContent.style.display = hasMotors ? 'block' : 'none';
        }
        if (servisEmpty && servisContent) {
            servisEmpty.style.display = hasMotors ? 'none' : 'block';
            servisContent.style.display = hasMotors ? 'block' : 'none';
        }
    }

    function renderAll() {
        if (!_store) return;
        const motor = _store.getActiveMotor();
        const hasMotors = _store.getMotors().length > 0 && motor !== null;

        toggleEmptyStates(hasMotors);
        renderMotorSelector();
        applyThemeUI(_store.getTheme());

        if (hasMotors) {
            renderDashboard(motor);
            renderMotorkuList();
        }
    }

    function renderMotorSelector() {
        const select = document.getElementById('select-active-motor');
        const activeName = document.getElementById('active-motor-name');
        if (!select || !_store) return;

        select.innerHTML = '';
        const motors = _store.getMotors();

        if (motors.length === 0) {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = '— Belum Ada Motor —';
            select.appendChild(opt);
            select.disabled = true;
            if (activeName) activeName.textContent = '— Belum Ada Motor —';
            return;
        }

        select.disabled = false;
        motors.forEach((m) => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = (m.nickname || m.model) + ' (' + (m.plateNumber || 'No Plat') + ')';
            if (m.id === (_store.getActiveMotor() ? _store.getActiveMotor().id : '')) {
                opt.selected = true;
            }
            select.appendChild(opt);
        });

        const active = _store.getActiveMotor();
        if (activeName && active) {
            activeName.textContent = (active.nickname || active.model) + ' • ' + (active.plateNumber || '-');
        }
    }

    function renderDashboard(motor) {
        if (!motor) return;

        const odoDisplay = document.getElementById('odo-display');
        const odoBaseline = document.getElementById('odo-baseline');
        const odoTotal = document.getElementById('odo-total');

        const currentOdo = Number(motor.currentOdo) || 0;
        const baseOdo = Number(motor.initialOdo || motor.lastServiceOdo || 0);

        if (odoDisplay) odoDisplay.textContent = currentOdo.toLocaleString('id-ID');
        if (odoBaseline) odoBaseline.textContent = baseOdo.toLocaleString('id-ID') + ' KM';
        if (odoTotal) {
            const totalDist = Math.max(0, currentOdo - baseOdo);
            odoTotal.textContent = totalDist.toLocaleString('id-ID') + ' KM';
        }

        updateQuickStatus(motor);
        updateBerandaNotifications(motor);
    }

    function updateQuickStatus(motor) {
        if (!motor || !_motoLogic) return;

        // 1. Engine Oil
        const oilHealth = _motoLogic.getComponentHealth ? _motoLogic.getComponentHealth(motor, 'engineOil') : null;
        const qsOli = document.getElementById('qs-oli');
        if (qsOli && oilHealth) {
            qsOli.className = 'status-pill ' + oilHealth.status;
            qsOli.textContent = oilHealth.statusText;
        }

        // 2. V-Belt / Rantai
        const isMatic =
            motor.hasCVT !== false && motor.type !== 'sport' && motor.type !== 'trail' && motor.type !== 'bebek';
        const transKey = isMatic ? 'vBelt' : 'chainLube';
        const transHealth = _motoLogic.getComponentHealth ? _motoLogic.getComponentHealth(motor, transKey) : null;
        const qsVbelt = document.getElementById('qs-vbelt');
        if (qsVbelt && transHealth) {
            qsVbelt.className = 'status-pill ' + transHealth.status;
            qsVbelt.textContent = transHealth.statusText;
            const parent = qsVbelt.closest('.quick-status-item');
            if (parent) {
                const nameEl = parent.querySelector('.quick-status-name');
                if (nameEl) nameEl.textContent = isMatic ? 'V-Belt' : 'Rantai';
            }
        }

        // 3. Rem Depan
        const brakeHealth = _motoLogic.getComponentHealth
            ? _motoLogic.getComponentHealth(motor, 'brakePadFront')
            : null;
        const qsRem = document.getElementById('qs-rem');
        if (qsRem && brakeHealth) {
            qsRem.className = 'status-pill ' + brakeHealth.status;
            qsRem.textContent = brakeHealth.statusText;
        }

        // 4. Pajak STNK
        const qsPajak = document.getElementById('qs-pajak');
        if (qsPajak) {
            const taxStatus = _motoLogic.getTaxStatus
                ? _motoLogic.getTaxStatus(motor.taxAnnualDate)
                : { status: 'aman', label: 'AMAN' };
            qsPajak.className = 'status-pill ' + taxStatus.status;
            qsPajak.textContent = taxStatus.label;
        }
    }

    function updateBerandaNotifications(motor) {
        const notifContainer = document.getElementById('notif-list-beranda');
        const notifDot = document.getElementById('notif-dot');
        if (!notifContainer || !motor || !_motoLogic) return;

        const alerts = [];
        const isMatic =
            motor.hasCVT !== false && motor.type !== 'sport' && motor.type !== 'trail' && motor.type !== 'bebek';
        const keysToCheck = isMatic
            ? ['engineOil', 'gearOil', 'vBelt', 'rollerCVT', 'brakePadFront', 'airFilter']
            : ['engineOil', 'chainLube', 'chainAdjust', 'brakePadFront', 'airFilter'];

        keysToCheck.forEach((key) => {
            const h = _motoLogic.getComponentHealth ? _motoLogic.getComponentHealth(motor, key) : null;
            if (!h) return;
            const compDef = _componentDefinitions.find((c) => c.key === key);
            const name = compDef ? compDef.name : key;

            if (h.status === 'segera') {
                alerts.push({
                    level: 'danger',
                    icon: '🚨',
                    title: name + ' Melewati Batas Aman!',
                    desc: 'Sudah lebih ' + Math.abs(h.remainingKm).toLocaleString('id-ID') + ' KM dari batas servis.'
                });
            } else if (h.status === 'hampir') {
                alerts.push({
                    level: 'warning',
                    icon: '⚠️',
                    title: name + ' Siap Servis',
                    desc: 'Sisa pemakaian ' + h.remainingKm.toLocaleString('id-ID') + ' KM lagi.'
                });
            }
        });

        if (motor.taxAnnualDate) {
            const days = Math.ceil((new Date(motor.taxAnnualDate) - new Date()) / (1000 * 60 * 60 * 24));
            if (days <= 0) {
                alerts.push({
                    level: 'danger',
                    icon: '📋',
                    title: 'Pajak STNK Tahunan Jatuh Tempo!',
                    desc: 'Segera lakukan perpanjangan PKB tahunan di Samsat/Signal.'
                });
            } else if (days <= 30) {
                alerts.push({
                    level: 'warning',
                    icon: '📋',
                    title: 'Pajak STNK Tahunan Jatuh Tempo H-' + days,
                    desc: 'Jatuh tempo pada tanggal ' + motor.taxAnnualDate + '.'
                });
            }
        }

        if (notifDot) {
            notifDot.style.display = alerts.length > 0 ? 'inline-block' : 'none';
        }

        if (alerts.length === 0) {
            notifContainer.innerHTML =
                '<p class="text-secondary text-sm text-center" style="padding:16px 0;">Semua komponen dalam kondisi baik ✅</p>';
            return;
        }

        const escapeHtml = _utils ? _utils.escapeHtml : (s) => s;
        let html = '';
        alerts.forEach((a) => {
            const borderCol = a.level === 'danger' ? 'var(--status-danger)' : 'var(--accent-primary)';
            const bgCol = a.level === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 107, 0, 0.1)';
            html +=
                '<div class="p-8 mb-8" style="background:' +
                bgCol +
                '; border-left:3px solid ' +
                borderCol +
                '; border-radius:6px;">' +
                '<div class="d-flex align-center gap-8">' +
                '<span style="font-size:16px;">' +
                escapeHtml(a.icon) +
                '</span>' +
                '<div>' +
                '<div class="font-bold text-xs" style="color:var(--text-primary);">' +
                escapeHtml(a.title) +
                '</div>' +
                '<div class="text-xs text-secondary">' +
                escapeHtml(a.desc) +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
        });
        notifContainer.innerHTML = html;
    }

    function renderMotorkuList() {
        const container = document.getElementById('motorku-list');
        if (!container || !_store) return;

        container.innerHTML = '';
        const escapeHtml = _utils ? _utils.escapeHtml : (s) => s;
        const activeMotor = _store.getActiveMotor();
        const activeId = activeMotor ? activeMotor.id : null;

        _store.getMotors().forEach((m) => {
            const isActive = m.id === activeId;
            const card = document.createElement('div');
            card.className = 'motor-card' + (isActive ? ' active-card' : '');
            card.style.cssText =
                'position:relative; background:var(--bg-card); border:1px solid ' +
                (isActive ? 'var(--accent-primary)' : 'var(--border-color)') +
                '; border-radius:var(--radius-card); padding:16px; margin-bottom:12px; box-shadow:var(--shadow-retro);';

            const activeBadge = isActive
                ? '<span style="background:var(--accent-primary); color:#fff; font-size:10px; font-weight:700; padding:2px 8px; border-radius:12px;">AKTIF</span>'
                : '<button class="retro-btn retro-btn-sm btn-activate-motor" data-id="' +
                  escapeHtml(m.id) +
                  '">Pilih</button>';

            card.innerHTML =
                '<div class="d-flex justify-between align-center mb-8">' +
                '<div>' +
                '<span class="motor-badge" style="background:rgba(255,107,0,0.15); color:var(--accent-primary); font-size:11px; font-weight:700; padding:2px 8px; border-radius:4px; margin-right:6px;">' +
                escapeHtml(m.brand || 'Motor') +
                '</span>' +
                '<span class="font-bold" style="font-size:15px; color:var(--text-primary);">' +
                escapeHtml(m.nickname || m.model) +
                '</span>' +
                '</div>' +
                activeBadge +
                '</div>' +
                '<div class="text-xs text-secondary mb-8">' +
                '<div>Plat: <strong style="color:var(--text-primary);">' +
                escapeHtml(m.plateNumber || '-') +
                '</strong> • Tahun: ' +
                escapeHtml(m.year || '-') +
                '</div>' +
                '<div>Odometer: <strong style="color:var(--accent-primary); font-family:var(--font-heading); font-size:16px;">' +
                (Number(m.currentOdo) || 0).toLocaleString('id-ID') +
                ' KM</strong></div>' +
                (m.engine ? '<div>Mesin: ' + escapeHtml(m.engine) + '</div>' : '') +
                '</div>' +
                '<div class="d-flex justify-between align-center pt-8" style="border-top:1px dashed var(--border-color);">' +
                '<span class="text-xs text-secondary">' +
                (m.isUsedMotor ? '🛵 Motor Second / Bekas' : '✨ Motor Baru') +
                '</span>' +
                '<button class="retro-btn retro-btn-danger retro-btn-sm btn-delete-motor" data-id="' +
                escapeHtml(m.id) +
                '">Hapus</button>' +
                '</div>';

            container.appendChild(card);
        });

        container.querySelectorAll('.btn-activate-motor').forEach((b) => {
            b.addEventListener('click', () => {
                const id = b.getAttribute('data-id');
                const m = _store.setActiveMotor(id);
                if (m && _utils) {
                    _utils.showToast('Beralih ke motor: ' + (m.nickname || m.model));
                }
            });
        });

        container.querySelectorAll('.btn-delete-motor').forEach((b) => {
            b.addEventListener('click', () => {
                if (_wizard && typeof _wizard.confirmDeleteMotor === 'function') {
                    _wizard.confirmDeleteMotor(b.getAttribute('data-id'));
                }
            });
        });
    }

    function applyThemeUI(themeName) {
        const theme = themeName === 'light' ? 'light' : 'dark';
        const body = document.body;
        if (body) {
            body.classList.remove('theme-dark', 'theme-light');
            body.classList.add(theme === 'light' ? 'theme-light' : 'theme-dark');
        }

        const sunIcon = document.getElementById('icon-sun');
        const moonIcon = document.getElementById('icon-moon');
        const themeToggleCheckbox = document.getElementById('toggle-dark-mode');

        if (theme === 'light') {
            if (sunIcon) sunIcon.style.display = 'none';
            if (moonIcon) moonIcon.style.display = 'block';
            if (themeToggleCheckbox) themeToggleCheckbox.checked = false;
        } else {
            if (sunIcon) sunIcon.style.display = 'block';
            if (moonIcon) moonIcon.style.display = 'none';
            if (themeToggleCheckbox) themeToggleCheckbox.checked = true;
        }
    }

    function openOdoModal() {
        if (!_store) return;
        const motor = _store.getActiveMotor();
        if (!motor) return;

        const input = document.getElementById('odo-input');
        if (input) input.value = motor.currentOdo || 0;

        if (_utils && typeof _utils.clearFormErrors === 'function') {
            _utils.clearFormErrors('form-odo');
        }

        if (_utils) _utils.openModal('modal-odo');
    }

    function handleOdoSubmit(e) {
        if (e) e.preventDefault();
        if (!_store) return;
        const motor = _store.getActiveMotor();
        if (!motor) return;

        if (_utils && typeof _utils.clearFormErrors === 'function') {
            _utils.clearFormErrors('form-odo');
        }

        const input = document.getElementById('odo-input');
        const newOdo = Number(input && input.value);

        if (isNaN(newOdo) || newOdo < 0) {
            const err = 'Masukkan angka odometer yang valid (minimal 0)!';
            if (_utils) {
                if (typeof _utils.setFieldError === 'function') {
                    _utils.setFieldError('odo-input', err);
                }
                _utils.showToast('⚠️ ' + err);
            }
            if (input && typeof input.focus === 'function') {
                input.focus();
            }
            return;
        }

        if (newOdo < (motor.currentOdo || 0)) {
            if (
                !confirm(
                    'Odometer baru (' +
                        newOdo +
                        ') lebih kecil dari sebelumnya (' +
                        motor.currentOdo +
                        '). Lanjutkan koreksi?'
                )
            ) {
                return;
            }
        }

        _store.updateOdometer(newOdo);

        if (_utils) {
            _utils.closeModal('modal-odo');
            _utils.showToast('✅ Odometer diperbarui ke: ' + newOdo.toLocaleString('id-ID') + ' KM');
        }
    }

    function initListeners() {
        // Theme toggle buttons
        const btnThemeToggle = document.getElementById('btn-theme-toggle');
        if (btnThemeToggle) {
            btnThemeToggle.addEventListener('click', () => {
                if (!_store) return;
                const next = _store.getTheme() === 'dark' ? 'light' : 'dark';
                _store.setTheme(next);
                if (_utils)
                    _utils.showToast(
                        next === 'dark' ? '🌙 Tema Gelap Retro diaktifkan' : '☀️ Tema Terang Klasik diaktifkan'
                    );
            });
        }

        const toggleDarkMode = document.getElementById('toggle-dark-mode');
        if (toggleDarkMode) {
            toggleDarkMode.addEventListener('change', function () {
                if (_store) _store.setTheme(this.checked ? 'dark' : 'light');
            });
        }

        // Active Motor Selector
        const selectActiveMotor = document.getElementById('select-active-motor');
        if (selectActiveMotor) {
            selectActiveMotor.addEventListener('change', function () {
                if (this.value && _store) {
                    const m = _store.setActiveMotor(this.value);
                    if (m && _utils) _utils.showToast('Beralih ke motor: ' + (m.nickname || m.model));
                }
            });
        }

        // Odometer Update
        const btnUpdateOdo = document.getElementById('btn-update-odo');
        if (btnUpdateOdo) btnUpdateOdo.addEventListener('click', openOdoModal);

        const formOdo = document.getElementById('form-odo');
        if (formOdo) formOdo.addEventListener('submit', handleOdoSubmit);

        const btnCancelOdo = document.getElementById('btn-modal-odo-cancel');
        if (btnCancelOdo) {
            btnCancelOdo.addEventListener('click', () => {
                if (_utils) _utils.closeModal('modal-odo');
            });
        }
    }

    return {
        init,
        renderAll,
        renderDashboard,
        renderMotorSelector,
        renderMotorkuList,
        toggleEmptyStates,
        applyThemeUI,
        openOdoModal,
        handleOdoSubmit,
        initListeners
    };
});
