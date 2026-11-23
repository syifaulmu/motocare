/**
 * MotoCare v2.0 - Core Application Logic
 * Public Release Edition: Multi-motor, 34 Presets, Retro UI,
 * Full-to-Full Fuel Tracking, 15 Component Gauges, Live Camera,
 * Gemini AI Diagnostics, and Android System Notifications.
 */

(function () {
    'use strict';

    // =========================================================================
    // CONSTANTS & STATE
    // =========================================================================
    const STORAGE_KEY = 'motocare_v2_store';

    const DEFAULT_SETTINGS = {
        enabled: true,
        overdueDailyAlerts: true,
        idealWindowAlerts: true,
        taxAlerts: true,
        lastNotificationDates: {}
    };

    let state = {
        motors: [],
        activeMotorId: null,
        fuelLogs: [],
        serviceLogs: [],
        checklistStates: {},
        notificationSettings: Object.assign({}, DEFAULT_SETTINGS),
        theme: 'dark'
    };

    // Camera Stream Tracker
    let activeCameraStream = null;
    let cameraFacingMode = 'environment';

    // =========================================================================
    // MODAL HELPERS (Supports both .open and .active for CSS reliability)
    // =========================================================================
    function openModal(modalId) {
        const el = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
        if (el) {
            el.classList.add('open', 'active');
        }
    }

    function closeModal(modalId) {
        const el = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
        if (el) {
            el.classList.remove('open', 'active');
        }
    }


    // Wizard Tracker
    let wizardSelectedBrand = '';
    let wizardSelectedPresetId = '';

    // =========================================================================
    // INITIALIZATION
    // =========================================================================
    function init() {
        loadState();
        applyTheme(state.theme);
        initNavigation();
        initEventListeners();
        initDefaultDates();
        renderAll();
        checkAndSendNotifications();
    }

    function loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                state = Object.assign({}, state, parsed);
                if (!state.notificationSettings) {
                    state.notificationSettings = Object.assign({}, DEFAULT_SETTINGS);
                }
            } else {
                // Default start: Clean empty state for public release
                state.motors = [];
                state.activeMotorId = null;
                state.fuelLogs = [];
                state.serviceLogs = [];
                state.checklistStates = {};
                state.notificationSettings = Object.assign({}, DEFAULT_SETTINGS);
                state.theme = 'dark';
            }
        } catch (e) {
            console.error('Failed to load state:', e);
        }
    }

    function saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.error('Failed to save state:', e);
        }
    }

    function initDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        ['bbm-tanggal', 'servis-log-date', 'ganti-komp-date', 'odo-date'].forEach(id => {
            const el = document.getElementById(id);
            if (el && !el.value) el.value = today;
        });
    }

    // =========================================================================
    // THEME MANAGEMENT (Dark Retro / Light Cream)
    // =========================================================================
    function applyTheme(themeName) {
        state.theme = themeName === 'light' ? 'light' : 'dark';
        const body = document.body;
        body.classList.remove('theme-dark', 'theme-light');
        body.classList.add(state.theme === 'light' ? 'theme-light' : 'theme-dark');

        const sunIcon = document.getElementById('icon-sun');
        const moonIcon = document.getElementById('icon-moon');
        const themeToggleCheckbox = document.getElementById('toggle-dark-mode');

        if (state.theme === 'light') {
            if (sunIcon) sunIcon.style.display = 'none';
            if (moonIcon) moonIcon.style.display = 'block';
            if (themeToggleCheckbox) themeToggleCheckbox.checked = false;
        } else {
            if (sunIcon) sunIcon.style.display = 'block';
            if (moonIcon) moonIcon.style.display = 'none';
            if (themeToggleCheckbox) themeToggleCheckbox.checked = true;
        }
        saveState();
    }

    function toggleTheme() {
        const next = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        showToast(next === 'dark' ? '🌙 Tema Gelap Retro diaktifkan' : '☀️ Tema Terang Klasik diaktifkan');
    }

    // =========================================================================
    // NAVIGATION
    // =========================================================================
    function initNavigation() {
        const navButtons = document.querySelectorAll('.bottom-nav .nav-item');
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-tab');
                switchTab(tab);
            });
        });

        // Servis secondary subtabs
        const subtabs = document.querySelectorAll('.servis-tab-btn');
        subtabs.forEach(btn => {
            btn.addEventListener('click', () => {
                const subtab = btn.getAttribute('data-subtab');
                switchServisSubtab(subtab);
            });
        });

        // Shortcuts
        const btnLihatSemua = document.getElementById('btn-lihat-semua-komponen');
        if (btnLihatSemua) {
            btnLihatSemua.addEventListener('click', () => {
                switchTab('servis');
                switchServisSubtab('komponen');
            });
        }
    }

    function switchTab(tabName) {
        document.querySelectorAll('.bottom-nav .nav-item').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
        });

        document.querySelectorAll('.page-section').forEach(sec => {
            const match = sec.getAttribute('id') === 'section-' + tabName;
            sec.classList.toggle('active', match);
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function switchServisSubtab(subtabName) {
        document.querySelectorAll('.servis-tab-btn').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-subtab') === subtabName);
        });
        const subKomponen = document.getElementById('servis-sub-komponen');
        const subLog = document.getElementById('servis-sub-log');
        const subChecklist = document.getElementById('servis-sub-checklist');

        if (subKomponen) subKomponen.style.display = subtabName === 'komponen' ? 'block' : 'none';
        if (subLog) subLog.style.display = subtabName === 'log' ? 'block' : 'none';
        if (subChecklist) subChecklist.style.display = subtabName === 'checklist' ? 'block' : 'none';
    }

    // =========================================================================
    // ACTIVE MOTOR & DATA HELPERS
    // =========================================================================
    function getActiveMotor() {
        if (!state.motors || state.motors.length === 0) return null;
        let motor = state.motors.find(m => m.id === state.activeMotorId);
        if (!motor) {
            motor = state.motors[0];
            state.activeMotorId = motor.id;
        }
        return motor;
    }

    function setActiveMotor(motorId) {
        const found = state.motors.find(m => m.id === motorId);
        if (found) {
            state.activeMotorId = motorId;
            saveState();
            renderAll();
            checkAndSendNotifications();
            showToast('Beralih ke motor: ' + (found.nickname || found.model));
        }
    }

    function getPreset(presetId) {
        if (typeof MOTOR_PRESETS === 'undefined') return null;
        return MOTOR_PRESETS.find(p => p.id === presetId) || null;
    }

    // =========================================================================
    // RENDERING MASTER
    // =========================================================================
    function renderAll() {
        const motor = getActiveMotor();
        const hasMotors = state.motors.length > 0 && motor !== null;

        // Toggle Empty vs Dashboard across sections
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

        renderMotorSelector();

        if (hasMotors) {
            renderBeranda(motor);
            renderMotorkuList();
            renderBBM(motor);
            renderServis(motor);
            renderChecklist(motor);
            renderBaselineSettings(motor);
        }
    }

    function renderMotorSelector() {
        const select = document.getElementById('select-active-motor');
        const activeName = document.getElementById('active-motor-name');
        if (!select) return;

        select.innerHTML = '';
        if (state.motors.length === 0) {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = '— Belum Ada Motor —';
            select.appendChild(opt);
            select.disabled = true;
            if (activeName) activeName.textContent = '— Belum Ada Motor —';
            return;
        }

        select.disabled = false;
        state.motors.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = (m.nickname || m.model) + ' (' + (m.plateNumber || 'No Plat') + ')';
            if (m.id === state.activeMotorId) {
                opt.selected = true;
            }
            select.appendChild(opt);
        });

        const active = getActiveMotor();
        if (activeName && active) {
            activeName.textContent = (active.nickname || active.model) + ' • ' + (active.plateNumber || '-');
        }
    }

    // =========================================================================
    // BERANDA / DASHBOARD RENDERING
    // =========================================================================
    function renderBeranda(motor) {
        if (!motor) return;

        // Odometer display
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

        // Quick Status Items
        updateQuickStatus(motor);

        // Notifications List on Beranda
        updateBerandaNotifications(motor);
    }

    function getComponentHealth(motor, key) {
        const preset = getPreset(motor.presetId);
        const intervals = (preset && preset.serviceIntervals) ? preset.serviceIntervals : (motor.serviceIntervals || {});
        const noticeWindows = (preset && preset.idealNoticeWindows) ? preset.idealNoticeWindows : {};

        const interval = intervals[key] || 2500;
        const currentOdo = Number(motor.currentOdo) || 0;

        let lastReplaced = (motor.componentReplacedOdo && motor.componentReplacedOdo[key] !== undefined)
            ? Number(motor.componentReplacedOdo[key])
            : null;

        let isEstimated = false;
        if (lastReplaced === null || isNaN(lastReplaced)) {
            // Intelligent Cycle Estimation
            const completedCycles = Math.floor(currentOdo / interval);
            lastReplaced = completedCycles * interval;
            isEstimated = true;
        }

        const nextServiceOdo = lastReplaced + interval;
        const remainingKm = nextServiceOdo - currentOdo;
        const noticeWindow = noticeWindows[key] || Math.round(interval * 0.15);

        let status = 'aman'; // 'aman', 'hampir', 'segera'
        let statusText = 'AMAN';

        if (remainingKm <= 0) {
            status = 'segera';
            statusText = 'SEGERA';
        } else if (remainingKm <= noticeWindow) {
            status = 'hampir';
            statusText = 'HAMPIR';
        }

        const usedKm = Math.max(0, currentOdo - lastReplaced);
        const percent = Math.min(100, Math.max(0, Math.round((usedKm / interval) * 100)));

        return {
            key,
            interval,
            lastReplaced,
            nextServiceOdo,
            remainingKm,
            noticeWindow,
            status,
            statusText,
            percent,
            isEstimated
        };
    }

    function updateQuickStatus(motor) {
        // 1. Oli
        const oilHealth = getComponentHealth(motor, 'engineOil');
        const qsOli = document.getElementById('qs-oli');
        if (qsOli) {
            qsOli.className = 'status-pill ' + oilHealth.status;
            qsOli.textContent = oilHealth.statusText;
        }

        // 2. V-Belt / Rantai
        const isMatic = motor.hasCVT !== false && motor.type !== 'sport' && motor.type !== 'trail' && motor.type !== 'bebek';
        const transKey = isMatic ? 'vBelt' : 'chainLube';
        const transHealth = getComponentHealth(motor, transKey);
        const qsVbelt = document.getElementById('qs-vbelt');
        if (qsVbelt) {
            qsVbelt.className = 'status-pill ' + transHealth.status;
            qsVbelt.textContent = transHealth.statusText;
            const parent = qsVbelt.closest('.quick-status-item');
            if (parent) {
                const nameEl = parent.querySelector('.quick-status-name');
                if (nameEl) nameEl.textContent = isMatic ? 'V-Belt' : 'Rantai';
            }
        }

        // 3. Rem
        const brakeHealth = getComponentHealth(motor, 'brakePadFront');
        const qsRem = document.getElementById('qs-rem');
        if (qsRem) {
            qsRem.className = 'status-pill ' + brakeHealth.status;
            qsRem.textContent = brakeHealth.statusText;
        }

        // 4. Pajak STNK
        const qsPajak = document.getElementById('qs-pajak');
        if (qsPajak) {
            if (motor.taxAnnualDate) {
                const daysRemaining = Math.ceil((new Date(motor.taxAnnualDate) - new Date()) / (1000 * 60 * 60 * 24));
                if (daysRemaining <= 0) {
                    qsPajak.className = 'status-pill segera';
                    qsPajak.textContent = 'SEGERA';
                } else if (daysRemaining <= 30) {
                    qsPajak.className = 'status-pill hampir';
                    qsPajak.textContent = 'H-' + daysRemaining;
                } else {
                    qsPajak.className = 'status-pill aman';
                    qsPajak.textContent = 'AMAN';
                }
            } else {
                qsPajak.className = 'status-pill aman';
                qsPajak.textContent = 'AMAN';
            }
        }
    }

    function updateBerandaNotifications(motor) {
        const notifContainer = document.getElementById('notif-list-beranda');
        const notifDot = document.getElementById('notif-dot');
        if (!notifContainer) return;

        const alerts = [];
        const isMatic = motor.hasCVT !== false && motor.type !== 'sport' && motor.type !== 'trail' && motor.type !== 'bebek';

        const keysToCheck = isMatic
            ? ['engineOil', 'gearOil', 'vBelt', 'rollerCVT', 'brakePadFront', 'airFilter']
            : ['engineOil', 'chainLube', 'chainAdjust', 'brakePadFront', 'airFilter'];

        keysToCheck.forEach(key => {
            const h = getComponentHealth(motor, key);
            const compDef = (typeof COMPONENT_DEFINITIONS !== 'undefined')
                ? COMPONENT_DEFINITIONS.find(c => c.key === key)
                : null;
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

        // STNK Tax
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
            notifContainer.innerHTML = '<p class="text-secondary text-sm text-center" style="padding:16px 0;">Semua komponen dalam kondisi baik ✅</p>';
            return;
        }

        let html = '';
        alerts.forEach(a => {
            const borderCol = a.level === 'danger' ? 'var(--status-danger)' : 'var(--accent-primary)';
            const bgCol = a.level === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 107, 0, 0.1)';
            html += '<div class="p-8 mb-8" style="background:' + bgCol + '; border-left:3px solid ' + borderCol + '; border-radius:6px;">' +
                '<div class="d-flex align-center gap-8">' +
                '<span style="font-size:16px;">' + a.icon + '</span>' +
                '<div>' +
                '<div class="font-bold text-xs" style="color:var(--text-primary);">' + a.title + '</div>' +
                '<div class="text-xs text-secondary">' + a.desc + '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
        });
        notifContainer.innerHTML = html;
    }

    // =========================================================================
    // MOTORKU LIST RENDERING & WIZARD
    // =========================================================================
    function renderMotorkuList() {
        const container = document.getElementById('motorku-list');
        if (!container) return;

        container.innerHTML = '';
        state.motors.forEach(m => {
            const isActive = m.id === state.activeMotorId;
            const card = document.createElement('div');
            card.className = 'motor-card' + (isActive ? ' active-card' : '');
            card.style.cssText = 'position:relative; background:var(--bg-card); border:1px solid ' +
                (isActive ? 'var(--accent-primary)' : 'var(--border-color)') +
                '; border-radius:var(--radius-card); padding:16px; margin-bottom:12px; box-shadow:var(--shadow-retro);';

            const activeBadge = isActive
                ? '<span style="background:var(--accent-primary); color:#fff; font-size:10px; font-weight:700; padding:2px 8px; border-radius:12px;">AKTIF</span>'
                : '<button class="retro-btn retro-btn-sm btn-activate-motor" data-id="' + m.id + '">Pilih</button>';

            card.innerHTML =
                '<div class="d-flex justify-between align-center mb-8">' +
                '<div>' +
                '<span class="motor-badge" style="background:rgba(255,107,0,0.15); color:var(--accent-primary); font-size:11px; font-weight:700; padding:2px 8px; border-radius:4px; margin-right:6px;">' + (m.brand || 'Motor') + '</span>' +
                '<span class="font-bold" style="font-size:15px; color:var(--text-primary);">' + (m.nickname || m.model) + '</span>' +
                '</div>' +
                activeBadge +
                '</div>' +
                '<div class="text-xs text-secondary mb-8">' +
                '<div>Plat: <strong style="color:var(--text-primary);">' + (m.plateNumber || '-') + '</strong> • Tahun: ' + (m.year || '-') + '</div>' +
                '<div>Odometer: <strong style="color:var(--accent-primary); font-family:var(--font-heading); font-size:16px;">' + (Number(m.currentOdo) || 0).toLocaleString('id-ID') + ' KM</strong></div>' +
                (m.engine ? '<div>Mesin: ' + m.engine + '</div>' : '') +
                '</div>' +
                '<div class="d-flex justify-between align-center pt-8" style="border-top:1px dashed var(--border-color);">' +
                '<span class="text-xs text-secondary">' + (m.isUsedMotor ? '🛵 Motor Second / Bekas' : '✨ Motor Baru') + '</span>' +
                '<button class="retro-btn retro-btn-danger retro-btn-sm btn-delete-motor" data-id="' + m.id + '">Hapus</button>' +
                '</div>';

            container.appendChild(card);
        });

        // Event delegation for list actions
        container.querySelectorAll('.btn-activate-motor').forEach(b => {
            b.addEventListener('click', () => {
                setActiveMotor(b.getAttribute('data-id'));
            });
        });

        container.querySelectorAll('.btn-delete-motor').forEach(b => {
            b.addEventListener('click', () => {
                confirmDeleteMotor(b.getAttribute('data-id'));
            });
        });
    }

        // =========================================================================
    // MOTORKU LIST RENDERING & TAMBAH MOTOR FORM
    // =========================================================================
    function openAddMotorWizard() {
        initBrandAndModelSelectors();

        const nickInput = document.getElementById('motor-nickname');
        const yearInput = document.getElementById('motor-year');
        const odoInput = document.getElementById('motor-odo');
        const plateInput = document.getElementById('motor-plate');
        const notesInput = document.getElementById('motor-notes');

        if (yearInput && !yearInput.value) yearInput.value = '2022';
        if (odoInput && !odoInput.value) odoInput.value = '0';
        if (plateInput) plateInput.value = '';
        if (notesInput) notesInput.value = '';

        openModal('modal-motor');
    }

    function initBrandAndModelSelectors() {
        const brandSelect = document.getElementById('motor-brand');
        const modelSelect = document.getElementById('motor-model');
        const customWrap = document.getElementById('motor-custom-model-wrap');
        const nickInput = document.getElementById('motor-nickname');

        if (!brandSelect || !modelSelect) return;

        function updateModelList() {
            const selectedBrand = brandSelect.value;
            modelSelect.innerHTML = '';

            let filtered = [];
            if (typeof MOTOR_PRESETS !== 'undefined') {
                filtered = MOTOR_PRESETS.filter(p => {
                    if (selectedBrand === 'Custom / Lainnya') return p.brand === 'Custom' || p.id === 'custom-motor';
                    return p.brand.toLowerCase() === selectedBrand.toLowerCase();
                });
            }

            filtered.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = p.model + (p.engine ? ' — ' + p.engine.split(' ')[0] : '');
                modelSelect.appendChild(opt);
            });

            const customOpt = document.createElement('option');
            customOpt.value = 'custom';
            customOpt.textContent = '➕ Ketik Model Motor Sendiri...';
            modelSelect.appendChild(customOpt);

            if (filtered.length > 0) {
                modelSelect.value = filtered[0].id;
                if (nickInput && (!nickInput.value || nickInput.dataset.autofilled === 'true')) {
                    nickInput.value = filtered[0].model;
                    nickInput.dataset.autofilled = 'true';
                }
            }

            checkCustomModelVisibility();
        }

        function checkCustomModelVisibility() {
            const isCustom = modelSelect.value === 'custom';
            if (customWrap) {
                customWrap.style.display = isCustom ? 'block' : 'none';
            }
            if (!isCustom && nickInput) {
                const preset = getPreset(modelSelect.value);
                if (preset && (!nickInput.value || nickInput.dataset.autofilled === 'true')) {
                    nickInput.value = preset.model;
                    nickInput.dataset.autofilled = 'true';
                }
            }
        }

        brandSelect.onchange = updateModelList;
        modelSelect.onchange = checkCustomModelVisibility;

        if (nickInput) {
            nickInput.oninput = function() {
                this.dataset.autofilled = 'false';
            };
        }

        updateModelList();
    }

    function handleSaveNewMotor(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const brandSelect = document.getElementById('motor-brand');
        const modelSelect = document.getElementById('motor-model');
        const customInput = document.getElementById('motor-custom-model');
        const nickInput = document.getElementById('motor-nickname');
        const plateInput = document.getElementById('motor-plate');
        const yearInput = document.getElementById('motor-year');
        const odoInput = document.getElementById('motor-odo');
        const notesInput = document.getElementById('motor-notes');

        const brand = brandSelect ? brandSelect.value : 'Honda';
        const presetId = modelSelect ? modelSelect.value : '';
        const isCustom = presetId === 'custom' || brand === 'Custom / Lainnya';

        const customModelText = (customInput && customInput.value.trim()) || '';
        const preset = (!isCustom && typeof MOTOR_PRESETS !== 'undefined') ? getPreset(presetId) : null;

        const modelName = isCustom
            ? (customModelText || 'Sepeda Motor Kustom')
            : (preset ? preset.model : 'Sepeda Motor');

        let nickname = (nickInput && nickInput.value.trim()) || '';
        if (!nickname) nickname = modelName;

        const plate = (plateInput && plateInput.value.trim()) || '';
        const year = Number(yearInput && yearInput.value) || new Date().getFullYear();
        const initialOdo = Number(odoInput && odoInput.value) || 0;
        const notes = (notesInput && notesInput.value.trim()) || '';

        const newId = 'motor-' + Date.now();
        const newMotor = {
            id: newId,
            presetId: isCustom ? 'custom-motor' : presetId,
            brand: brand.replace(' / Lainnya', ''),
            model: modelName,
            nickname: nickname,
            plateNumber: plate,
            year: year,
            currentOdo: initialOdo,
            initialOdo: initialOdo,
            tankCapacity: preset ? preset.tankCapacity : 4.5,
            engineOilCapacity: preset ? preset.engineOilCapacity : 0.8,
            engineOilSpec: preset ? preset.engineOilSpec : 'SAE 10W-30 / 10W-40',
            gearOilCapacity: preset ? preset.gearOilCapacity : 120,
            hasRadiator: preset ? preset.hasRadiator : false,
            hasCVT: preset ? preset.hasCVT : true,
            type: preset ? preset.type : 'matic',
            serviceIntervals: preset ? Object.assign({}, preset.serviceIntervals) : {
                engineOil: 2500,
                gearOil: 8000,
                vBelt: 24000,
                rollerCVT: 20000,
                airFilter: 15000,
                sparkPlug: 8000,
                coolant: 12000,
                brakePadFront: 12000,
                brakePadRear: 12000,
                tireFront: 20000,
                tireRear: 18000,
                brakeFluid: 20000,
                cvtClean: 8000,
                chainLube: 1000,
                chainAdjust: 2000
            },
            taxAnnualDate: '',
            tax5YearDate: '',
            isUsedMotor: initialOdo > 1000,
            notes: notes,
            lastServiceOdo: initialOdo,
            lastServiceDate: new Date().toISOString().split('T')[0],
            componentReplacedOdo: {},
            componentReplacedDates: {}
        };

        state.motors.push(newMotor);
        state.activeMotorId = newId;
        saveState();

        closeModal('modal-motor');
        renderAll();
        checkAndSendNotifications();
        showToast('✅ Berhasil menambahkan motor: ' + nickname);
    }

    function confirmDeleteMotor(motorId) {
        const motor = state.motors.find(m => m.id === motorId);
        if (!motor) return;

        const modal = document.getElementById('modal-konfirmasi');
        const titleEl = document.getElementById('modal-konfirmasi-title');
        const descEl = document.getElementById('modal-konfirmasi-desc');
        const okBtn = document.getElementById('btn-konfirmasi-ok');

        if (titleEl) titleEl.textContent = 'Hapus ' + (motor.nickname || motor.model) + '?';
        if (descEl) descEl.textContent = 'Semua data odometer, servis, dan riwayat bensin motor ini akan dihapus permanen.';

        if (okBtn) {
            okBtn.onclick = function () {
                state.motors = state.motors.filter(m => m.id !== motorId);
                state.fuelLogs = state.fuelLogs.filter(f => f.motorId !== motorId);
                state.serviceLogs = state.serviceLogs.filter(s => s.motorId !== motorId);

                if (state.activeMotorId === motorId) {
                    state.activeMotorId = state.motors.length > 0 ? state.motors[0].id : null;
                }
                saveState();
                closeModal(modal);
                renderAll();
                showToast('Motor berhasil dihapus.');
            };
        }

        openModal(modal);
    }

    // =========================================================================
    // ODOMETER UPDATE MODAL
    // =========================================================================
    function openOdoModal() {
        const motor = getActiveMotor();
        if (!motor) return;

        const modal = document.getElementById('modal-odo');
        const input = document.getElementById('odo-input');
        if (input) input.value = motor.currentOdo || 0;
        openModal(modal);
    }

    function handleOdoSubmit(e) {
        if (e) e.preventDefault();
        const motor = getActiveMotor();
        if (!motor) return;

        const input = document.getElementById('odo-input');
        const newOdo = Number(input && input.value);

        if (isNaN(newOdo) || newOdo < 0) {
            showToast('⚠️ Masukkan angka odometer yang valid!');
            return;
        }

        if (newOdo < (motor.currentOdo || 0)) {
            if (!confirm('Odometer baru (' + newOdo + ') lebih kecil dari sebelumnya (' + motor.currentOdo + '). Lanjutkan koreksi?')) {
                return;
            }
        }

        motor.currentOdo = newOdo;
        saveState();

        const modal = document.getElementById('modal-odo');
        closeModal(modal);

        renderAll();
        checkAndSendNotifications();
        showToast('✅ Odometer diperbarui ke: ' + newOdo.toLocaleString('id-ID') + ' KM');
    }

    // =========================================================================
    // BBM / FUEL TRACKING & CALCULATION
    // =========================================================================
    function renderBBM(motor) {
        if (!motor) return;

        const logs = state.fuelLogs.filter(f => f.motorId === motor.id);
        const avgEl = document.getElementById('bbm-avg-kml');
        const totalLiterEl = document.getElementById('bbm-total-liter');
        const estBiayaEl = document.getElementById('bbm-est-biaya');
        const logCountEl = document.getElementById('bbm-log-count');
        const logList = document.getElementById('bbm-log-list');

        let totalLiters = 0;
        let totalCost = 0;
        logs.forEach(l => {
            totalLiters += Number(l.liters) || 0;
            totalCost += Number(l.totalCost) || 0;
        });

        // Full-to-Full Calculation
        let fullLogs = logs.filter(l => l.isFullTank).sort((a, b) => Number(a.odometer) - Number(b.odometer));
        let totalKm = 0;
        let totalLitersFull = 0;

        for (let i = 1; i < fullLogs.length; i++) {
            const dist = Number(fullLogs[i].odometer) - Number(fullLogs[i - 1].odometer);
            const liters = Number(fullLogs[i].liters);
            if (dist > 0 && liters > 0) {
                totalKm += dist;
                totalLitersFull += liters;
            }
        }

        const avgKml = totalLitersFull > 0 ? (totalKm / totalLitersFull).toFixed(1) : '-';

        if (avgEl) avgEl.textContent = avgKml !== '-' ? avgKml + ' km/L' : 'Belum Cukup Data';
        if (totalLiterEl) totalLiterEl.textContent = totalLiters.toFixed(1) + ' L';
        if (estBiayaEl) estBiayaEl.textContent = 'Rp ' + Math.round(totalCost).toLocaleString('id-ID');
        if (logCountEl) logCountEl.textContent = logs.length + ' Kali';

        if (!logList) return;
        logList.innerHTML = '';

        if (logs.length === 0) {
            logList.innerHTML = '<p class="text-secondary text-sm text-center" style="padding:24px 0;">Belum ada catatan pengisian BBM.</p>';
            return;
        }

        logs.slice().reverse().forEach(l => {
            const row = document.createElement('div');
            row.className = 'p-12 mb-8';
            row.style.cssText = 'background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-card); display:flex; justify-content:space-between; align-items:center;';

            row.innerHTML =
                '<div>' +
                '<div class="font-bold text-sm" style="color:var(--text-primary);">' + (l.fuelType || 'Bensin') + ' • ' + (Number(l.liters) || 0).toFixed(2) + ' Liter</div>' +
                '<div class="text-xs text-secondary">' + (l.date || '-') + ' • KM ' + (Number(l.odometer) || 0).toLocaleString('id-ID') + (l.isFullTank ? ' • <em>Full Tank</em>' : '') + '</div>' +
                '</div>' +
                '<div style="text-align:right;">' +
                '<div class="font-heading text-accent text-sm" style="font-size:15px;">Rp ' + (Number(l.totalCost) || 0).toLocaleString('id-ID') + '</div>' +
                '<button class="text-xs text-secondary btn-del-fuel" data-id="' + l.id + '" style="background:none; border:none; cursor:pointer; color:var(--status-danger);">Hapus</button>' +
                '</div>';

            logList.appendChild(row);
        });

        logList.querySelectorAll('.btn-del-fuel').forEach(b => {
            b.addEventListener('click', () => {
                const id = b.getAttribute('data-id');
                state.fuelLogs = state.fuelLogs.filter(f => f.id !== id);
                saveState();
                renderBBM(getActiveMotor());
                showToast('Catatan BBM dihapus.');
            });
        });
    }

    function openBbmModal() {
        const motor = getActiveMotor();
        if (!motor) return;

        const modal = document.getElementById('modal-bbm');
        const odoEl = document.getElementById('bbm-odo');
        if (odoEl) odoEl.value = motor.currentOdo || '';

        // Populate Fuel Types
        const selectJenis = document.getElementById('bbm-jenis');
        if (selectJenis && typeof FUEL_TYPES !== 'undefined') {
            selectJenis.innerHTML = '';
            FUEL_TYPES.forEach(f => {
                const opt = document.createElement('option');
                opt.value = f.name;
                opt.textContent = f.name + ' (Rp ' + f.price.toLocaleString('id-ID') + ')';
                opt.setAttribute('data-price', f.price);
                selectJenis.appendChild(opt);
            });

            selectJenis.onchange = function () {
                const opt = this.options[this.selectedIndex];
                const price = opt ? opt.getAttribute('data-price') : 10000;
                const hargaEl = document.getElementById('bbm-harga');
                if (hargaEl) {
                    hargaEl.value = price;
                    calcBbmTotal();
                }
            };
            selectJenis.dispatchEvent(new Event('change'));
        }

        const volEl = document.getElementById('bbm-volume');
        const hargaEl = document.getElementById('bbm-harga');
        if (volEl) volEl.oninput = calcBbmTotal;
        if (hargaEl) hargaEl.oninput = calcBbmTotal;

        openModal(modal);
    }

    function calcBbmTotal() {
        const vol = parseFloat(document.getElementById('bbm-volume').value) || 0;
        const harga = parseFloat(document.getElementById('bbm-harga').value) || 0;
        const totalEl = document.getElementById('bbm-total');
        if (totalEl) totalEl.value = Math.round(vol * harga);
    }

    function handleBbmSubmit(e) {
        if (e) e.preventDefault();
        const motor = getActiveMotor();
        if (!motor) return;

        const tanggal = document.getElementById('bbm-tanggal').value;
        const odo = Number(document.getElementById('bbm-odo').value) || motor.currentOdo;
        const jenis = document.getElementById('bbm-jenis').value;
        const harga = Number(document.getElementById('bbm-harga').value) || 10000;
        const volume = parseFloat(document.getElementById('bbm-volume').value) || 0;
        const total = Number(document.getElementById('bbm-total').value) || (volume * harga);
        const notes = document.getElementById('bbm-notes').value.trim();

        if (volume <= 0) {
            showToast('⚠️ Masukkan volume liter bensin yang valid!');
            return;
        }

        const newLog = {
            id: 'fuel-' + Date.now(),
            motorId: motor.id,
            date: tanggal,
            odometer: odo,
            fuelType: jenis,
            pricePerLiter: harga,
            liters: volume,
            totalCost: total,
            isFullTank: true,
            notes: notes
        };

        state.fuelLogs.push(newLog);
        if (odo > motor.currentOdo) {
            motor.currentOdo = odo;
        }
        saveState();

        const modal = document.getElementById('modal-bbm');
        closeModal(modal);

        renderAll();
        showToast('⛽ Catatan BBM tersimpan!');
    }

    // =========================================================================
    // SERVIS TRACKER (15 Komponen & Log Servis)
    // =========================================================================
    function renderServis(motor) {
        if (!motor) return;

        renderKomponenList(motor);
        renderServisLogList(motor);
    }

    function renderKomponenList(motor) {
        const container = document.getElementById('komponen-list');
        if (!container || typeof COMPONENT_DEFINITIONS === 'undefined') return;

        container.innerHTML = '';
        const isMatic = motor.hasCVT !== false && motor.type !== 'sport' && motor.type !== 'trail' && motor.type !== 'bebek';
        const hasRadiator = motor.hasRadiator !== false;

        COMPONENT_DEFINITIONS.forEach(def => {
            // Filter by motorcycle type
            if (!isMatic && ['vBelt', 'rollerCVT', 'cvtClean', 'gearOil'].includes(def.key)) {
                return; // Hide CVT components for non-matic
            }
            if (isMatic && ['chainLube', 'chainAdjust'].includes(def.key)) {
                return; // Hide chain maintenance for matic
            }
            if (!hasRadiator && def.key === 'coolant') {
                return; // Hide coolant for air-cooled
            }

            const h = getComponentHealth(motor, def.key);
            const card = document.createElement('div');
            card.className = 'component-card p-12 mb-8';
            card.style.cssText = 'background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-card); box-shadow:var(--shadow-retro);';

            const badgeEstimated = h.isEstimated
                ? '<span style="font-size:10px; background:rgba(255,215,0,0.15); color:var(--accent-secondary); padding:2px 6px; border-radius:4px; margin-left:6px;">🏷️ Siklus Ideal</span>'
                : '';

            card.innerHTML =
                '<div class="d-flex justify-between align-center mb-6">' +
                '<div class="d-flex align-center gap-8">' +
                '<span class="font-bold text-sm" style="color:var(--text-primary);">' + def.name + '</span>' +
                badgeEstimated +
                '</div>' +
                '<span class="status-pill ' + h.status + '">' + h.statusText + '</span>' +
                '</div>' +
                '<div class="fuel-gauge-bar mb-6" style="height:8px; background:var(--input-bg); border-radius:4px; overflow:hidden; border:1px solid var(--border-color);">' +
                '<div style="height:100%; width:' + h.percent + '%; background:' + (h.status === 'segera' ? 'var(--status-danger)' : h.status === 'hampir' ? 'var(--accent-primary)' : 'var(--status-safe)') + '; transition:width 0.4s;"></div>' +
                '</div>' +
                '<div class="d-flex justify-between align-center text-xs text-secondary">' +
                '<span>Sisa: <strong style="color:var(--text-primary);">' + (h.remainingKm > 0 ? h.remainingKm.toLocaleString('id-ID') + ' KM' : 'LEWAT ' + Math.abs(h.remainingKm).toLocaleString('id-ID') + ' KM') + '</strong></span>' +
                '<button class="retro-btn retro-btn-sm btn-ganti-komponen" data-key="' + def.key + '" data-name="' + def.name + '">Catat Penggantian</button>' +
                '</div>';

            container.appendChild(card);
        });

        container.querySelectorAll('.btn-ganti-komponen').forEach(b => {
            b.addEventListener('click', () => {
                openGantiKomponenModal(b.getAttribute('data-key'), b.getAttribute('data-name'));
            });
        });
    }

    function renderServisLogList(motor) {
        const container = document.getElementById('servis-log-list');
        if (!container) return;

        const logs = state.serviceLogs.filter(s => s.motorId === motor.id);
        container.innerHTML = '';

        if (logs.length === 0) {
            container.innerHTML = '<p class="text-secondary text-sm text-center" style="padding:24px 0;">Belum ada riwayat servis berkala.</p>';
            return;
        }

        logs.slice().reverse().forEach(s => {
            const card = document.createElement('div');
            card.className = 'p-12 mb-8';
            card.style.cssText = 'background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-card);';

            card.innerHTML =
                '<div class="d-flex justify-between align-center mb-4">' +
                '<span class="font-bold text-sm" style="color:var(--accent-primary);">' + (s.category || 'Servis') + '</span>' +
                '<span class="text-xs text-secondary">' + (s.date || '-') + '</span>' +
                '</div>' +
                '<div class="text-xs text-secondary mb-4">' +
                'Odo: <strong>' + (Number(s.odometer) || 0).toLocaleString('id-ID') + ' KM</strong> • Bengkel: ' + (s.workshop || 'Mandiri') +
                '</div>' +
                (s.notes ? '<div class="text-xs" style="color:var(--text-primary);">' + s.notes + '</div>' : '') +
                (s.totalCost ? '<div class="text-xs font-bold text-accent mt-4">Total: Rp ' + Number(s.totalCost).toLocaleString('id-ID') + '</div>' : '');

            container.appendChild(card);
        });
    }

    function openGantiKomponenModal(key, name) {
        const motor = getActiveMotor();
        if (!motor) return;

        const modal = document.getElementById('modal-ganti-komponen');
        const keyEl = document.getElementById('ganti-komp-key');
        const nameEl = document.getElementById('ganti-komp-name');
        const titleEl = document.getElementById('modal-komponen-title');
        const odoEl = document.getElementById('ganti-komp-odo');

        if (keyEl) keyEl.value = key;
        if (nameEl) nameEl.value = name;
        if (titleEl) titleEl.textContent = 'Catat Penggantian ' + name;
        if (odoEl) odoEl.value = motor.currentOdo || '';

        openModal(modal);
    }

    function handleGantiKomponenSubmit(e) {
        if (e) e.preventDefault();
        const motor = getActiveMotor();
        if (!motor) return;

        const key = document.getElementById('ganti-komp-key').value;
        const name = document.getElementById('ganti-komp-name').value;
        const date = document.getElementById('ganti-komp-date').value;
        const odo = Number(document.getElementById('ganti-komp-odo').value) || motor.currentOdo;
        const produk = document.getElementById('ganti-komp-produk').value.trim();
        const biaya = Number(document.getElementById('ganti-komp-biaya').value) || 0;
        const notes = document.getElementById('ganti-komp-notes').value.trim();

        if (!motor.componentReplacedOdo) motor.componentReplacedOdo = {};
        if (!motor.componentReplacedDates) motor.componentReplacedDates = {};

        motor.componentReplacedOdo[key] = odo;
        motor.componentReplacedDates[key] = date;
        if (odo > motor.currentOdo) motor.currentOdo = odo;

        // Log into serviceLogs
        state.serviceLogs.push({
            id: 'srv-' + Date.now(),
            motorId: motor.id,
            date: date,
            odometer: odo,
            category: 'Ganti ' + name,
            workshop: produk || 'Ganti Sparepart',
            totalCost: biaya,
            notes: notes
        });

        saveState();

        const modal = document.getElementById('modal-ganti-komponen');
        closeModal(modal);

        renderAll();
        checkAndSendNotifications();
        showToast('✅ Penggantian ' + name + ' berhasil dicatat!');
    }

    function openServisLogModal() {
        const motor = getActiveMotor();
        if (!motor) return;

        const modal = document.getElementById('modal-servis-log');
        const odoEl = document.getElementById('servis-log-odo');
        if (odoEl) odoEl.value = motor.currentOdo || '';
        openModal(modal);
    }

    function handleServisLogSubmit(e) {
        if (e) e.preventDefault();
        const motor = getActiveMotor();
        if (!motor) return;

        const date = document.getElementById('servis-log-date').value;
        const odo = Number(document.getElementById('servis-log-odo').value) || motor.currentOdo;
        const jenis = document.getElementById('servis-log-jenis').value;
        const bengkel = document.getElementById('servis-log-bengkel').value.trim();
        const biaya = Number(document.getElementById('servis-log-biaya').value) || 0;
        const notes = document.getElementById('servis-log-notes').value.trim();

        state.serviceLogs.push({
            id: 'srv-' + Date.now(),
            motorId: motor.id,
            date: date,
            odometer: odo,
            category: jenis,
            workshop: bengkel,
            totalCost: biaya,
            notes: notes
        });

        motor.lastServiceOdo = odo;
        motor.lastServiceDate = date;
        if (odo > motor.currentOdo) motor.currentOdo = odo;

        saveState();

        const modal = document.getElementById('modal-servis-log');
        closeModal(modal);

        renderAll();
        showToast('✅ Riwayat servis berhasil dicatat!');
    }

    // =========================================================================
    // CHECKLIST MANUAL
    // =========================================================================
    function renderChecklist(motor) {
        if (!motor) return;
        const chkState = state.checklistStates[motor.id] || {};

        const checkInputs = document.querySelectorAll('#servis-sub-checklist input[type="checkbox"]');
        checkInputs.forEach(input => {
            const key = input.id;
            input.checked = !!chkState[key];
            input.onchange = function () {
                if (!state.checklistStates[motor.id]) state.checklistStates[motor.id] = {};
                state.checklistStates[motor.id][key] = this.checked;
                saveState();
            };
        });

        const resetBtn = document.getElementById('btn-reset-checklist');
        if (resetBtn) {
            resetBtn.onclick = function () {
                state.checklistStates[motor.id] = {};
                saveState();
                renderChecklist(motor);
                showToast('Checklist telah direset.');
            };
        }
    }

    // =========================================================================
    // BASELINE SETTINGS FOR USED BIKES
    // =========================================================================
    function renderBaselineSettings(motor) {
        const select = document.getElementById('baseline-motor-select');
        const listContainer = document.getElementById('baseline-komponen-list');
        if (!select || !listContainer || !motor) return;

        select.innerHTML = '';
        state.motors.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = m.nickname || m.model;
            if (m.id === motor.id) opt.selected = true;
            select.appendChild(opt);
        });

        listContainer.innerHTML = '';
        const isMatic = motor.hasCVT !== false && motor.type !== 'sport' && motor.type !== 'trail' && motor.type !== 'bebek';

        const keys = isMatic
            ? ['engineOil', 'gearOil', 'vBelt', 'rollerCVT', 'airFilter', 'sparkPlug', 'brakePadFront', 'brakePadRear', 'tireFront', 'tireRear']
            : ['engineOil', 'chainLube', 'chainAdjust', 'airFilter', 'sparkPlug', 'brakePadFront', 'brakePadRear', 'tireFront', 'tireRear'];

        keys.forEach(key => {
            const def = (typeof COMPONENT_DEFINITIONS !== 'undefined') ? COMPONENT_DEFINITIONS.find(c => c.key === key) : null;
            const name = def ? def.name : key;
            const currentVal = (motor.componentReplacedOdo && motor.componentReplacedOdo[key] !== undefined)
                ? motor.componentReplacedOdo[key]
                : '';

            const row = document.createElement('div');
            row.className = 'form-group mb-8';
            row.innerHTML =
                '<label class="form-label text-xs">' + name + ' (KM Terakhir Ganti):</label>' +
                '<input type="number" class="form-input baseline-km-input" data-key="' + key + '" value="' + currentVal + '" placeholder="Contoh: 35000" />';
            listContainer.appendChild(row);
        });

        const btnSimpan = document.getElementById('btn-simpan-baseline');
        if (btnSimpan) {
            btnSimpan.onclick = function () {
                const inputs = listContainer.querySelectorAll('.baseline-km-input');
                if (!motor.componentReplacedOdo) motor.componentReplacedOdo = {};
                inputs.forEach(inp => {
                    const k = inp.getAttribute('data-key');
                    const val = inp.value.trim();
                    if (val !== '') {
                        motor.componentReplacedOdo[k] = Number(val);
                    }
                });
                saveState();
                renderAll();
                showToast('✅ Baseline riwayat motor berhasil disimpan!');
            };
        }
    }

    // =========================================================================
    // CAMERA LIVE INSPECTION
    // =========================================================================
    function openCameraModal() {
        const modal = document.getElementById('modal-camera');
        if (!modal) return;

        openModal(modal);
        startCameraStream();
    }

    function startCameraStream() {
        const video = document.getElementById('camera-stream');
        if (!video || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            showToast('⚠️ Kamera tidak didukung di perangkat ini.');
            return;
        }

        stopCameraStream();

        const constraints = {
            video: { facingMode: cameraFacingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false
        };

        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                activeCameraStream = stream;
                video.srcObject = stream;
                video.play();
            })
            .catch(err => {
                console.error('Camera access error:', err);
                showToast('⚠️ Gagal mengakses kamera: ' + (err.message || 'Izin ditolak'));
            });
    }

    function stopCameraStream() {
        if (activeCameraStream) {
            activeCameraStream.getTracks().forEach(t => t.stop());
            activeCameraStream = null;
        }
        const video = document.getElementById('camera-stream');
        if (video) video.srcObject = null;
    }

    function flipCamera() {
        cameraFacingMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
        startCameraStream();
        showToast('Membalik kamera...');
    }

    function snapPhoto() {
        const video = document.getElementById('camera-stream');
        const canvas = document.getElementById('camera-canvas');
        if (!video || !canvas) return;

        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        showToast('📸 Foto pemeriksaan fisik tertangkap!');
        if (window.Android && window.Android.vibrate) {
            window.Android.vibrate(50);
        }
    }

    function closeCameraModal() {
        stopCameraStream();
        const modal = document.getElementById('modal-camera');
        closeModal(modal);
    }

    // =========================================================================
    // GEMINI AI DIAGNOSTIC ASSISTANT
    // =========================================================================
    let currentGeminiSymptom = 'cvt';

    function openGeminiModal() {
        const modal = document.getElementById('modal-gemini');
        if (!modal) return;

        updateGeminiPromptPreview();
        openModal(modal);
    }

    function updateGeminiPromptPreview() {
        const motor = getActiveMotor();
        const preview = document.getElementById('gemini-prompt-preview');
        if (!preview) return;

        const motorName = motor ? (motor.model || motor.nickname) : 'Sepeda Motor Roda Dua';
        const motorYear = motor ? (motor.year || '-') : '-';
        const motorOdo = motor ? (Number(motor.currentOdo) || 0).toLocaleString('id-ID') + ' KM' : '-';

        let symptomText = '';
        switch (currentGeminiSymptom) {
            case 'cvt':
                symptomText = 'Terdengar bunyi getar / gredek kasar pada area CVT transmisi otomatis saat akselerasi awal (0 - 30 km/jam).';
                break;
            case 'lelet':
                symptomText = 'Tarikan mesin terasa berat, loyo di tanjakan, dan konsumsi bensin terasa lebih boros dari biasanya.';
                break;
            case 'rem':
                symptomText = 'Rem depan/belakang berdecit keras saat ditekan dan tuas rem terasa ambles/kurang pakem.';
                break;
            case 'asap':
                symptomText = 'Knalpot mengeluarkan sedikit asap putih/abu-abu saat digas tinggi dan volume oli mesin berkurang drastis.';
                break;
            case 'second':
                symptomText = 'Motor ini dibeli dalam kondisi second/bekas. Saya butuh panduan pemeriksaan menyeluruh komponen yang rawan rusak pada tipe motor ini.';
                break;
            default:
                symptomText = 'Pemeriksaan performa dan kondisi umum mesin motor.';
        }

        const prompt = 'Halo Google Gemini, tolong bantu analisa masalah teknis pada sepeda motor saya:\n' +
            '• Motor: ' + motorName + ' (Tahun ' + motorYear + ')\n' +
            '• Odometer saat ini: ' + motorOdo + '\n' +
            '• Gejala kendala: ' + symptomText + '\n\n' +
            'Pertanyaan untuk analisa:\n' +
            '1. Apa akar penyebab yang paling sering memicu masalah tersebut?\n' +
            '2. Komponen spesifik mana saja yang harus diperiksa atau diganti di bengkel?\n' +
            '3. Apakah motor masih aman dipakai harian atau berisiko mogok/rusak parah?\n' +
            '4. Berapa perkiraan kisaran biaya servis atau harga suku cadang tersebut di Indonesia?';

        preview.value = prompt;
    }

    function copyGeminiPrompt() {
        const preview = document.getElementById('gemini-prompt-preview');
        if (!preview) return;

        const text = preview.value;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                showToast('📋 Prompt disalin ke clipboard!');
            }).catch(() => {
                fallbackCopy(text);
            });
        } else if (window.Android && window.Android.copyToClipboard) {
            window.Android.copyToClipboard(text);
            showToast('📋 Prompt disalin ke clipboard!');
        } else {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('📋 Prompt disalin ke clipboard!');
    }

    function launchGeminiApp() {
        const preview = document.getElementById('gemini-prompt-preview');
        const prompt = preview ? preview.value : '';

        copyGeminiPrompt();

        if (window.Android && window.Android.openGeminiWithPrompt) {
            window.Android.openGeminiWithPrompt(prompt);
        } else {
            // Open Gemini Web
            const encoded = encodeURIComponent(prompt);
            window.open('https://gemini.google.com/app?q=' + encoded, '_blank');
        }
    }

    // =========================================================================
    // SYSTEM NOTIFICATIONS & OVERDUE LOGIC
    // =========================================================================
    function checkAndSendNotifications() {
        const motor = getActiveMotor();
        if (!motor || !state.notificationSettings.enabled) return;

        const settings = state.notificationSettings;
        const today = new Date().toISOString().split('T')[0];

        // 1. Check Engine Oil
        const oilH = getComponentHealth(motor, 'engineOil');
        if (oilH.status === 'segera' && settings.overdueDailyAlerts) {
            const key = motor.id + '-oil-overdue';
            if (settings.lastNotificationDates[key] !== today) {
                dispatchSystemNotification(
                    '🚨 Peringatan Oli Mesin ' + (motor.nickname || motor.model),
                    'Oli mesin telah melewati batas aman (' + Math.abs(oilH.remainingKm).toLocaleString('id-ID') + ' KM lewat). Segera ganti oli!',
                    true
                );
                settings.lastNotificationDates[key] = today;
                saveState();
            }
        } else if (oilH.status === 'hampir' && settings.idealWindowAlerts) {
            const key = motor.id + '-oil-ideal';
            if (settings.lastNotificationDates[key] !== today) {
                dispatchSystemNotification(
                    '🛵 Persiapan Servis Oli Mesin',
                    'Sisa pemakaian oli ' + oilH.remainingKm.toLocaleString('id-ID') + ' KM lagi. Waktu ideal untuk persiapan ganti oli.',
                    false
                );
                settings.lastNotificationDates[key] = today;
                saveState();
            }
        }

        // 2. Check Tax
        if (motor.taxAnnualDate && settings.taxAlerts) {
            const days = Math.ceil((new Date(motor.taxAnnualDate) - new Date()) / (1000 * 60 * 60 * 24));
            if ([30, 14, 7, 3, 1, 0].includes(days)) {
                const key = motor.id + '-tax-' + days;
                if (settings.lastNotificationDates[key] !== today) {
                    const title = days <= 0 ? '🚨 Pajak STNK Jatuh Tempo!' : '📋 Pengingat Pajak STNK H-' + days;
                    const msg = days <= 0
                        ? 'Pajak STNK ' + (motor.nickname || motor.model) + ' jatuh tempo hari ini. Segera bayar di Samsat/Signal.'
                        : 'Pajak tahunan jatuh tempo dalam ' + days + ' hari lagi (' + motor.taxAnnualDate + ').';
                    dispatchSystemNotification(title, msg, days <= 0);
                    settings.lastNotificationDates[key] = today;
                    saveState();
                }
            }
        }
    }

    function dispatchSystemNotification(title, message, isUrgent) {
        if (window.Android && window.Android.showSystemNotification) {
            window.Android.showSystemNotification(title, message, !!isUrgent);
        } else {
            console.log('[Native Notification]', title, message, isUrgent ? '(URGENT)' : '');
        }
    }

    function sendTestNotification() {
        const motor = getActiveMotor();
        const motorName = motor ? (motor.nickname || motor.model) : 'Sepeda Motor Anda';

        dispatchSystemNotification(
            '🛵 MotoCare Notifikasi Berhasil!',
            'Notifikasi layar aktif untuk ' + motorName + '. Pengingat jarak ideal & batas aman siap bekerja.',
            false
        );
        showToast('🔔 Notifikasi uji coba dikirim ke layar HP!');
    }

    // =========================================================================
    // BACKUP, RESTORE & RESET
    // =========================================================================
    function exportJSON() {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
        const dl = document.createElement('a');
        dl.setAttribute('href', dataStr);
        dl.setAttribute('download', 'motocare_backup_' + new Date().toISOString().split('T')[0] + '.json');
        dl.click();
        showToast('📥 Backup data diexport.');
    }

    function importJSON(file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const imported = JSON.parse(e.target.result);
                if (imported && Array.isArray(imported.motors)) {
                    state = imported;
                    saveState();
                    applyTheme(state.theme);
                    renderAll();
                    showToast('✅ Data berhasil dipulihkan!');
                } else {
                    showToast('⚠️ Format file JSON backup tidak valid.');
                }
            } catch (err) {
                showToast('⚠️ Gagal membaca file backup.');
            }
        };
        reader.readAsText(file);
    }

    function resetAllData() {
        if (confirm('Apakah Anda yakin ingin menghapus SELURUH data motor, bensin, dan servis? Data tidak dapat dikembalikan.')) {
            localStorage.removeItem(STORAGE_KEY);
            state = {
                motors: [],
                activeMotorId: null,
                fuelLogs: [],
                serviceLogs: [],
                checklistStates: {},
                notificationSettings: Object.assign({}, DEFAULT_SETTINGS),
                theme: 'dark'
            };
            saveState();
            applyTheme('dark');
            renderAll();
            showToast('🔄 Semua data telah direset ke kondisi awal.');
        }
    }

    // =========================================================================
    // TOAST HELPER
    // =========================================================================
    let toastTimeout = null;
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

        if (window.Android && window.Android.showToast) {
            window.Android.showToast(msg);
        }
    }

    // =========================================================================
    // EVENT LISTENERS WIRING
    // =========================================================================
    function initEventListeners() {
        // Theme toggles
        const btnThemeToggle = document.getElementById('btn-theme-toggle');
        if (btnThemeToggle) btnThemeToggle.addEventListener('click', toggleTheme);

        const toggleDarkMode = document.getElementById('toggle-dark-mode');
        if (toggleDarkMode) {
            toggleDarkMode.addEventListener('change', function () {
                applyTheme(this.checked ? 'dark' : 'light');
            });
        }

        // Active Motor Selector Change
        const selectActiveMotor = document.getElementById('select-active-motor');
        if (selectActiveMotor) {
            selectActiveMotor.addEventListener('change', function () {
                if (this.value) setActiveMotor(this.value);
            });
        }

        // Add Motor Triggers
        ['btn-empty-add-motor', 'btn-empty-add-motor-2', 'fab-add-motor'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.addEventListener('click', openAddMotorWizard);
        });

        // Add Motor Wizard Buttons
        const btnWizardBack = document.getElementById('btn-modal-motor-back');
        const btnWizardNext = document.getElementById('btn-modal-motor-next');
        const btnWizardCancel = document.getElementById('btn-modal-motor-cancel');
        const formMotor = document.getElementById('form-motor');

        if (btnWizardBack) {
            btnWizardBack.addEventListener('click', () => {
                if (modalStepCurrent > 1) showWizardStep(modalStepCurrent - 1);
            });
        }
        if (btnWizardNext) {
            btnWizardNext.addEventListener('click', () => {
                if (modalStepCurrent < 3) showWizardStep(modalStepCurrent + 1);
            });
        }
        if (btnWizardCancel) {
            btnWizardCancel.addEventListener('click', () => {
                const modal = document.getElementById('modal-motor');
                closeModal(modal);
            });
        }
        const btnSaveMotor = document.getElementById('btn-modal-motor-save');
        if (btnSaveMotor) {
            btnSaveMotor.onclick = handleSaveNewMotor;
        }
        if (formMotor) {
            formMotor.onsubmit = handleSaveNewMotor;
        }

        // Odometer Update
        const btnUpdateOdo = document.getElementById('btn-update-odo');
        if (btnUpdateOdo) btnUpdateOdo.addEventListener('click', openOdoModal);

        const formOdo = document.getElementById('form-odo');
        if (formOdo) formOdo.addEventListener('submit', handleOdoSubmit);

        const btnCancelOdo = document.getElementById('btn-modal-odo-cancel');
        if (btnCancelOdo) {
            btnCancelOdo.addEventListener('click', () => {
                const modal = document.getElementById('modal-odo');
                closeModal(modal);
            });
        }

        // BBM Actions
        const btnCatatBbm = document.getElementById('btn-catat-bbm');
        if (btnCatatBbm) btnCatatBbm.addEventListener('click', openBbmModal);

        const formBbm = document.getElementById('form-bbm');
        if (formBbm) formBbm.addEventListener('submit', handleBbmSubmit);

        const btnCancelBbm = document.getElementById('btn-modal-bbm-cancel');
        if (btnCancelBbm) {
            btnCancelBbm.addEventListener('click', () => {
                const modal = document.getElementById('modal-bbm');
                closeModal(modal);
            });
        }

        // Ganti Komponen Modal Actions
        const formGantiKomp = document.getElementById('form-ganti-komponen');
        if (formGantiKomp) formGantiKomp.addEventListener('submit', handleGantiKomponenSubmit);

        const btnCancelKomp = document.getElementById('btn-modal-komp-cancel');
        if (btnCancelKomp) {
            btnCancelKomp.addEventListener('click', () => {
                const modal = document.getElementById('modal-ganti-komponen');
                closeModal(modal);
            });
        }

        // Servis Log Modal Actions
        const btnTambahServisLog = document.getElementById('btn-tambah-servis-log');
        if (btnTambahServisLog) btnTambahServisLog.addEventListener('click', openServisLogModal);

        const formServisLog = document.getElementById('form-servis-log');
        if (formServisLog) formServisLog.addEventListener('submit', handleServisLogSubmit);

        const btnCancelServisLog = document.getElementById('btn-modal-servis-log-cancel');
        if (btnCancelServisLog) {
            btnCancelServisLog.addEventListener('click', () => {
                const modal = document.getElementById('modal-servis-log');
                closeModal(modal);
            });
        }

        // Camera Live Modal Actions
        const btnOpenCamera = document.getElementById('btn-open-camera');
        if (btnOpenCamera) btnOpenCamera.addEventListener('click', openCameraModal);

        const btnCameraClose = document.getElementById('btn-modal-camera-close');
        if (btnCameraClose) btnCameraClose.addEventListener('click', closeCameraModal);

        const btnCameraFlip = document.getElementById('btn-camera-flip');
        if (btnCameraFlip) btnCameraFlip.addEventListener('click', flipCamera);

        const btnCameraSnap = document.getElementById('btn-camera-snap');
        if (btnCameraSnap) btnCameraSnap.addEventListener('click', snapPhoto);

        // Gemini AI Modal Actions
        const btnOpenGemini = document.getElementById('btn-open-gemini');
        if (btnOpenGemini) btnOpenGemini.addEventListener('click', openGeminiModal);

        const btnGeminiClose = document.getElementById('btn-modal-gemini-close');
        if (btnGeminiClose) {
            btnGeminiClose.addEventListener('click', () => {
                const modal = document.getElementById('modal-gemini');
                closeModal(modal);
            });
        }

        const btnGeminiCopy = document.getElementById('btn-gemini-copy');
        if (btnGeminiCopy) btnGeminiCopy.addEventListener('click', copyGeminiPrompt);

        const btnGeminiLaunch = document.getElementById('btn-gemini-launch');
        if (btnGeminiLaunch) btnGeminiLaunch.addEventListener('click', launchGeminiApp);

        document.querySelectorAll('.gemini-chip').forEach(chip => {
            chip.addEventListener('click', function () {
                document.querySelectorAll('.gemini-chip').forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                currentGeminiSymptom = this.getAttribute('data-symptom');
                updateGeminiPromptPreview();
            });
        });

        // Notification Modal Actions
        const btnNotifHeader = document.getElementById('btn-notif');
        if (btnNotifHeader) {
            btnNotifHeader.addEventListener('click', () => {
                const modal = document.getElementById('modal-notif');
                openModal(modal);
            });
        }

        const btnNotifClose = document.getElementById('btn-modal-notif-close');
        if (btnNotifClose) {
            btnNotifClose.addEventListener('click', () => {
                const modal = document.getElementById('modal-notif');
                closeModal(modal);
            });
        }

        const btnTestNotif = document.getElementById('btn-test-notification');
        if (btnTestNotif) btnTestNotif.addEventListener('click', sendTestNotification);

        const toggleNotifMaster = document.getElementById('toggle-notif-master');
        if (toggleNotifMaster) {
            toggleNotifMaster.checked = !!state.notificationSettings.enabled;
            toggleNotifMaster.addEventListener('change', function () {
                state.notificationSettings.enabled = this.checked;
                saveState();
            });
        }

        const toggleNotifOverdue = document.getElementById('toggle-notif-overdue');
        if (toggleNotifOverdue) {
            toggleNotifOverdue.checked = !!state.notificationSettings.overdueDailyAlerts;
            toggleNotifOverdue.addEventListener('change', function () {
                state.notificationSettings.overdueDailyAlerts = this.checked;
                saveState();
            });
        }

        const toggleNotifIdeal = document.getElementById('toggle-notif-ideal');
        if (toggleNotifIdeal) {
            toggleNotifIdeal.checked = !!state.notificationSettings.idealWindowAlerts;
            toggleNotifIdeal.addEventListener('change', function () {
                state.notificationSettings.idealWindowAlerts = this.checked;
                saveState();
            });
        }

        const toggleNotifTax = document.getElementById('toggle-notif-tax');
        if (toggleNotifTax) {
            toggleNotifTax.checked = !!state.notificationSettings.taxAlerts;
            toggleNotifTax.addEventListener('change', function () {
                state.notificationSettings.taxAlerts = this.checked;
                saveState();
            });
        }

        // Konfirmasi Modal Cancel
        const btnKonfirmasiCancel = document.getElementById('btn-konfirmasi-cancel');
        if (btnKonfirmasiCancel) {
            btnKonfirmasiCancel.addEventListener('click', () => {
                const modal = document.getElementById('modal-konfirmasi');
                closeModal(modal);
            });
        }

        // Export / Import / Reset Actions in Settings
        const btnExport = document.getElementById('btn-export-json');
        if (btnExport) btnExport.addEventListener('click', exportJSON);

        const btnImport = document.getElementById('btn-import-json');
        const fileImport = document.getElementById('file-import-json');
        if (btnImport && fileImport) {
            btnImport.addEventListener('click', () => fileImport.click());
            fileImport.addEventListener('change', function () {
                if (this.files && this.files[0]) {
                    importJSON(this.files[0]);
                }
            });
        }

        const btnResetData = document.getElementById('btn-reset-data');
        if (btnResetData) btnResetData.addEventListener('click', resetAllData);

        // Global Modal Overlay Click to Dismiss
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', function (e) {
                if (e.target === this) {
                    this.classList.remove('active');
                    if (this.id === 'modal-camera') stopCameraStream();
                }
            });
        });
    }

    // =========================================================================
    // DOM READY
    // =========================================================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
