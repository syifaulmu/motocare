/**
 * MotoCare v2.0 - Main Application Orchestrator
 * Bootstraps modules, injects explicit dependencies, and initializes navigation & backup tools.
 */
(function (root, factory) {
    const exported = factory();
    if (typeof root !== 'undefined' && root) {
        root.MotoCare = root.MotoCare || {};
        root.MotoCare.App = exported;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = exported;
    }
})(typeof self !== 'undefined' ? self : typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    async function init() {
        const MotoCare = typeof window !== 'undefined' && window.MotoCare ? window.MotoCare : {};
        const EventBus = MotoCare.EventBus;
        const Utils = MotoCare.Utils;
        const Storage = MotoCare.Storage;
        const Store = MotoCare.Store;
        const Notifications = MotoCare.Notifications;
        const Fuel = MotoCare.Fuel;
        const Service = MotoCare.Service;
        const Wizard = MotoCare.Wizard;
        const Camera = MotoCare.Camera;
        const Gemini = MotoCare.Gemini;
        const Render = MotoCare.Render;

        const motoLogic =
            typeof window !== 'undefined' && window.MotoLogic
                ? window.MotoLogic
                : typeof MotoLogic !== 'undefined'
                  ? MotoLogic
                  : null;
        const fuelTypes =
            typeof window !== 'undefined' && window.FUEL_TYPES
                ? window.FUEL_TYPES
                : typeof FUEL_TYPES !== 'undefined'
                  ? FUEL_TYPES
                  : [];
        const motorPresets =
            typeof window !== 'undefined' && window.MOTOR_PRESETS
                ? window.MOTOR_PRESETS
                : typeof MOTOR_PRESETS !== 'undefined'
                  ? MOTOR_PRESETS
                  : [];
        const componentDefs =
            typeof window !== 'undefined' && window.COMPONENT_DEFINITIONS
                ? window.COMPONENT_DEFINITIONS
                : typeof COMPONENT_DEFINITIONS !== 'undefined'
                  ? COMPONENT_DEFINITIONS
                  : [];

        // 1. Initialize Storage & Load persisted state
        let loadedState = null;
        if (Storage && Storage.StorageManager) {
            try {
                loadedState = await Storage.StorageManager.init();
            } catch (err) {
                console.error('[App] StorageManager.init error, using sync fallback:', err);
                loadedState = Storage.StorageManager.getSync();
            }
        }

        // 2. Initialize Central Store
        if (Store) {
            Store.init(loadedState, Storage ? Storage.StorageManager : null, EventBus);
        }

        // 3. Initialize Domain Modules with Explicit Dependency Injection
        if (Wizard) {
            Wizard.init({
                Store,
                EventBus,
                Utils,
                MotoLogic: motoLogic,
                MOTOR_PRESETS: motorPresets
            });
        }

        if (Fuel) {
            Fuel.init({
                Store,
                EventBus,
                Utils,
                MotoLogic: motoLogic,
                FUEL_TYPES: fuelTypes
            });
        }

        if (Service) {
            Service.init({
                Store,
                EventBus,
                Utils,
                MotoLogic: motoLogic,
                COMPONENT_DEFINITIONS: componentDefs,
                MOTOR_PRESETS: motorPresets
            });
        }

        if (Notifications) {
            Notifications.init({
                Store,
                EventBus,
                MotoLogic: motoLogic,
                Utils
            });
        }

        if (Camera) {
            Camera.init({ Utils });
        }

        if (Gemini) {
            Gemini.init({ Store, Utils });
        }

        if (Render) {
            Render.init({
                Store,
                EventBus,
                Utils,
                MotoLogic: motoLogic,
                COMPONENT_DEFINITIONS: componentDefs,
                Wizard
            });
        }

        // 4. Setup Navigation & Global Event Handlers
        initNavigation();
        initBackupAndSettings();
        initOverlayDismiss();

        if (Utils && typeof Utils.initDefaultDates === 'function') {
            Utils.initDefaultDates();
        }

        // 5. Initial Render and Notification Check
        if (Render && typeof Render.renderAll === 'function') {
            Render.renderAll();
        }
        if (Notifications && typeof Notifications.checkAndSendNotifications === 'function') {
            Notifications.checkAndSendNotifications();
        }
    }

    function initNavigation() {
        // Bottom navigation tab switching
        document.querySelectorAll('.bottom-nav .nav-item').forEach((btn) => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-tab');
                switchTab(tab);
            });
        });

        // Servis subtab switching
        document.querySelectorAll('.tab-secondary-item, .servis-tab-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const subtab = btn.getAttribute('data-servis-tab') || btn.getAttribute('data-subtab');
                switchServisSubtab(subtab);
            });
        });

        // Quick shortcut to all components
        const btnLihatSemua = document.getElementById('btn-lihat-semua-komponen');
        if (btnLihatSemua) {
            btnLihatSemua.addEventListener('click', () => {
                switchTab('servis');
                switchServisSubtab('komponen');
            });
        }
    }

    function switchTab(tabName) {
        document.querySelectorAll('.bottom-nav .nav-item').forEach((btn) => {
            const isMatch = btn.getAttribute('data-tab') === tabName;
            btn.classList.toggle('active', isMatch);
            btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
        });

        document.querySelectorAll('.page-section').forEach((sec) => {
            const match = sec.getAttribute('id') === 'section-' + tabName;
            sec.classList.toggle('active', match);
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function switchServisSubtab(subtabName) {
        document.querySelectorAll('.tab-secondary-item, .servis-tab-btn').forEach((b) => {
            const tabAttr = b.getAttribute('data-servis-tab') || b.getAttribute('data-subtab');
            const isMatch = tabAttr === subtabName;
            b.classList.toggle('active', isMatch);
            b.setAttribute('aria-selected', isMatch ? 'true' : 'false');
        });
        const subKomponen = document.getElementById('servis-sub-komponen');
        const subLog = document.getElementById('servis-sub-log');
        const subChecklist = document.getElementById('servis-sub-checklist');

        if (subKomponen) subKomponen.style.display = subtabName === 'komponen' ? 'block' : 'none';
        if (subLog) subLog.style.display = subtabName === 'log' ? 'block' : 'none';
        if (subChecklist) subChecklist.style.display = subtabName === 'checklist' ? 'block' : 'none';
    }

    function initBackupAndSettings() {
        const MotoCare = typeof window !== 'undefined' && window.MotoCare ? window.MotoCare : {};
        const Store = MotoCare.Store;
        const Storage = MotoCare.Storage;
        const Utils = MotoCare.Utils;
        const Notifications = MotoCare.Notifications;

        // Notification Modal
        const btnNotifHeader = document.getElementById('btn-notif');
        if (btnNotifHeader && Utils) {
            btnNotifHeader.addEventListener('click', () => Utils.openModal('modal-notif'));
        }

        const btnNotifClose = document.getElementById('btn-modal-notif-close');
        if (btnNotifClose && Utils) {
            btnNotifClose.addEventListener('click', () => Utils.closeModal('modal-notif'));
        }

        const btnTestNotif = document.getElementById('btn-test-notification');
        if (btnTestNotif && Notifications) {
            btnTestNotif.addEventListener('click', () => Notifications.sendTestNotification());
        }

        // Notification Toggles
        if (Store) {
            const settings = Store.getNotificationSettings();

            const toggleNotifMaster = document.getElementById('toggle-notif-master');
            if (toggleNotifMaster) {
                toggleNotifMaster.checked = !!settings.enabled;
                toggleNotifMaster.addEventListener('change', function () {
                    Store.updateNotificationSettings({ enabled: this.checked });
                });
            }

            const toggleNotifOverdue = document.getElementById('toggle-notif-overdue');
            if (toggleNotifOverdue) {
                toggleNotifOverdue.checked = !!settings.overdueDailyAlerts;
                toggleNotifOverdue.addEventListener('change', function () {
                    Store.updateNotificationSettings({ overdueDailyAlerts: this.checked });
                });
            }

            const toggleNotifIdeal = document.getElementById('toggle-notif-ideal');
            if (toggleNotifIdeal) {
                toggleNotifIdeal.checked = !!settings.idealWindowAlerts;
                toggleNotifIdeal.addEventListener('change', function () {
                    Store.updateNotificationSettings({ idealWindowAlerts: this.checked });
                });
            }

            const toggleNotifTax = document.getElementById('toggle-notif-tax');
            if (toggleNotifTax) {
                toggleNotifTax.checked = !!settings.taxAlerts;
                toggleNotifTax.addEventListener('change', function () {
                    Store.updateNotificationSettings({ taxAlerts: this.checked });
                });
            }
        }

        // Export JSON
        const btnExport = document.getElementById('btn-export-json');
        if (btnExport && Storage && Store) {
            btnExport.addEventListener('click', () => {
                const payload = Storage.StorageManager.exportData(Store.getState());
                const jsonStr = JSON.stringify(payload, null, 2);

                let sharedViaAndroid = false;
                if (typeof window !== 'undefined' && window.Android && typeof window.Android.shareText === 'function') {
                    try {
                        if (jsonStr.length < 45000) {
                            window.Android.shareText('MotoCare Backup Data (JSON)', jsonStr);
                            sharedViaAndroid = true;
                        }
                    } catch (e) {
                        console.warn('[Export] Android shareText error:', e);
                    }
                }

                try {
                    const blob = new Blob([jsonStr], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const dl = document.createElement('a');
                    dl.href = url;
                    dl.download = 'motocare_backup_' + new Date().toISOString().split('T')[0] + '.json';
                    document.body.appendChild(dl);
                    dl.click();
                    document.body.removeChild(dl);
                    URL.revokeObjectURL(url);
                    if (Utils) {
                        Utils.showToast(
                            sharedViaAndroid
                                ? '📤 Data dibagikan & file cadangan diunduh!'
                                : '📥 File cadangan berhasil diunduh.'
                        );
                    }
                } catch {
                    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonStr);
                    const dl = document.createElement('a');
                    dl.setAttribute('href', dataStr);
                    dl.setAttribute('download', 'motocare_backup_' + new Date().toISOString().split('T')[0] + '.json');
                    dl.click();
                    if (Utils) Utils.showToast('📥 Backup data diexport.');
                }
            });
        }

        // Import JSON
        const btnImport = document.getElementById('btn-import-json');
        const fileImport = document.getElementById('file-import-json');
        if (btnImport && fileImport && Storage && Store) {
            btnImport.addEventListener('click', () => fileImport.click());
            fileImport.addEventListener('change', function () {
                if (this.files && this.files[0]) {
                    const file = this.files[0];
                    const reader = new FileReader();
                    reader.addEventListener('load', async function (e) {
                        try {
                            const text = e.target.result;
                            const importedState = await Storage.StorageManager.importData(text);
                            Store.replaceState(importedState);
                            if (Utils) {
                                Utils.showToast(
                                    '✅ Data berhasil dipulihkan (v' + (importedState.schemaVersion || 1) + ')!'
                                );
                            }
                        } catch (err) {
                            console.error('[Import] Validation/import error:', err);
                            if (Utils) Utils.showToast('⚠️ ' + (err.message || 'Gagal memulihkan file backup.'));
                        }
                    });
                    reader.addEventListener('error', function () {
                        if (Utils) Utils.showToast('⚠️ Gagal membaca berkas dari perangkat.');
                    });
                    reader.readAsText(file);
                }
            });
        }

        // Reset Data
        const btnResetData = document.getElementById('btn-reset-data');
        if (btnResetData && Store) {
            btnResetData.addEventListener('click', () => {
                if (
                    confirm(
                        'Apakah Anda yakin ingin menghapus SELURUH data motor, bensin, dan servis? Data tidak dapat dikembalikan.'
                    )
                ) {
                    Store.resetAllData(Storage ? Storage.DEFAULT_SETTINGS : {});
                    if (Utils) Utils.showToast('🔄 Semua data telah direset ke kondisi awal.');
                }
            });
        }
    }

    function initOverlayDismiss() {
        document.querySelectorAll('.modal-overlay').forEach((overlay) => {
            overlay.addEventListener('click', function (e) {
                if (e.target === this) {
                    this.classList.remove('active');
                    if (this.id === 'modal-camera') {
                        const Camera = typeof window !== 'undefined' && window.MotoCare ? window.MotoCare.Camera : null;
                        if (Camera && typeof Camera.stopStream === 'function') Camera.stopStream();
                    }
                }
            });
        });
    }

    return {
        init,
        switchTab,
        switchServisSubtab
    };
});
