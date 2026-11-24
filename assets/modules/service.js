/**
 * MotoCare v2.0 - Servis & Komponen Tracker Module
 * Manages 15 component lifecycle, replacement records, service logs, checklist, and baseline settings.
 */
(function (root, factory) {
    const exported = factory();
    if (typeof root !== 'undefined' && root) {
        root.MotoCare = root.MotoCare || {};
        root.MotoCare.Service = exported;
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
    let _motorPresets = [];

    function init(deps) {
        _store = deps && deps.Store;
        _eventBus = deps && deps.EventBus;
        _utils = deps && deps.Utils;
        _motoLogic = deps && deps.MotoLogic;
        _componentDefinitions =
            (deps && deps.COMPONENT_DEFINITIONS) ||
            (typeof COMPONENT_DEFINITIONS !== 'undefined' ? COMPONENT_DEFINITIONS : []);
        _motorPresets = (deps && deps.MOTOR_PRESETS) || (typeof MOTOR_PRESETS !== 'undefined' ? MOTOR_PRESETS : []);

        if (_eventBus && _eventBus.EVENTS) {
            _eventBus.on(_eventBus.EVENTS.STATE_LOADED, () => renderAllService(_store.getActiveMotor()));
            _eventBus.on(_eventBus.EVENTS.MOTOR_SELECTED, (p) => renderAllService(p.motor));
            _eventBus.on(_eventBus.EVENTS.ODOMETER_UPDATED, (p) => {
                renderKomponenList(p.motor);
                renderBaseline(p.motor);
            });
            _eventBus.on(_eventBus.EVENTS.COMPONENT_REPLACED, (p) => {
                renderKomponenList(p.motor);
                renderServisLogList(p.motor);
            });
            _eventBus.on(_eventBus.EVENTS.SERVICE_LOG_ADDED, (p) => renderServisLogList(p.motor));
            _eventBus.on(_eventBus.EVENTS.CHECKLIST_CHANGED, (p) => {
                const motor = p && p.motorId ? _store.getMotorById(p.motorId) : _store.getActiveMotor();
                renderChecklist(motor);
            });
        }

        initListeners();
    }

    function renderAllService(motor) {
        if (!motor) return;
        renderKomponenList(motor);
        renderServisLogList(motor);
        renderChecklist(motor);
        renderBaseline(motor);
    }

    function getComponentHealth(motor, key) {
        if (_motoLogic && typeof _motoLogic.getComponentHealth === 'function') {
            return _motoLogic.getComponentHealth(motor, key, _motorPresets);
        }
        return {
            key,
            interval: 2500,
            remainingKm: 0,
            status: 'aman',
            statusText: 'AMAN',
            percent: 0,
            isEstimated: false
        };
    }

    function renderKomponenList(motor) {
        const container = document.getElementById('komponen-list');
        if (!container || _componentDefinitions.length === 0 || !motor) return;

        container.innerHTML = '';
        const isMatic =
            motor.hasCVT !== false && motor.type !== 'sport' && motor.type !== 'trail' && motor.type !== 'bebek';
        const hasRadiator = motor.hasRadiator !== false;
        const escapeHtml = _utils ? _utils.escapeHtml : (s) => s;

        _componentDefinitions.forEach((def) => {
            if (!isMatic && ['vBelt', 'rollerCVT', 'cvtClean', 'gearOil'].includes(def.key)) return;
            if (isMatic && ['chainLube', 'chainAdjust'].includes(def.key)) return;
            if (!hasRadiator && def.key === 'coolant') return;

            const h = getComponentHealth(motor, def.key);
            const card = document.createElement('div');
            card.className = 'component-card p-12 mb-8';
            card.style.cssText =
                'background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-card); box-shadow:var(--shadow-retro);';

            const badgeEstimated = h.isEstimated
                ? '<span style="font-size:10px; background:rgba(255,215,0,0.15); color:var(--accent-secondary); padding:2px 6px; border-radius:4px; margin-left:6px;">🏷️ Siklus Ideal</span>'
                : '';

            card.innerHTML =
                '<div class="d-flex justify-between align-center mb-6">' +
                '<div class="d-flex align-center gap-8">' +
                '<span class="font-bold text-sm" style="color:var(--text-primary);">' +
                escapeHtml(def.name) +
                '</span>' +
                badgeEstimated +
                '</div>' +
                '<span class="status-pill ' +
                escapeHtml(h.status) +
                '">' +
                escapeHtml(h.statusText) +
                '</span>' +
                '</div>' +
                '<div class="fuel-gauge-bar mb-6" style="height:8px; background:var(--input-bg); border-radius:4px; overflow:hidden; border:1px solid var(--border-color);">' +
                '<div style="height:100%; width:' +
                Number(h.percent) +
                '%; background:' +
                (h.status === 'segera'
                    ? 'var(--status-danger)'
                    : h.status === 'hampir'
                      ? 'var(--accent-primary)'
                      : 'var(--status-safe)') +
                '; transition:width 0.4s;"></div>' +
                '</div>' +
                '<div class="d-flex justify-between align-center text-xs text-secondary">' +
                '<span>Sisa: <strong style="color:var(--text-primary);">' +
                (h.remainingKm > 0
                    ? h.remainingKm.toLocaleString('id-ID') + ' KM'
                    : 'LEWAT ' + Math.abs(h.remainingKm).toLocaleString('id-ID') + ' KM') +
                '</strong></span>' +
                '<button class="retro-btn retro-btn-sm btn-ganti-komponen" data-key="' +
                escapeHtml(def.key) +
                '" data-name="' +
                escapeHtml(def.name) +
                '">Catat Penggantian</button>' +
                '</div>';

            container.appendChild(card);
        });

        container.querySelectorAll('.btn-ganti-komponen').forEach((b) => {
            b.addEventListener('click', () => {
                openGantiKomponenModal(b.getAttribute('data-key'), b.getAttribute('data-name'));
            });
        });
    }

    function renderServisLogList(motor) {
        const container = document.getElementById('servis-log-list');
        if (!container || !motor || !_store) return;

        const logs = _store.getServiceLogs(motor.id);
        container.innerHTML = '';
        const escapeHtml = _utils ? _utils.escapeHtml : (s) => s;

        if (logs.length === 0) {
            container.innerHTML =
                '<p class="text-secondary text-sm text-center" style="padding:24px 0;">Belum ada riwayat servis berkala.</p>';
            return;
        }

        logs.slice()
            .reverse()
            .forEach((s) => {
                const card = document.createElement('div');
                card.className = 'p-12 mb-8';
                card.style.cssText =
                    'background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-card);';

                card.innerHTML =
                    '<div class="d-flex justify-between align-center mb-4">' +
                    '<span class="font-bold text-sm" style="color:var(--accent-primary);">' +
                    escapeHtml(s.category || 'Servis') +
                    '</span>' +
                    '<span class="text-xs text-secondary">' +
                    escapeHtml(s.date || '-') +
                    '</span>' +
                    '</div>' +
                    '<div class="text-xs text-secondary mb-4">' +
                    'Odo: <strong>' +
                    (Number(s.odometer) || 0).toLocaleString('id-ID') +
                    ' KM</strong> • Bengkel: ' +
                    escapeHtml(s.workshop || 'Mandiri') +
                    '</div>' +
                    (s.notes
                        ? '<div class="text-xs" style="color:var(--text-primary);">' + escapeHtml(s.notes) + '</div>'
                        : '') +
                    (s.totalCost
                        ? '<div class="text-xs font-bold text-accent mt-4">Total: Rp ' +
                          Number(s.totalCost).toLocaleString('id-ID') +
                          '</div>'
                        : '');

                container.appendChild(card);
            });
    }

    function openGantiKomponenModal(key, name) {
        if (!_store) return;
        const motor = _store.getActiveMotor();
        if (!motor) return;

        const keyEl = document.getElementById('ganti-komp-key');
        const nameEl = document.getElementById('ganti-komp-name');
        const titleEl = document.getElementById('modal-komponen-title');
        const odoEl = document.getElementById('ganti-komp-odo');

        if (keyEl) keyEl.value = key;
        if (nameEl) nameEl.value = name;
        if (titleEl) titleEl.textContent = 'Catat Penggantian ' + name;
        if (odoEl) odoEl.value = motor.currentOdo || '';

        if (_utils && typeof _utils.clearFormErrors === 'function') {
            _utils.clearFormErrors('form-ganti-komponen');
        }

        if (_utils) _utils.openModal('modal-ganti-komponen');
    }

    function handleGantiKomponenSubmit(e) {
        if (e) e.preventDefault();
        if (!_store) return;
        const motor = _store.getActiveMotor();
        if (!motor) return;

        if (_utils && typeof _utils.clearFormErrors === 'function') {
            _utils.clearFormErrors('form-ganti-komponen');
        }

        const key = document.getElementById('ganti-komp-key').value;
        const name = document.getElementById('ganti-komp-name').value;
        const date = document.getElementById('ganti-komp-date').value;
        const odo = Number(document.getElementById('ganti-komp-odo').value);
        const produk = document.getElementById('ganti-komp-produk').value.trim();
        const biaya = Number(document.getElementById('ganti-komp-biaya').value) || 0;
        const notes = document.getElementById('ganti-komp-notes').value.trim();

        if (isNaN(odo) || odo < 0) {
            const err = 'Odometer penggantian tidak boleh bernilai negatif';
            if (_utils) {
                if (typeof _utils.setFieldError === 'function') {
                    _utils.setFieldError('ganti-komp-odo', err);
                }
                _utils.showToast('⚠️ ' + err);
            }
            const odoInput = document.getElementById('ganti-komp-odo');
            if (odoInput && typeof odoInput.focus === 'function') {
                odoInput.focus();
            }
            return;
        }

        const log = {
            id: 'srv-' + Date.now(),
            motorId: motor.id,
            date: date,
            odometer: odo,
            category: 'Ganti ' + name,
            workshop: produk || 'Ganti Sparepart',
            totalCost: biaya,
            notes: notes
        };

        _store.addComponentReplacement(key, odo, date, log);

        if (_utils) {
            _utils.closeModal('modal-ganti-komponen');
            _utils.showToast('✅ Penggantian ' + name + ' berhasil dicatat!');
        }
    }

    function openServisLogModal() {
        if (!_store) return;
        const motor = _store.getActiveMotor();
        if (!motor) return;

        const odoEl = document.getElementById('servis-log-odo');
        if (odoEl) odoEl.value = motor.currentOdo || '';

        if (_utils && typeof _utils.clearFormErrors === 'function') {
            _utils.clearFormErrors('form-servis-log');
        }

        if (_utils) _utils.openModal('modal-servis-log');
    }

    function handleServisLogSubmit(e) {
        if (e) e.preventDefault();
        if (!_store) return;
        const motor = _store.getActiveMotor();
        if (!motor) return;

        if (_utils && typeof _utils.clearFormErrors === 'function') {
            _utils.clearFormErrors('form-servis-log');
        }

        const date = document.getElementById('servis-log-date').value;
        const odo = Number(document.getElementById('servis-log-odo').value) || motor.currentOdo;
        const jenis = document.getElementById('servis-log-jenis').value;
        const bengkel = document.getElementById('servis-log-bengkel').value.trim();
        const biaya = Number(document.getElementById('servis-log-biaya').value) || 0;
        const notes = document.getElementById('servis-log-notes').value.trim();

        if (_motoLogic && typeof _motoLogic.validateServiceLogInput === 'function') {
            const validation = _motoLogic.validateServiceLogInput({
                category: jenis,
                odometer: odo,
                date,
                totalCost: biaya,
                workshop: bengkel,
                notes
            });
            if (!validation.isValid) {
                const firstErr = validation.errors[0] || 'Data servis tidak valid';
                let targetId = 'servis-log-odo';
                const lower = firstErr.toLowerCase();
                if (lower.includes('tanggal')) {
                    targetId = 'servis-log-date';
                } else if (lower.includes('kategori') || lower.includes('jenis')) {
                    targetId = 'servis-log-jenis';
                } else if (lower.includes('biaya') || lower.includes('harga')) {
                    targetId = 'servis-log-biaya';
                }

                if (_utils) {
                    if (typeof _utils.setFieldError === 'function') {
                        _utils.setFieldError(targetId, firstErr);
                    }
                    _utils.showToast('⚠️ ' + firstErr);
                }

                const targetEl = document.getElementById(targetId);
                if (targetEl && typeof targetEl.focus === 'function') {
                    targetEl.focus();
                }
                return;
            }
        }

        const log = {
            id: 'srv-' + Date.now(),
            motorId: motor.id,
            date: date,
            odometer: odo,
            category: jenis,
            workshop: bengkel,
            totalCost: biaya,
            notes: notes
        };

        _store.addServiceLog(log);

        if (_utils) {
            _utils.closeModal('modal-servis-log');
            _utils.showToast('✅ Riwayat servis berhasil dicatat!');
        }
    }

    function renderChecklist(motor) {
        if (!motor || !_store) return;
        const chkState = _store.getChecklist(motor.id);

        const subChecklist = document.getElementById('servis-sub-checklist');
        if (subChecklist && !subChecklist.dataset.listenerAttached) {
            subChecklist.addEventListener('change', function (e) {
                if (e.target && e.target.matches('input[type="checkbox"]')) {
                    const activeMotor = _store.getActiveMotor();
                    if (!activeMotor) return;
                    _store.setChecklistItem(activeMotor.id, e.target.id, e.target.checked);
                }
            });
            subChecklist.dataset.listenerAttached = 'true';
        }

        const checkInputs = document.querySelectorAll('#servis-sub-checklist input[type="checkbox"]');
        checkInputs.forEach((input) => {
            input.checked = !!chkState[input.id];
        });

        const resetBtn = document.getElementById('btn-reset-checklist');
        if (resetBtn && !resetBtn.dataset.listenerAttached) {
            resetBtn.addEventListener('click', function () {
                const activeMotor = _store.getActiveMotor();
                if (!activeMotor) return;
                _store.resetChecklist(activeMotor.id);
                if (_utils) _utils.showToast('Checklist telah direset.');
            });
            resetBtn.dataset.listenerAttached = 'true';
        }
    }

    function renderBaseline(motor) {
        const select = document.getElementById('baseline-motor-select');
        const listContainer = document.getElementById('baseline-komponen-list');
        if (!select || !listContainer || !motor || !_store) return;

        select.innerHTML = '';
        _store.getMotors().forEach((m) => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = m.nickname || m.model;
            if (m.id === motor.id) opt.selected = true;
            select.appendChild(opt);
        });

        listContainer.innerHTML = '';
        const isMatic =
            motor.hasCVT !== false && motor.type !== 'sport' && motor.type !== 'trail' && motor.type !== 'bebek';
        const keys = isMatic
            ? [
                  'engineOil',
                  'gearOil',
                  'vBelt',
                  'rollerCVT',
                  'airFilter',
                  'sparkPlug',
                  'brakePadFront',
                  'brakePadRear',
                  'tireFront',
                  'tireRear'
              ]
            : [
                  'engineOil',
                  'chainLube',
                  'chainAdjust',
                  'airFilter',
                  'sparkPlug',
                  'brakePadFront',
                  'brakePadRear',
                  'tireFront',
                  'tireRear'
              ];

        const escapeHtml = _utils ? _utils.escapeHtml : (s) => s;

        keys.forEach((key) => {
            const def = _componentDefinitions.find((c) => c.key === key);
            const name = def ? def.name : key;
            const currentVal =
                motor.componentReplacedOdo && motor.componentReplacedOdo[key] !== undefined
                    ? motor.componentReplacedOdo[key]
                    : '';

            const row = document.createElement('div');
            row.className = 'form-group mb-8';
            row.innerHTML =
                '<label class="form-label text-xs">' +
                escapeHtml(name) +
                ' (KM Terakhir Ganti):</label>' +
                '<input type="number" class="form-input baseline-km-input" data-key="' +
                escapeHtml(key) +
                '" value="' +
                escapeHtml(currentVal) +
                '" placeholder="Contoh: 35000" />';
            listContainer.appendChild(row);
        });

        const btnSimpan = document.getElementById('btn-simpan-baseline');
        if (btnSimpan && !btnSimpan.dataset.listenerAttached) {
            btnSimpan.addEventListener('click', function () {
                const activeMotor = _store.getActiveMotor();
                if (!activeMotor) return;
                const inputs = listContainer.querySelectorAll('.baseline-km-input');
                const odoMap = {};
                inputs.forEach((inp) => {
                    const k = inp.getAttribute('data-key');
                    const val = inp.value.trim();
                    if (val !== '') {
                        odoMap[k] = Number(val);
                    }
                });
                _store.saveBaseline(activeMotor.id, odoMap);
                if (_utils) _utils.showToast('✅ Baseline riwayat motor berhasil disimpan!');
            });
            btnSimpan.dataset.listenerAttached = 'true';
        }
    }

    function initListeners() {
        const formGantiKomp = document.getElementById('form-ganti-komponen');
        if (formGantiKomp) formGantiKomp.addEventListener('submit', handleGantiKomponenSubmit);

        const btnCancelKomp = document.getElementById('btn-modal-komp-cancel');
        if (btnCancelKomp) {
            btnCancelKomp.addEventListener('click', () => {
                if (_utils) _utils.closeModal('modal-ganti-komponen');
            });
        }

        const btnTambahServisLog = document.getElementById('btn-tambah-servis-log');
        if (btnTambahServisLog) btnTambahServisLog.addEventListener('click', openServisLogModal);

        const formServisLog = document.getElementById('form-servis-log');
        if (formServisLog) formServisLog.addEventListener('submit', handleServisLogSubmit);

        const btnCancelServisLog = document.getElementById('btn-modal-servis-log-cancel');
        if (btnCancelServisLog) {
            btnCancelServisLog.addEventListener('click', () => {
                if (_utils) _utils.closeModal('modal-servis-log');
            });
        }
    }

    return {
        init,
        getComponentHealth,
        renderKomponenList,
        renderServisLogList,
        renderChecklist,
        renderBaseline,
        renderAllService,
        openGantiKomponenModal,
        handleGantiKomponenSubmit,
        openServisLogModal,
        handleServisLogSubmit,
        initListeners
    };
});
