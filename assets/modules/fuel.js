/**
 * MotoCare v2.0 - BBM / Fuel Tracking Module
 * Fuel log calculations, modal interactions, fuel log listing and deletion.
 */
(function (root, factory) {
    const exported = factory();
    if (typeof root !== 'undefined' && root) {
        root.MotoCare = root.MotoCare || {};
        root.MotoCare.Fuel = exported;
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
    let _fuelTypes = [];

    function init(deps) {
        _store = deps && deps.Store;
        _eventBus = deps && deps.EventBus;
        _utils = deps && deps.Utils;
        _motoLogic = deps && deps.MotoLogic;
        _fuelTypes = (deps && deps.FUEL_TYPES) || (typeof FUEL_TYPES !== 'undefined' ? FUEL_TYPES : []);

        if (_eventBus && _eventBus.EVENTS) {
            _eventBus.on(_eventBus.EVENTS.STATE_LOADED, () => render(_store.getActiveMotor()));
            _eventBus.on(_eventBus.EVENTS.MOTOR_SELECTED, (p) => render(p.motor));
            _eventBus.on(_eventBus.EVENTS.FUEL_ADDED, (p) => render(p.motor));
            _eventBus.on(_eventBus.EVENTS.FUEL_DELETED, (p) => render(p.motor));
        }

        initListeners();
    }

    function render(motor) {
        if (!motor || !_store) return;

        const logs = _store.getFuelLogs(motor.id);
        const avgEl = document.getElementById('bbm-avg-kml');
        const totalLiterEl = document.getElementById('bbm-total-liter');
        const estBiayaEl = document.getElementById('bbm-est-biaya');
        const logCountEl = document.getElementById('bbm-log-count');
        const logList = document.getElementById('bbm-log-list');

        const stats =
            _motoLogic && typeof _motoLogic.calculateFuelStats === 'function'
                ? _motoLogic.calculateFuelStats(logs)
                : { totalLiters: 0, totalCost: 0, avgKml: null, logCount: logs.length };

        if (avgEl) avgEl.textContent = stats.avgKml !== null ? stats.avgKml + ' km/L' : 'Belum Cukup Data';
        if (totalLiterEl) totalLiterEl.textContent = stats.totalLiters.toFixed(1) + ' L';
        if (estBiayaEl) estBiayaEl.textContent = 'Rp ' + Math.round(stats.totalCost).toLocaleString('id-ID');
        if (logCountEl) logCountEl.textContent = stats.logCount + ' Kali';

        if (!logList) return;
        logList.innerHTML = '';

        if (logs.length === 0) {
            logList.innerHTML =
                '<p class="text-secondary text-sm text-center" style="padding:24px 0;">Belum ada catatan pengisian BBM.</p>';
            return;
        }

        const escapeHtml = _utils ? _utils.escapeHtml : (s) => s;

        logs.slice()
            .reverse()
            .forEach((l) => {
                const row = document.createElement('div');
                row.className = 'p-12 mb-8';
                row.style.cssText =
                    'background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-card); display:flex; justify-content:space-between; align-items:center;';

                row.innerHTML =
                    '<div>' +
                    '<div class="font-bold text-sm" style="color:var(--text-primary);">' +
                    escapeHtml(l.fuelType || 'Bensin') +
                    ' • ' +
                    (Number(l.liters) || 0).toFixed(2) +
                    ' Liter</div>' +
                    '<div class="text-xs text-secondary">' +
                    escapeHtml(l.date || '-') +
                    ' • KM ' +
                    (Number(l.odometer) || 0).toLocaleString('id-ID') +
                    (l.isFullTank ? ' • <em>Full Tank</em>' : '') +
                    '</div>' +
                    '</div>' +
                    '<div style="text-align:right;">' +
                    '<div class="font-heading text-accent text-sm" style="font-size:15px;">Rp ' +
                    (Number(l.totalCost) || 0).toLocaleString('id-ID') +
                    '</div>' +
                    '<button class="text-xs text-secondary btn-del-fuel" data-id="' +
                    escapeHtml(l.id) +
                    '" style="background:none; border:none; cursor:pointer; color:var(--status-danger);">Hapus</button>' +
                    '</div>';

                logList.appendChild(row);
            });

        logList.querySelectorAll('.btn-del-fuel').forEach((b) => {
            b.addEventListener('click', () => {
                const id = b.getAttribute('data-id');
                if (_store) {
                    _store.deleteFuelLog(id);
                    if (_utils) _utils.showToast('Catatan BBM dihapus.');
                }
            });
        });
    }

    function openBbmModal() {
        if (!_store) return;
        const motor = _store.getActiveMotor();
        if (!motor) return;

        const modal = document.getElementById('modal-bbm');
        const odoEl = document.getElementById('bbm-odo');
        if (odoEl) odoEl.value = motor.currentOdo || '';

        const selectJenis = document.getElementById('bbm-jenis');
        if (selectJenis && _fuelTypes.length > 0) {
            selectJenis.innerHTML = '';
            _fuelTypes.forEach((f) => {
                const opt = document.createElement('option');
                opt.value = f.name;
                opt.textContent = f.name + ' (Rp ' + f.price.toLocaleString('id-ID') + ')';
                opt.setAttribute('data-price', f.price);
                selectJenis.appendChild(opt);
            });

            if (!selectJenis.dataset.listenerAttached) {
                selectJenis.addEventListener('change', function () {
                    const opt = this.options[this.selectedIndex];
                    const price = opt ? opt.getAttribute('data-price') : 10000;
                    const hargaEl = document.getElementById('bbm-harga');
                    if (hargaEl) {
                        hargaEl.value = price;
                        calcBbmTotal();
                    }
                });
                selectJenis.dataset.listenerAttached = 'true';
            }
            selectJenis.dispatchEvent(new Event('change'));
        }

        const volEl = document.getElementById('bbm-volume');
        const hargaEl = document.getElementById('bbm-harga');
        if (volEl && !volEl.dataset.listenerAttached) {
            volEl.addEventListener('input', calcBbmTotal);
            volEl.dataset.listenerAttached = 'true';
        }
        if (hargaEl && !hargaEl.dataset.listenerAttached) {
            hargaEl.addEventListener('input', calcBbmTotal);
            hargaEl.dataset.listenerAttached = 'true';
        }

        if (_utils && typeof _utils.clearFormErrors === 'function') {
            _utils.clearFormErrors('form-bbm');
        }

        if (_utils) _utils.openModal(modal);
    }

    function calcBbmTotal() {
        const vol = parseFloat(document.getElementById('bbm-volume').value) || 0;
        const harga = parseFloat(document.getElementById('bbm-harga').value) || 0;
        const totalEl = document.getElementById('bbm-total');
        if (totalEl) {
            const total =
                _motoLogic && typeof _motoLogic.calculateBbmTotal === 'function'
                    ? _motoLogic.calculateBbmTotal(vol, harga)
                    : Math.round(vol * harga);
            totalEl.value = total;
        }
    }

    function handleBbmSubmit(e) {
        if (e) e.preventDefault();
        if (!_store) return;
        const motor = _store.getActiveMotor();
        if (!motor) return;

        const tanggal = document.getElementById('bbm-tanggal').value;
        const odo = Number(document.getElementById('bbm-odo').value) || motor.currentOdo;
        const jenis = document.getElementById('bbm-jenis').value;
        const harga = Number(document.getElementById('bbm-harga').value) || 10000;
        const volume = parseFloat(document.getElementById('bbm-volume').value) || 0;
        const total = Number(document.getElementById('bbm-total').value) || volume * harga;
        const notes = document.getElementById('bbm-notes').value.trim();

        if (_utils && typeof _utils.clearFormErrors === 'function') {
            _utils.clearFormErrors('form-bbm');
        }

        if (_motoLogic && typeof _motoLogic.validateFuelInput === 'function') {
            const validation = _motoLogic.validateFuelInput({
                fuelType: jenis,
                liters: volume,
                totalCost: total,
                odometer: odo,
                date: tanggal,
                isFullTank: true,
                notes
            });
            if (!validation.isValid) {
                const firstErr = validation.errors[0] || 'Data BBM tidak valid';
                let targetId = 'bbm-volume';
                const lower = firstErr.toLowerCase();
                if (lower.includes('jenis')) {
                    targetId = 'bbm-jenis';
                } else if (lower.includes('odometer')) {
                    targetId = 'bbm-odo';
                } else if (lower.includes('tanggal')) {
                    targetId = 'bbm-tanggal';
                } else if (lower.includes('biaya') || lower.includes('total') || lower.includes('harga')) {
                    targetId = 'bbm-total';
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
        } else if (volume <= 0) {
            if (_utils) {
                if (typeof _utils.setFieldError === 'function') {
                    _utils.setFieldError('bbm-volume', 'Masukkan volume liter bensin yang valid!');
                }
                _utils.showToast('⚠️ Masukkan volume liter bensin yang valid!');
            }
            const volInput = document.getElementById('bbm-volume');
            if (volInput && typeof volInput.focus === 'function') {
                volInput.focus();
            }
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

        _store.addFuelLog(newLog);

        if (_utils) {
            _utils.closeModal('modal-bbm');
            _utils.showToast('⛽ Catatan BBM tersimpan!');
        }
    }

    function initListeners() {
        const btnCatatBbm = document.getElementById('btn-catat-bbm');
        if (btnCatatBbm) btnCatatBbm.addEventListener('click', openBbmModal);

        const formBbm = document.getElementById('form-bbm');
        if (formBbm) formBbm.addEventListener('submit', handleBbmSubmit);

        const btnCancelBbm = document.getElementById('btn-modal-bbm-cancel');
        if (btnCancelBbm) {
            btnCancelBbm.addEventListener('click', () => {
                if (_utils) _utils.closeModal('modal-bbm');
            });
        }
    }

    return {
        init,
        render,
        openBbmModal,
        calcBbmTotal,
        handleBbmSubmit,
        initListeners
    };
});
