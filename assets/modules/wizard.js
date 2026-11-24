/**
 * MotoCare v2.0 - Motor Wizard & Management Module
 * Adding new motorcycle, presets vs custom model, input validation, and deletion dialog.
 */
(function (root, factory) {
    const exported = factory();
    if (typeof root !== 'undefined' && root) {
        root.MotoCare = root.MotoCare || {};
        root.MotoCare.Wizard = exported;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = exported;
    }
})(typeof self !== 'undefined' ? self : typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    let _store = null;
    let _utils = null;
    let _motoLogic = null;
    let _motorPresets = [];
    let pendingDeleteMotorId = null;

    function init(deps) {
        _store = deps && deps.Store;
        _utils = deps && deps.Utils;
        _motoLogic = deps && deps.MotoLogic;
        _motorPresets = (deps && deps.MOTOR_PRESETS) || (typeof MOTOR_PRESETS !== 'undefined' ? MOTOR_PRESETS : []);

        initListeners();
    }

    function getPreset(presetId) {
        if (!_motorPresets || _motorPresets.length === 0) return null;
        return _motorPresets.find((p) => p.id === presetId) || null;
    }

    function openAddMotorWizard() {
        initBrandAndModelSelectors();

        const yearInput = document.getElementById('motor-year');
        const odoInput = document.getElementById('motor-odo');
        const plateInput = document.getElementById('motor-plate');
        const notesInput = document.getElementById('motor-notes');

        if (yearInput && !yearInput.value) yearInput.value = '2022';
        if (odoInput && !odoInput.value) odoInput.value = '0';
        if (plateInput) plateInput.value = '';
        if (notesInput) notesInput.value = '';

        if (_utils && typeof _utils.clearFormErrors === 'function') {
            _utils.clearFormErrors('form-motor');
        }

        if (_utils) _utils.openModal('modal-motor');
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
            if (_motorPresets && _motorPresets.length > 0) {
                filtered = _motorPresets.filter((p) => {
                    if (selectedBrand === 'Custom / Lainnya') return p.brand === 'Custom' || p.id === 'custom-motor';
                    return p.brand.toLowerCase() === selectedBrand.toLowerCase();
                });
            }

            filtered.forEach((p) => {
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

        if (!brandSelect.dataset.listenerAttached) {
            brandSelect.addEventListener('change', updateModelList);
            brandSelect.dataset.listenerAttached = 'true';
        }
        if (!modelSelect.dataset.listenerAttached) {
            modelSelect.addEventListener('change', checkCustomModelVisibility);
            modelSelect.dataset.listenerAttached = 'true';
        }

        if (nickInput && !nickInput.dataset.listenerAttached) {
            nickInput.addEventListener('input', function () {
                this.dataset.autofilled = 'false';
            });
            nickInput.dataset.listenerAttached = 'true';
        }

        updateModelList();
    }

    function handleSaveNewMotor(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (!_store) return;

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
        const preset = !isCustom ? getPreset(presetId) : null;
        const modelName = isCustom ? customModelText || 'Sepeda Motor Kustom' : preset ? preset.model : 'Sepeda Motor';

        let nickname = (nickInput && nickInput.value.trim()) || '';
        if (!nickname) nickname = modelName;

        const plate = (plateInput && plateInput.value.trim()) || '';
        const year = Number(yearInput && yearInput.value) || new Date().getFullYear();
        const initialOdo = Number(odoInput && odoInput.value) || 0;
        const notes = (notesInput && notesInput.value.trim()) || '';

        if (_utils && typeof _utils.clearFormErrors === 'function') {
            _utils.clearFormErrors('form-motor');
        }

        if (_motoLogic && typeof _motoLogic.validateMotorInput === 'function') {
            const validation = _motoLogic.validateMotorInput({
                brand: brand.replace(' / Lainnya', ''),
                model: modelName,
                nickname,
                plateNumber: plate,
                year,
                currentOdo: initialOdo,
                notes
            });
            if (!validation.isValid) {
                const firstErr = validation.errors[0] || 'Data motor tidak valid';
                let targetId = 'motor-nickname';
                const lower = firstErr.toLowerCase();
                if (lower.includes('model')) {
                    targetId = isCustom ? 'motor-custom-model' : 'motor-model';
                } else if (lower.includes('tahun')) {
                    targetId = 'motor-year';
                } else if (lower.includes('odometer')) {
                    targetId = 'motor-odo';
                } else if (lower.includes('plat')) {
                    targetId = 'motor-plate';
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
            serviceIntervals: preset
                ? Object.assign({}, preset.serviceIntervals)
                : {
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

        _store.addMotor(newMotor);

        if (_utils) {
            _utils.closeModal('modal-motor');
            _utils.showToast('✅ Berhasil menambahkan motor: ' + nickname);
        }
    }

    function confirmDeleteMotor(motorId) {
        if (!_store) return;
        const motor = _store.getMotorById(motorId);
        if (!motor) return;

        pendingDeleteMotorId = motorId;
        const titleEl = document.getElementById('modal-konfirmasi-title');
        const descEl = document.getElementById('modal-konfirmasi-desc');

        if (titleEl) titleEl.textContent = 'Hapus ' + (motor.nickname || motor.model) + '?';
        if (descEl)
            descEl.textContent = 'Semua data odometer, servis, dan riwayat bensin motor ini akan dihapus permanen.';

        if (_utils) _utils.openModal('modal-konfirmasi');
    }

    function executeDelete() {
        if (!pendingDeleteMotorId || !_store) return;
        const motorId = pendingDeleteMotorId;
        pendingDeleteMotorId = null;

        _store.deleteMotor(motorId);

        if (_utils) {
            _utils.closeModal('modal-konfirmasi');
            _utils.showToast('Motor berhasil dihapus.');
        }
    }

    function initListeners() {
        ['btn-empty-add-motor', 'btn-empty-add-motor-2', 'fab-add-motor'].forEach((id) => {
            const btn = document.getElementById(id);
            if (btn) btn.addEventListener('click', openAddMotorWizard);
        });

        const btnMotorCancel = document.getElementById('btn-modal-motor-cancel');
        if (btnMotorCancel) {
            btnMotorCancel.addEventListener('click', () => {
                if (_utils) _utils.closeModal('modal-motor');
            });
        }

        const btnSaveMotor = document.getElementById('btn-modal-motor-save');
        if (btnSaveMotor) btnSaveMotor.addEventListener('click', handleSaveNewMotor);

        const formMotor = document.getElementById('form-motor');
        if (formMotor) formMotor.addEventListener('submit', handleSaveNewMotor);

        const btnKonfirmasiCancel = document.getElementById('btn-konfirmasi-cancel');
        if (btnKonfirmasiCancel) {
            btnKonfirmasiCancel.addEventListener('click', () => {
                pendingDeleteMotorId = null;
                if (_utils) _utils.closeModal('modal-konfirmasi');
            });
        }

        const btnKonfirmasiOk = document.getElementById('btn-konfirmasi-ok');
        if (btnKonfirmasiOk) btnKonfirmasiOk.addEventListener('click', executeDelete);
    }

    return {
        init,
        openAddMotorWizard,
        initBrandAndModelSelectors,
        handleSaveNewMotor,
        confirmDeleteMotor,
        executeDelete,
        initListeners
    };
});
