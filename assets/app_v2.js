/**
 * MotoCare v2.0 - Application Bundle
 * Generated automatically from modular architecture in assets/modules/
 * (c) 2026 MotoCare Indonesia - Distributed under MIT License
 */
(function (global) {
    'use strict';
    const root = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : global;
    root.MotoCare = root.MotoCare || {};

    // =========================================================================
    // MODULE: event_bus.js
    // =========================================================================
    /**
     * MotoCare v2.0 - Event Bus Module
     * Simple, robust pub/sub observer for controlled state-change events.
     */
    (function (root, factory) {
        const exported = factory();
        if (typeof root !== 'undefined' && root) {
            root.MotoCare = root.MotoCare || {};
            root.MotoCare.EventBus = exported;
        }
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = exported;
        }
    })(typeof self !== 'undefined' ? self : typeof globalThis !== 'undefined' ? globalThis : this, function () {
        'use strict';

        const EVENTS = Object.freeze({
            STATE_LOADED: 'state:loaded',
            MOTOR_SELECTED: 'motor:selected',
            MOTOR_ADDED: 'motor:added',
            MOTOR_DELETED: 'motor:deleted',
            ODOMETER_UPDATED: 'odometer:updated',
            FUEL_ADDED: 'fuel:added',
            FUEL_DELETED: 'fuel:deleted',
            COMPONENT_REPLACED: 'component:replaced',
            SERVICE_LOG_ADDED: 'service:log_added',
            CHECKLIST_CHANGED: 'checklist:changed',
            THEME_CHANGED: 'theme:changed',
            NOTIFICATIONS_CHANGED: 'notifications:changed',
            DATA_RESET: 'data:reset'
        });

        const listeners = new Map();

        function on(event, callback) {
            if (typeof callback !== 'function') return () => {};
            if (!listeners.has(event)) {
                listeners.set(event, new Set());
            }
            listeners.get(event).add(callback);
            return () => off(event, callback);
        }

        function off(event, callback) {
            if (!listeners.has(event)) return;
            listeners.get(event).delete(callback);
            if (listeners.get(event).size === 0) {
                listeners.delete(event);
            }
        }

        function emit(event, payload) {
            if (!listeners.has(event)) return;
            listeners.get(event).forEach((cb) => {
                try {
                    cb(payload);
                } catch (err) {
                    console.error(`[EventBus] Error in listener for event "${event}":`, err);
                }
            });
        }

        function clearAll() {
            listeners.clear();
        }

        return {
            EVENTS,
            on,
            off,
            emit,
            clearAll
        };
    });

    // =========================================================================
    // MODULE: utils.js
    // =========================================================================
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

    // =========================================================================
    // MODULE: storage.js
    // =========================================================================
    /**
     * MotoCare v2.0 - Storage & Persistence Module
     * IndexedDB primary storage, localStorage fallback, schema migrations, import/export.
     */
    (function (root, factory) {
        const exported = factory();
        if (typeof root !== 'undefined' && root) {
            root.MotoCare = root.MotoCare || {};
            root.MotoCare.Storage = exported;
        }
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = exported;
        }
    })(typeof self !== 'undefined' ? self : typeof globalThis !== 'undefined' ? globalThis : this, function () {
        'use strict';

        const DEFAULT_SETTINGS = Object.freeze({
            enabled: true,
            overdueDailyAlerts: true,
            idealWindowAlerts: true,
            taxAlerts: true,
            alarmHour: 8,
            alarmMinute: 0,
            lastNotificationDates: {}
        });

        const CURRENT_SCHEMA_VERSION = 1;
        const STORAGE_KEY = 'motocare_v2_store';
        const MIGRATION_FLAG_KEY = 'motocare_migrated_v1';
        const DB_NAME = 'MotoCareDB';
        const DB_STORE_NAME = 'app_state';
        const DB_KEY = 'current';

        const MIGRATIONS = {
            1: function migrateToV1(data) {
                if (!data || typeof data !== 'object') {
                    return {
                        schemaVersion: 1,
                        motors: [],
                        activeMotorId: null,
                        fuelLogs: [],
                        serviceLogs: [],
                        checklistStates: {},
                        notificationSettings: Object.assign({}, DEFAULT_SETTINGS),
                        theme: 'dark'
                    };
                }
                const result = Object.assign({}, data);
                result.schemaVersion = 1;

                if (!Array.isArray(result.motors)) {
                    result.motors = [];
                } else {
                    result.motors = result.motors.map((m) => {
                        const motor = Object.assign({}, m);
                        if (!motor.id) motor.id = 'motor-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
                        if (!motor.brand) motor.brand = 'Honda';
                        if (!motor.model) motor.model = 'Sepeda Motor';
                        if (!motor.nickname) motor.nickname = motor.model;
                        if (!motor.plateNumber) motor.plateNumber = '';
                        if (motor.year === undefined || motor.year === null) motor.year = 2022;

                        const odo = Number(m.currentOdo) || 0;
                        motor.currentOdo = odo;
                        if (motor.initialOdo === undefined || motor.initialOdo === null) motor.initialOdo = odo;
                        if (motor.lastServiceOdo === undefined || motor.lastServiceOdo === null)
                            motor.lastServiceOdo = odo;
                        if (!motor.lastServiceDate) motor.lastServiceDate = new Date().toISOString().split('T')[0];

                        if (!motor.componentReplacedOdo || typeof motor.componentReplacedOdo !== 'object') {
                            motor.componentReplacedOdo = {};
                        }
                        if (!motor.componentReplacedDates || typeof motor.componentReplacedDates !== 'object') {
                            motor.componentReplacedDates = {};
                        }
                        if (!motor.serviceIntervals || typeof motor.serviceIntervals !== 'object') {
                            motor.serviceIntervals = {};
                        }
                        return motor;
                    });
                }

                const seenMotorIds = new Set();
                result.motors = result.motors.filter((m) => {
                    if (seenMotorIds.has(m.id)) return false;
                    seenMotorIds.add(m.id);
                    return true;
                });

                if (!Array.isArray(result.fuelLogs)) {
                    result.fuelLogs = [];
                } else {
                    const seenFuelIds = new Set();
                    result.fuelLogs = result.fuelLogs.filter((f) => {
                        if (!f || !f.id || seenFuelIds.has(f.id)) return false;
                        seenFuelIds.add(f.id);
                        return true;
                    });
                }

                if (!Array.isArray(result.serviceLogs)) {
                    result.serviceLogs = [];
                } else {
                    const seenServiceIds = new Set();
                    result.serviceLogs = result.serviceLogs.filter((s) => {
                        if (!s || !s.id || seenServiceIds.has(s.id)) return false;
                        seenServiceIds.add(s.id);
                        return true;
                    });
                }

                if (!result.checklistStates || typeof result.checklistStates !== 'object') {
                    result.checklistStates = {};
                }

                if (result.motors.length > 0) {
                    const hasActive = result.motors.some((m) => m.id === result.activeMotorId);
                    if (!hasActive) {
                        result.activeMotorId = result.motors[0].id;
                    }
                } else {
                    result.activeMotorId = null;
                }

                result.notificationSettings = Object.assign(
                    {},
                    DEFAULT_SETTINGS,
                    result.notificationSettings && typeof result.notificationSettings === 'object'
                        ? result.notificationSettings
                        : {}
                );

                result.theme = result.theme === 'light' ? 'light' : 'dark';
                return result;
            }
        };

        function applyMigrations(data, targetVersion = CURRENT_SCHEMA_VERSION) {
            if (!data || typeof data !== 'object') {
                return MIGRATIONS[1](null);
            }
            let current = Object.assign({}, data);
            const startVersion = Number(current.schemaVersion) || 0;

            for (let v = startVersion + 1; v <= targetVersion; v++) {
                if (typeof MIGRATIONS[v] === 'function') {
                    current = MIGRATIONS[v](current);
                }
            }
            current.schemaVersion = targetVersion;
            return current;
        }

        function validateImportStructure(input) {
            if (input === null || input === undefined) {
                throw new Error('Format data tidak valid.');
            }

            let payload = input;
            if (typeof input === 'string') {
                try {
                    payload = JSON.parse(input);
                } catch (e) {
                    throw new Error('Format JSON tidak valid: ' + e.message);
                }
            }

            if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
                throw new Error('Data utama harus berupa objek.');
            }

            const rawState =
                payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
                    ? payload.data
                    : payload;

            if (!rawState.motors || !Array.isArray(rawState.motors)) {
                throw new Error('Properti "motors" tidak ditemukan atau bukan array.');
            }

            for (let i = 0; i < rawState.motors.length; i++) {
                const m = rawState.motors[i];
                if (!m || typeof m !== 'object') {
                    throw new Error(`Motor pada indeks ${i} tidak valid.`);
                }
                if (!m.id) {
                    throw new Error(`Motor pada indeks ${i} tidak memiliki ID yang valid.`);
                }
                if (!m.brand) {
                    throw new Error(`Motor "${m.id}" tidak memiliki merek yang valid.`);
                }
                if (!m.model) {
                    throw new Error(`Motor "${m.id}" tidak memiliki model yang valid.`);
                }
            }

            if (rawState.fuelLogs !== undefined && !Array.isArray(rawState.fuelLogs)) {
                throw new Error('Properti "fuelLogs" harus berupa array.');
            }

            if (rawState.serviceLogs !== undefined && !Array.isArray(rawState.serviceLogs)) {
                throw new Error('Properti "serviceLogs" harus berupa array.');
            }

            return applyMigrations(rawState, CURRENT_SCHEMA_VERSION);
        }

        const StorageManager = {
            db: null,
            isIndexedDBSupported: false,

            _getLocalStorage() {
                if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
                if (typeof localStorage !== 'undefined') return localStorage;
                return null;
            },

            initIndexedDB() {
                return new Promise((resolve) => {
                    if (typeof window === 'undefined' || !window.indexedDB) {
                        this.isIndexedDBSupported = false;
                        resolve(false);
                        return;
                    }
                    try {
                        const request = window.indexedDB.open(DB_NAME, 1);
                        request.onupgradeneeded = (event) => {
                            const db = event.target.result;
                            if (!db.objectStoreNames.contains(DB_STORE_NAME)) {
                                db.createObjectStore(DB_STORE_NAME);
                            }
                        };
                        request.onsuccess = (event) => {
                            this.db = event.target.result;
                            this.isIndexedDBSupported = true;
                            resolve(true);
                        };
                        request.onerror = (err) => {
                            console.warn('[StorageManager] IndexedDB open error, falling back to localStorage:', err);
                            this.isIndexedDBSupported = false;
                            resolve(false);
                        };
                    } catch (e) {
                        console.warn('[StorageManager] Exception during IndexedDB init:', e);
                        this.isIndexedDBSupported = false;
                        resolve(false);
                    }
                });
            },

            async migrateLegacyLocalStorage() {
                const ls = this._getLocalStorage();
                if (!ls) return null;
                try {
                    const isMigrated = ls.getItem(MIGRATION_FLAG_KEY) === 'true';
                    const rawLegacy = ls.getItem(STORAGE_KEY);
                    if (!isMigrated && rawLegacy) {
                        let legacyData = null;
                        try {
                            legacyData = JSON.parse(rawLegacy);
                        } catch (e) {
                            console.error('[StorageManager] Corrupted legacy data in localStorage:', e);
                        }
                        if (legacyData) {
                            const migrated = applyMigrations(legacyData, CURRENT_SCHEMA_VERSION);
                            await this.set(migrated);
                            ls.setItem(MIGRATION_FLAG_KEY, 'true');
                            return migrated;
                        }
                    }
                } catch (e) {
                    console.error('[StorageManager] Migration from localStorage failed:', e);
                }
                return null;
            },

            getSync() {
                const ls = this._getLocalStorage();
                if (ls) {
                    try {
                        const raw = ls.getItem(STORAGE_KEY);
                        if (raw) {
                            const parsed = JSON.parse(raw);
                            return applyMigrations(parsed, CURRENT_SCHEMA_VERSION);
                        }
                    } catch (e) {
                        console.error('[StorageManager] Error reading localStorage synchronously:', e);
                    }
                }
                return applyMigrations(null, CURRENT_SCHEMA_VERSION);
            },

            async init() {
                await this.initIndexedDB();
                const migrated = await this.migrateLegacyLocalStorage();
                if (migrated) return migrated;
                return await this.get();
            },

            async get() {
                if (this.isIndexedDBSupported && this.db) {
                    try {
                        const data = await new Promise((resolve, reject) => {
                            const tx = this.db.transaction([DB_STORE_NAME], 'readonly');
                            const store = tx.objectStore(DB_STORE_NAME);
                            const req = store.get(DB_KEY);
                            req.onsuccess = () => resolve(req.result);
                            req.onerror = () => reject(req.error);
                        });
                        if (data) {
                            return applyMigrations(data, CURRENT_SCHEMA_VERSION);
                        }
                    } catch (err) {
                        console.warn('[StorageManager] IndexedDB read error, trying fallback:', err);
                    }
                }
                const ls = this._getLocalStorage();
                if (ls) {
                    try {
                        const raw = ls.getItem(STORAGE_KEY);
                        if (raw) {
                            return applyMigrations(JSON.parse(raw), CURRENT_SCHEMA_VERSION);
                        }
                    } catch (e) {
                        console.error('[StorageManager] Error reading fallback localStorage:', e);
                    }
                }
                return applyMigrations(null, CURRENT_SCHEMA_VERSION);
            },

            async set(stateData) {
                const dataToSave = Object.assign({}, stateData);
                dataToSave.schemaVersion = CURRENT_SCHEMA_VERSION;

                if (this.isIndexedDBSupported && this.db) {
                    try {
                        await new Promise((resolve, reject) => {
                            const tx = this.db.transaction([DB_STORE_NAME], 'readwrite');
                            const store = tx.objectStore(DB_STORE_NAME);
                            const req = store.put(dataToSave, DB_KEY);
                            req.onsuccess = () => resolve();
                            req.onerror = () => reject(req.error);
                        });
                    } catch (err) {
                        console.warn('[StorageManager] IndexedDB write failed:', err);
                    }
                }
                const ls = this._getLocalStorage();
                if (ls) {
                    try {
                        ls.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
                    } catch (e) {
                        console.error('[StorageManager] LocalStorage write failed:', e);
                    }
                }
            },

            exportData(stateData) {
                return {
                    app: 'MotoCare',
                    version: '2.0',
                    schemaVersion: CURRENT_SCHEMA_VERSION,
                    exportedAt: new Date().toISOString(),
                    data: applyMigrations(stateData, CURRENT_SCHEMA_VERSION)
                };
            },

            async importData(jsonContent) {
                const validated = validateImportStructure(jsonContent);
                await this.set(validated);
                return validated;
            }
        };

        return {
            DEFAULT_SETTINGS,
            CURRENT_SCHEMA_VERSION,
            STORAGE_KEY,
            MIGRATION_FLAG_KEY,
            applyMigrations,
            validateImportStructure,
            StorageManager
        };
    });

    // =========================================================================
    // MODULE: state.js
    // =========================================================================
    /**
     * MotoCare v2.0 - State & Store Management Module
     * Encapsulated unidirectional data flow: state is only mutated via explicit actions.
     * Automatically saves to Storage and emits fine-grained events on EventBus.
     */
    (function (root, factory) {
        const exported = factory();
        if (typeof root !== 'undefined' && root) {
            root.MotoCare = root.MotoCare || {};
            root.MotoCare.Store = exported;
        }
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = exported;
        }
    })(typeof self !== 'undefined' ? self : typeof globalThis !== 'undefined' ? globalThis : this, function () {
        'use strict';

        let _state = null;
        let _storage = null;
        let _eventBus = null;

        function init(initialData, storageService, eventBusService) {
            _state = Object.assign(
                {
                    motors: [],
                    activeMotorId: null,
                    fuelLogs: [],
                    serviceLogs: [],
                    checklistStates: {},
                    notificationSettings: {},
                    theme: 'dark'
                },
                initialData
            );
            _storage =
                storageService ||
                (typeof window !== 'undefined' && window.MotoCare && window.MotoCare.Storage
                    ? window.MotoCare.Storage.StorageManager
                    : null);
            _eventBus =
                eventBusService ||
                (typeof window !== 'undefined' && window.MotoCare && window.MotoCare.EventBus
                    ? window.MotoCare.EventBus
                    : null);

            if (_eventBus && _eventBus.EVENTS) {
                _eventBus.emit(_eventBus.EVENTS.STATE_LOADED, { state: getState() });
            }
            return getState();
        }

        function _persist() {
            if (_storage && typeof _storage.set === 'function') {
                try {
                    _storage.set(_state);
                } catch (err) {
                    console.error('[Store] Error persisting state:', err);
                }
            }
        }

        function getState() {
            return _state ? JSON.parse(JSON.stringify(_state)) : null;
        }

        function getMotors() {
            return _state && Array.isArray(_state.motors) ? [..._state.motors] : [];
        }

        function getMotorById(id) {
            if (!_state || !Array.isArray(_state.motors)) return null;
            return _state.motors.find((m) => m.id === id) || null;
        }

        function getActiveMotor() {
            if (!_state || !_state.motors || _state.motors.length === 0) return null;
            let motor = _state.motors.find((m) => m.id === _state.activeMotorId);
            if (!motor) {
                motor = _state.motors[0];
                _state.activeMotorId = motor.id;
            }
            return motor;
        }

        function getFuelLogs(motorId) {
            if (!_state || !Array.isArray(_state.fuelLogs)) return [];
            if (!motorId) return [..._state.fuelLogs];
            return _state.fuelLogs.filter((f) => f.motorId === motorId);
        }

        function getServiceLogs(motorId) {
            if (!_state || !Array.isArray(_state.serviceLogs)) return [];
            if (!motorId) return [..._state.serviceLogs];
            return _state.serviceLogs.filter((s) => s.motorId === motorId);
        }

        function getChecklist(motorId) {
            if (!_state || !_state.checklistStates) return {};
            const mid = motorId || _state.activeMotorId || '';
            return _state.checklistStates[mid] || {};
        }

        function getNotificationSettings() {
            return _state && _state.notificationSettings ? Object.assign({}, _state.notificationSettings) : {};
        }

        function getTheme() {
            return _state ? _state.theme || 'dark' : 'dark';
        }

        // =========================================================================
        // ACTIONS
        // =========================================================================

        function setActiveMotor(motorId) {
            if (!_state) return;
            const found = _state.motors.find((m) => m.id === motorId);
            if (!found) return;

            _state.activeMotorId = motorId;
            _persist();
            if (_eventBus) {
                _eventBus.emit(_eventBus.EVENTS.MOTOR_SELECTED, { motor: found });
            }
            return found;
        }

        function addMotor(newMotor) {
            if (!_state || !newMotor) return;
            _state.motors.push(newMotor);
            _state.activeMotorId = newMotor.id;
            _persist();
            if (_eventBus) {
                _eventBus.emit(_eventBus.EVENTS.MOTOR_ADDED, { motor: newMotor });
            }
            return newMotor;
        }

        function deleteMotor(motorId) {
            if (!_state) return;
            _state.motors = _state.motors.filter((m) => m.id !== motorId);
            _state.fuelLogs = _state.fuelLogs.filter((f) => f.motorId !== motorId);
            _state.serviceLogs = _state.serviceLogs.filter((s) => s.motorId !== motorId);

            if (_state.activeMotorId === motorId) {
                _state.activeMotorId = _state.motors.length > 0 ? _state.motors[0].id : null;
            }
            _persist();
            if (_eventBus) {
                _eventBus.emit(_eventBus.EVENTS.MOTOR_DELETED, { motorId });
            }
        }

        function updateOdometer(newOdo, motorId) {
            if (!_state) return;
            const motor = motorId ? getMotorById(motorId) : getActiveMotor();
            if (!motor) return;

            motor.currentOdo = Number(newOdo) || 0;
            _persist();
            if (_eventBus) {
                _eventBus.emit(_eventBus.EVENTS.ODOMETER_UPDATED, { motor, newOdo: motor.currentOdo });
            }
            return motor;
        }

        function addFuelLog(log) {
            if (!_state || !log) return;
            _state.fuelLogs.push(log);
            const motor = getMotorById(log.motorId) || getActiveMotor();
            if (motor && log.odometer > (motor.currentOdo || 0)) {
                motor.currentOdo = log.odometer;
            }
            _persist();
            if (_eventBus) {
                _eventBus.emit(_eventBus.EVENTS.FUEL_ADDED, { log, motor });
            }
            return log;
        }

        function deleteFuelLog(id) {
            if (!_state) return;
            _state.fuelLogs = _state.fuelLogs.filter((f) => f.id !== id);
            _persist();
            if (_eventBus) {
                _eventBus.emit(_eventBus.EVENTS.FUEL_DELETED, { id, motor: getActiveMotor() });
            }
        }

        function addComponentReplacement(key, odo, date, serviceLog) {
            if (!_state) return;
            const motor = getActiveMotor();
            if (!motor) return;

            if (!motor.componentReplacedOdo) motor.componentReplacedOdo = {};
            if (!motor.componentReplacedDates) motor.componentReplacedDates = {};

            motor.componentReplacedOdo[key] = odo;
            motor.componentReplacedDates[key] = date;
            if (odo > (motor.currentOdo || 0)) motor.currentOdo = odo;

            if (serviceLog) {
                _state.serviceLogs.push(serviceLog);
            }
            _persist();
            if (_eventBus) {
                _eventBus.emit(_eventBus.EVENTS.COMPONENT_REPLACED, { key, odo, date, motor });
            }
        }

        function addServiceLog(log) {
            if (!_state || !log) return;
            _state.serviceLogs.push(log);
            const motor = getMotorById(log.motorId) || getActiveMotor();
            if (motor) {
                motor.lastServiceOdo = log.odometer;
                motor.lastServiceDate = log.date;
                if (log.odometer > (motor.currentOdo || 0)) {
                    motor.currentOdo = log.odometer;
                }
            }
            _persist();
            if (_eventBus) {
                _eventBus.emit(_eventBus.EVENTS.SERVICE_LOG_ADDED, { log, motor });
            }
            return log;
        }

        function setChecklistItem(motorId, key, checked) {
            if (!_state) return;
            const mid = motorId || _state.activeMotorId || '';
            if (!_state.checklistStates[mid]) _state.checklistStates[mid] = {};
            _state.checklistStates[mid][key] = !!checked;
            _persist();
            if (_eventBus) {
                _eventBus.emit(_eventBus.EVENTS.CHECKLIST_CHANGED, { motorId: mid, key, checked: !!checked });
            }
        }

        function resetChecklist(motorId) {
            if (!_state) return;
            const mid = motorId || _state.activeMotorId || '';
            _state.checklistStates[mid] = {};
            _persist();
            if (_eventBus) {
                _eventBus.emit(_eventBus.EVENTS.CHECKLIST_CHANGED, { motorId: mid, reset: true });
            }
        }

        function saveBaseline(motorId, odoMap) {
            if (!_state) return;
            const motor = motorId ? getMotorById(motorId) : getActiveMotor();
            if (!motor) return;
            if (!motor.componentReplacedOdo) motor.componentReplacedOdo = {};
            Object.assign(motor.componentReplacedOdo, odoMap);
            _persist();
            if (_eventBus) {
                _eventBus.emit(_eventBus.EVENTS.COMPONENT_REPLACED, { motor, baseline: true });
            }
        }

        function updateNotificationSettings(patch) {
            if (!_state) return;
            _state.notificationSettings = Object.assign({}, _state.notificationSettings, patch);
            _persist();
            if (_eventBus) {
                _eventBus.emit(_eventBus.EVENTS.NOTIFICATIONS_CHANGED, { settings: _state.notificationSettings });
            }
        }

        function setTheme(themeName) {
            if (!_state) return;
            _state.theme = themeName === 'light' ? 'light' : 'dark';
            _persist();
            if (_eventBus) {
                _eventBus.emit(_eventBus.EVENTS.THEME_CHANGED, { theme: _state.theme });
            }
            return _state.theme;
        }

        function resetAllData(defaultSettings) {
            _state = {
                motors: [],
                activeMotorId: null,
                fuelLogs: [],
                serviceLogs: [],
                checklistStates: {},
                notificationSettings: Object.assign({}, defaultSettings || {}),
                theme: 'dark'
            };
            _persist();
            if (_eventBus) {
                _eventBus.emit(_eventBus.EVENTS.DATA_RESET, { state: getState() });
            }
        }

        function replaceState(newState) {
            _state = Object.assign({}, newState);
            _persist();
            if (_eventBus) {
                _eventBus.emit(_eventBus.EVENTS.STATE_LOADED, { state: getState() });
            }
        }

        return {
            init,
            getState,
            getMotors,
            getMotorById,
            getActiveMotor,
            getFuelLogs,
            getServiceLogs,
            getChecklist,
            getNotificationSettings,
            getTheme,
            // Actions
            setActiveMotor,
            addMotor,
            deleteMotor,
            updateOdometer,
            addFuelLog,
            deleteFuelLog,
            addComponentReplacement,
            addServiceLog,
            setChecklistItem,
            resetChecklist,
            saveBaseline,
            updateNotificationSettings,
            setTheme,
            resetAllData,
            replaceState
        };
    });

    // =========================================================================
    // MODULE: notifications.js
    // =========================================================================
    /**
     * MotoCare v2.0 - System Notifications Module
     * Dispatches Android system notifications, checks overdue component limits and tax alerts.
     */
    (function (root, factory) {
        const exported = factory();
        if (typeof root !== 'undefined' && root) {
            root.MotoCare = root.MotoCare || {};
            root.MotoCare.Notifications = exported;
        }
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = exported;
        }
    })(typeof self !== 'undefined' ? self : typeof globalThis !== 'undefined' ? globalThis : this, function () {
        'use strict';

        let _store = null;
        let _eventBus = null;
        let _motoLogic = null;
        let _utils = null;

        function init(deps) {
            _store = deps && deps.Store;
            _eventBus = deps && deps.EventBus;
            _motoLogic = deps && deps.MotoLogic;
            _utils = deps && deps.Utils;

            if (_eventBus && _eventBus.EVENTS) {
                _eventBus.on(_eventBus.EVENTS.STATE_LOADED, checkAndSendNotifications);
                _eventBus.on(_eventBus.EVENTS.MOTOR_SELECTED, checkAndSendNotifications);
                _eventBus.on(_eventBus.EVENTS.ODOMETER_UPDATED, checkAndSendNotifications);
                _eventBus.on(_eventBus.EVENTS.COMPONENT_REPLACED, checkAndSendNotifications);
            }
        }

        function dispatchSystemNotification(title, message, isUrgent) {
            if (typeof window !== 'undefined' && window.Android) {
                if (typeof window.Android.showSystemNotification === 'function') {
                    window.Android.showSystemNotification(title, message, !!isUrgent);
                }
                if (isUrgent && typeof window.Android.scheduleDailyOverdueAlarm === 'function') {
                    window.Android.scheduleDailyOverdueAlarm(title, message, 1001);
                } else if (!isUrgent && typeof window.Android.schedulePeriodicReminder === 'function') {
                    window.Android.schedulePeriodicReminder(title, message, false);
                }
            } else {
                console.log('[Native Notification]', title, message, isUrgent ? '(URGENT)' : '');
            }
        }

        function checkAndSendNotifications() {
            if (!_store) return;
            const motor = _store.getActiveMotor();
            const settings = _store.getNotificationSettings();
            if (!motor || !settings.enabled) return;

            const today = new Date().toISOString().split('T')[0];
            const lastNotifs = Object.assign({}, settings.lastNotificationDates || {});
            let changed = false;

            // 1. Engine Oil Check
            const oilHealth =
                _motoLogic && typeof _motoLogic.getComponentHealth === 'function'
                    ? _motoLogic.getComponentHealth(motor, 'engineOil')
                    : null;

            if (oilHealth) {
                if (oilHealth.status === 'segera' && settings.overdueDailyAlerts) {
                    const key = motor.id + '-oil-overdue';
                    if (lastNotifs[key] !== today) {
                        dispatchSystemNotification(
                            '🚨 Peringatan Oli Mesin ' + (motor.nickname || motor.model),
                            'Oli mesin telah melewati batas aman (' +
                                Math.abs(oilHealth.remainingKm).toLocaleString('id-ID') +
                                ' KM lewat). Segera ganti oli!',
                            true
                        );
                        lastNotifs[key] = today;
                        changed = true;
                    }
                } else if (oilHealth.status === 'hampir' && settings.idealWindowAlerts) {
                    const key = motor.id + '-oil-ideal';
                    if (lastNotifs[key] !== today) {
                        dispatchSystemNotification(
                            '🛵 Persiapan Servis Oli Mesin',
                            'Sisa pemakaian oli ' +
                                oilHealth.remainingKm.toLocaleString('id-ID') +
                                ' KM lagi. Waktu ideal untuk persiapan ganti oli.',
                            false
                        );
                        lastNotifs[key] = today;
                        changed = true;
                    }
                }
            }

            // 2. Annual Tax Check
            if (motor.taxAnnualDate && settings.taxAlerts) {
                const days = Math.ceil((new Date(motor.taxAnnualDate) - new Date()) / (1000 * 60 * 60 * 24));
                if ([30, 14, 7, 3, 1, 0].includes(days)) {
                    const key = motor.id + '-tax-' + days;
                    if (lastNotifs[key] !== today) {
                        const title = days <= 0 ? '🚨 Pajak STNK Jatuh Tempo!' : '📋 Pengingat Pajak STNK H-' + days;
                        const msg =
                            days <= 0
                                ? 'Pajak STNK ' +
                                  (motor.nickname || motor.model) +
                                  ' jatuh tempo hari ini. Segera bayar di Samsat/Signal.'
                                : 'Pajak tahunan jatuh tempo dalam ' +
                                  days +
                                  ' hari lagi (' +
                                  motor.taxAnnualDate +
                                  ').';
                        dispatchSystemNotification(title, msg, days <= 0);
                        lastNotifs[key] = today;
                        changed = true;
                    }
                }
            }

            if (changed) {
                _store.updateNotificationSettings({ lastNotificationDates: lastNotifs });
            }
        }

        function sendTestNotification() {
            if (!_store) return;
            const motor = _store.getActiveMotor();
            const motorName = motor ? motor.nickname || motor.model : 'Sepeda Motor Anda';

            dispatchSystemNotification(
                '🛵 MotoCare Notifikasi Berhasil!',
                'Notifikasi layar aktif untuk ' + motorName + '. Pengingat jarak ideal & batas aman siap bekerja.',
                false
            );
            if (_utils && typeof _utils.showToast === 'function') {
                _utils.showToast('🔔 Notifikasi uji coba dikirim ke layar HP!');
            }
        }

        return {
            init,
            dispatchSystemNotification,
            checkAndSendNotifications,
            sendTestNotification
        };
    });

    // =========================================================================
    // MODULE: fuel.js
    // =========================================================================
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

    // =========================================================================
    // MODULE: service.js
    // =========================================================================
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
                            ? '<div class="text-xs" style="color:var(--text-primary);">' +
                              escapeHtml(s.notes) +
                              '</div>'
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

    // =========================================================================
    // MODULE: wizard.js
    // =========================================================================
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
                        if (selectedBrand === 'Custom / Lainnya')
                            return p.brand === 'Custom' || p.id === 'custom-motor';
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
            const modelName = isCustom
                ? customModelText || 'Sepeda Motor Kustom'
                : preset
                  ? preset.model
                  : 'Sepeda Motor';

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

    // =========================================================================
    // MODULE: camera.js
    // =========================================================================
    /**
     * MotoCare v2.0 - Live Camera Inspection Module
     * Manages mediaDevices getUserMedia video stream, camera flip, and snapshot preview.
     */
    (function (root, factory) {
        const exported = factory();
        if (typeof root !== 'undefined' && root) {
            root.MotoCare = root.MotoCare || {};
            root.MotoCare.Camera = exported;
        }
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = exported;
        }
    })(typeof self !== 'undefined' ? self : typeof globalThis !== 'undefined' ? globalThis : this, function () {
        'use strict';

        let _utils = null;
        let activeCameraStream = null;
        let cameraFacingMode = 'environment';

        function init(deps) {
            _utils = deps && deps.Utils;
            initListeners();
        }

        function open() {
            if (_utils) _utils.openModal('modal-camera');
            startStream();
        }

        function close() {
            stopStream();
            if (_utils) _utils.closeModal('modal-camera');
        }

        function startStream() {
            const video = document.getElementById('camera-stream');
            if (!video || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                if (_utils) _utils.showToast('⚠️ Kamera tidak didukung di perangkat ini.');
                return;
            }

            stopStream();

            const constraints = {
                video: { facingMode: cameraFacingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false
            };

            navigator.mediaDevices
                .getUserMedia(constraints)
                .then((stream) => {
                    activeCameraStream = stream;
                    video.srcObject = stream;
                    video.play();
                })
                .catch((err) => {
                    console.error('Camera access error:', err);
                    if (_utils) _utils.showToast('⚠️ Gagal mengakses kamera: ' + (err.message || 'Izin ditolak'));
                });
        }

        function stopStream() {
            if (activeCameraStream) {
                activeCameraStream.getTracks().forEach((t) => t.stop());
                activeCameraStream = null;
            }
            const video = document.getElementById('camera-stream');
            if (video) video.srcObject = null;
        }

        function flip() {
            cameraFacingMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
            startStream();
            if (_utils) _utils.showToast('Membalik kamera...');
        }

        function snap() {
            const video = document.getElementById('camera-stream');
            const canvas = document.getElementById('camera-canvas');
            if (!video || !canvas) return;

            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            if (_utils) _utils.showToast('📸 Foto pemeriksaan fisik tertangkap!');
            if (typeof window !== 'undefined' && window.Android && window.Android.vibrate) {
                window.Android.vibrate(50);
            }
        }

        function initListeners() {
            const btnOpenCamera = document.getElementById('btn-open-camera');
            if (btnOpenCamera) btnOpenCamera.addEventListener('click', open);

            const btnCameraClose = document.getElementById('btn-modal-camera-close');
            if (btnCameraClose) btnCameraClose.addEventListener('click', close);

            const btnCameraFlip = document.getElementById('btn-camera-flip');
            if (btnCameraFlip) btnCameraFlip.addEventListener('click', flip);

            const btnCameraSnap = document.getElementById('btn-camera-snap');
            if (btnCameraSnap) btnCameraSnap.addEventListener('click', snap);
        }

        return {
            init,
            open,
            close,
            startStream,
            stopStream,
            flip,
            snap,
            initListeners
        };
    });

    // =========================================================================
    // MODULE: gemini.js
    // =========================================================================
    /**
     * MotoCare v2.0 - Gemini AI Diagnostic Assistant Module
     * Generates motorcycle symptom prompts, enforces user privacy opt-in (no PII),
     * provides offline troubleshooting fallback, and safely sanitizes AI responses.
     */
    (function (root, factory) {
        const exported = factory();
        if (typeof root !== 'undefined' && root) {
            root.MotoCare = root.MotoCare || {};
            root.MotoCare.Gemini = exported;
        }
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = exported;
        }
    })(typeof self !== 'undefined' ? self : typeof globalThis !== 'undefined' ? globalThis : this, function () {
        'use strict';

        let _store = null;
        let _utils = null;
        let currentGeminiSymptom = 'cvt';
        let includeMotorData = true;
        let lastQueryTimestamp = 0;
        const RATE_LIMIT_COOLDOWN_MS = 10000; // 10 seconds client-side throttle

        const OFFLINE_DIAGNOSTIC_TIPS = Object.freeze({
            cvt: [
                'Pembersihan CVT: Gredek getar di rpm rendah umumnya disebabkan penumpukan debu kampas ganda pada tromol mangkok kopling.',
                'Pemeriksaan Roller: Cek apakah permukaan 6 butir roller sudah termakan / aus tidak bulat merata.',
                'V-Belt: Periksa apakah sisi dalam karet v-belt sudah pecah-pecah atau melar melewati batas limit jarak.'
            ],
            lelet: [
                'Busi: Buka dan periksa elektroda busi. Jika hitam pekat berkerak, bersihkan atau ganti baru.',
                'Filter Udara: Cek filter udara. Jika filter jenis kering berviskositas oli sudah kotor pekat, segera ganti (jangan dicuci bensin).',
                'Tekanan Angin Ban: Pastikan tekanan ban depan (~29 psi) dan belakang (~33 psi) tidak kempis.'
            ],
            rem: [
                'Ketebalan Kampas Rem: Intip sisa kampas rem. Jika kurang dari 1.5 mm, segera ganti agar piringan cakram tidak tergores.',
                'Minyak Rem: Periksa kaca intip master rem. Jika warna minyak rem sudah cokelat gelap atau di bawah garis lower, segera kuras.',
                'Kotoran Kaliper: Semprot area kaliper dengan brake cleaner untuk membuang partikel pasir yang memicu bunyi decit.'
            ],
            asap: [
                'Level Oli Mesin: SEGERA cabut dipstick oli! Jika volume oli di bawah garis batas bawah, jangan paksa nyalakan mesin.',
                'Ring Piston & Boring: Asap putih tebal saat gas tinggi mengindikasikan oli terbakar di ruang bakar akibat ring piston aus.',
                'Sil Klep: Asap putih saat starter pagi hari menandakan sil klep getas sehingga oli merembes ke payung klep.'
            ],
            second: [
                'Rangka & Segitiga: Lepas stang saat kecepatan rendah di jalan lurus sepi untuk memastikan stang tidak membuang ke samping.',
                'Suara Rantai Keteng: Dengarkan sisi kiri mesin; suara gemericik menandakan tensioner atau rantai keteng aus.',
                'Kebocoran Paking: Periksa bagian bawah bak mesin dan sambungan blok silinder dari rembesan oli basah.'
            ]
        });

        function init(deps) {
            _store = deps && deps.Store;
            _utils = deps && deps.Utils;
            initListeners();
        }

        function open() {
            checkConnectivity();
            updatePromptPreview();
            if (_utils) _utils.openModal('modal-gemini');
        }

        function close() {
            if (_utils) _utils.closeModal('modal-gemini');
        }

        function checkConnectivity() {
            const isOnline = typeof navigator !== 'undefined' ? navigator.onLine !== false : true;
            const banner = document.getElementById('gemini-offline-banner');
            const tipsContainer = document.getElementById('gemini-offline-tips');

            if (banner) banner.style.display = isOnline ? 'none' : 'block';
            if (tipsContainer) {
                tipsContainer.style.display = isOnline ? 'none' : 'block';
                if (!isOnline) {
                    renderOfflineTips(tipsContainer);
                }
            }
        }

        function renderOfflineTips(container) {
            const tips = OFFLINE_DIAGNOSTIC_TIPS[currentGeminiSymptom] || [];
            const escapeHtml = _utils ? _utils.escapeHtml : (s) => s;
            let html =
                '<div class="font-bold mb-4" style="color:var(--accent-primary);">📋 Panduan Pengecekan Cepat (Offline):</div>';
            html += '<ul style="margin:0; padding-left:18px; color:var(--text-secondary); line-height:1.4;">';
            tips.forEach((tip) => {
                html += '<li class="mb-4">' + escapeHtml(tip) + '</li>';
            });
            html += '</ul>';
            container.innerHTML = html;
        }

        function buildPrompt(symptomKey, motor, withConsent) {
            let symptomText = '';
            switch (symptomKey) {
                case 'cvt':
                    symptomText =
                        'Terdengar bunyi getar / gredek kasar pada area CVT transmisi otomatis saat akselerasi awal (0 - 30 km/jam).';
                    break;
                case 'lelet':
                    symptomText =
                        'Tarikan mesin terasa berat, loyo di tanjakan, dan konsumsi bensin terasa lebih boros dari biasanya.';
                    break;
                case 'rem':
                    symptomText =
                        'Rem depan/belakang berdecit keras saat ditekan dan tuas rem terasa ambles/kurang pakem.';
                    break;
                case 'asap':
                    symptomText =
                        'Knalpot mengeluarkan sedikit asap putih/abu-abu saat digas tinggi dan volume oli mesin berkurang drastis.';
                    break;
                case 'second':
                    symptomText =
                        'Motor ini dibeli dalam kondisi second/bekas. Saya butuh panduan pemeriksaan menyeluruh komponen yang rawan rusak pada tipe motor ini.';
                    break;
                default:
                    symptomText = 'Pemeriksaan performa dan kondisi umum mesin motor.';
            }

            let motorHeader = '';
            if (withConsent && motor) {
                // Strictly exclude plateNumber and personal notes (No PII)
                const motorName = motor.model || motor.nickname || 'Sepeda Motor Roda Dua';
                const motorYear = motor.year || '-';
                const motorOdo = (Number(motor.currentOdo) || 0).toLocaleString('id-ID') + ' KM';

                motorHeader =
                    '• Motor: ' +
                    motorName +
                    ' (Tahun ' +
                    motorYear +
                    ')\n' +
                    '• Odometer saat ini: ' +
                    motorOdo +
                    '\n';
            } else {
                motorHeader = '• Tipe Kendaraan: Sepeda Motor Roda Dua Indonesia\n';
            }

            return (
                'Halo Google Gemini, tolong bantu analisa masalah teknis pada sepeda motor saya:\n' +
                motorHeader +
                '• Gejala kendala: ' +
                symptomText +
                '\n\n' +
                'Pertanyaan untuk analisa:\n' +
                '1. Apa akar penyebab yang paling sering memicu masalah tersebut?\n' +
                '2. Komponen spesifik mana saja yang harus diperiksa atau diganti di bengkel?\n' +
                '3. Apakah motor masih aman dipakai harian atau berisiko mogok/rusak parah?\n' +
                '4. Berapa perkiraan kisaran biaya servis atau harga suku cadang tersebut di Indonesia?'
            );
        }

        function updatePromptPreview() {
            const motor = _store ? _store.getActiveMotor() : null;
            const preview = document.getElementById('gemini-prompt-preview');
            const optinCheckbox = document.getElementById('gemini-optin-motor-data');

            if (optinCheckbox) {
                includeMotorData = optinCheckbox.checked;
            }

            const prompt = buildPrompt(currentGeminiSymptom, motor, includeMotorData);
            if (preview) {
                preview.value = prompt;
            }
        }

        function sanitizeAiOutput(rawText) {
            if (!rawText || typeof rawText !== 'string') return '';

            // Step 1: Escape raw HTML entities completely
            const escapeHtml = _utils
                ? _utils.escapeHtml
                : (str) => {
                      return String(str).replace(
                          /[&<>"']/g,
                          (c) =>
                              ({
                                  '&': '&amp;',
                                  '<': '&lt;',
                                  '>': '&gt;',
                                  '"': '&quot;',
                                  "'": '&#39;'
                              })[c]
                      );
                  };

            const escaped = escapeHtml(rawText);

            // Step 2: Safe Markdown transformation (bold and list items)
            const lines = escaped.split('\n');
            let inList = false;
            let result = [];

            for (let i = 0; i < lines.length; i++) {
                let line = lines[i].trim();
                if (!line) {
                    if (inList) {
                        result.push('</ul>');
                        inList = false;
                    }
                    result.push('<br/>');
                    continue;
                }

                // Bold: **text** -> <strong>text</strong>
                line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

                // List items: * or - or numbers
                if (/^[-*]\s+/.test(line)) {
                    if (!inList) {
                        result.push('<ul style="margin:4px 0; padding-left:20px;">');
                        inList = true;
                    }
                    const content = line.replace(/^[-*]\s+/, '');
                    result.push('<li>' + content + '</li>');
                } else if (/^\d+\.\s+/.test(line)) {
                    if (!inList) {
                        result.push('<ol style="margin:4px 0; padding-left:20px;">');
                        inList = true;
                    }
                    const content = line.replace(/^\d+\.\s+/, '');
                    result.push('<li>' + content + '</li>');
                } else {
                    if (inList) {
                        result.push('</ul>');
                        inList = false;
                    }
                    result.push('<p class="mb-4" style="margin:4px 0;">' + line + '</p>');
                }
            }

            if (inList) {
                result.push('</ul>');
            }

            return result.join('');
        }

        function copyPrompt() {
            const preview = document.getElementById('gemini-prompt-preview');
            if (!preview) return;
            const text = preview.value;
            if (_utils && typeof _utils.copyToClipboard === 'function') {
                _utils.copyToClipboard(text).then(() => {
                    if (_utils.showToast) _utils.showToast('📋 Prompt disalin ke clipboard!');
                });
            }
        }

        function launch() {
            const preview = document.getElementById('gemini-prompt-preview');
            const prompt = preview ? preview.value : '';

            copyPrompt();

            if (typeof window !== 'undefined' && window.Android && window.Android.openGeminiWithPrompt) {
                window.Android.openGeminiWithPrompt(prompt);
            } else {
                const encoded = encodeURIComponent(prompt);
                window.open('https://gemini.google.com/app?q=' + encoded, '_blank');
            }
        }

        async function askDiagnosticApi(proxyUrl) {
            const isOnline = typeof navigator !== 'undefined' ? navigator.onLine !== false : true;
            if (!isOnline) {
                if (_utils && _utils.showToast) _utils.showToast('⚠️ Tidak dapat menghubungi AI saat offline.');
                checkConnectivity();
                return;
            }

            const now = Date.now();
            if (now - lastQueryTimestamp < RATE_LIMIT_COOLDOWN_MS) {
                const waitSeconds = Math.ceil((RATE_LIMIT_COOLDOWN_MS - (now - lastQueryTimestamp)) / 1000);
                if (_utils && _utils.showToast) {
                    _utils.showToast(`⏳ Mohon tunggu ${waitSeconds} detik sebelum meminta analisa baru.`);
                }
                return;
            }

            const preview = document.getElementById('gemini-prompt-preview');
            const prompt = preview ? preview.value : '';
            if (!prompt) return;

            const container = document.getElementById('gemini-response-container');
            const textEl = document.getElementById('gemini-response-text');
            const statusEl = document.getElementById('gemini-status-indicator');

            if (container) container.style.display = 'block';
            if (statusEl) statusEl.textContent = 'Sedang menganalisa... ⏳';
            if (textEl) textEl.innerHTML = '<em>Mengirim pertanyaan ke asisten Gemini AI melalui proxy aman...</em>';

            lastQueryTimestamp = now;

            try {
                const endpoint = proxyUrl || '/api/gemini-diagnostic';
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt, symptom: currentGeminiSymptom })
                });

                if (!response.ok) {
                    throw new Error(`Server proxy mengembalikan kode status ${response.status}`);
                }

                const data = await response.json();
                const replyText = data.reply || data.text || 'Tidak ada teks diagnosa yang diterima.';

                if (statusEl) statusEl.textContent = 'Selesai ✅';
                if (textEl) {
                    textEl.innerHTML = sanitizeAiOutput(replyText);
                }
            } catch (err) {
                console.error('[Gemini API Proxy Error]', err);
                if (statusEl) statusEl.textContent = 'Gagal ❌';
                if (textEl) {
                    textEl.innerHTML =
                        '<span style="color:var(--status-danger);">⚠️ Gagal terhubung ke proxy backend: ' +
                        (_utils ? _utils.escapeHtml(err.message) : err.message) +
                        '. Silakan gunakan tombol <strong>"Buka Gemini"</strong> untuk membuka langsung web Gemini.</span>';
                }
            }
        }

        function initListeners() {
            const btnOpenGemini = document.getElementById('btn-open-gemini');
            if (btnOpenGemini) btnOpenGemini.addEventListener('click', open);

            const btnGeminiClose = document.getElementById('btn-modal-gemini-close');
            if (btnGeminiClose) btnGeminiClose.addEventListener('click', close);

            const btnGeminiCopy = document.getElementById('btn-gemini-copy');
            if (btnGeminiCopy) btnGeminiCopy.addEventListener('click', copyPrompt);

            const btnGeminiLaunch = document.getElementById('btn-gemini-launch');
            if (btnGeminiLaunch) btnGeminiLaunch.addEventListener('click', launch);

            const btnGeminiAskApi = document.getElementById('btn-gemini-ask-api');
            if (btnGeminiAskApi) {
                btnGeminiAskApi.addEventListener('click', () => askDiagnosticApi());
            }

            const optinCheckbox = document.getElementById('gemini-optin-motor-data');
            if (optinCheckbox) {
                optinCheckbox.addEventListener('change', () => {
                    includeMotorData = optinCheckbox.checked;
                    updatePromptPreview();
                });
            }

            document.querySelectorAll('.gemini-chip').forEach((chip) => {
                chip.addEventListener('click', function () {
                    document.querySelectorAll('.gemini-chip').forEach((c) => {
                        c.classList.remove('active');
                        c.setAttribute('aria-pressed', 'false');
                    });
                    this.classList.add('active');
                    this.setAttribute('aria-pressed', 'true');
                    currentGeminiSymptom = this.getAttribute('data-symptom');
                    updatePromptPreview();
                    checkConnectivity();
                });
            });

            if (typeof window !== 'undefined') {
                window.addEventListener('online', checkConnectivity);
                window.addEventListener('offline', checkConnectivity);
            }
        }

        return {
            init,
            open,
            close,
            buildPrompt,
            sanitizeAiOutput,
            updatePromptPreview,
            copyPrompt,
            launch,
            askDiagnosticApi,
            checkConnectivity,
            OFFLINE_DIAGNOSTIC_TIPS,
            initListeners
        };
    });

    // =========================================================================
    // MODULE: render.js
    // =========================================================================
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
                        desc:
                            'Sudah lebih ' + Math.abs(h.remainingKm).toLocaleString('id-ID') + ' KM dari batas servis.'
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

    // =========================================================================
    // MODULE: app.js
    // =========================================================================
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
                    if (
                        typeof window !== 'undefined' &&
                        window.Android &&
                        typeof window.Android.shareText === 'function'
                    ) {
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
                        dl.setAttribute(
                            'download',
                            'motocare_backup_' + new Date().toISOString().split('T')[0] + '.json'
                        );
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
                            const Camera =
                                typeof window !== 'undefined' && window.MotoCare ? window.MotoCare.Camera : null;
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

    // =========================================================================
    // EXPOSE BACKWARD-COMPATIBLE HELPERS & COMMONJS EXPORTS
    // =========================================================================
    const MotoCare = root.MotoCare || {};
    const Utils = MotoCare.Utils || {};
    const Storage = MotoCare.Storage || {};
    const Store = MotoCare.Store || {};
    const EventBus = MotoCare.EventBus || {};

    if (typeof window !== 'undefined') {
        window.escapeHtml = Utils.escapeHtml;
        window.StorageManager = Storage.StorageManager;
        window.applyMigrations = Storage.applyMigrations;
        window.validateImportStructure = Storage.validateImportStructure;
        window.CURRENT_SCHEMA_VERSION = Storage.CURRENT_SCHEMA_VERSION;
        window.DEFAULT_SETTINGS = Storage.DEFAULT_SETTINGS;
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            escapeHtml: Utils.escapeHtml,
            StorageManager: Storage.StorageManager,
            applyMigrations: Storage.applyMigrations,
            validateImportStructure: Storage.validateImportStructure,
            CURRENT_SCHEMA_VERSION: Storage.CURRENT_SCHEMA_VERSION,
            DEFAULT_SETTINGS: Storage.DEFAULT_SETTINGS,
            MotoCare,
            Store,
            EventBus,
            Storage,
            Utils
        };
    }

    // =========================================================================
    // DOM READY AUTO-START
    // =========================================================================
    if (typeof document !== 'undefined') {
        function boot() {
            if (root.MotoCare && root.MotoCare.App && typeof root.MotoCare.App.init === 'function') {
                root.MotoCare.App.init();
            }
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', boot);
        } else {
            boot();
        }
    }
})(
    typeof self !== 'undefined'
        ? self
        : typeof window !== 'undefined'
          ? window
          : typeof globalThis !== 'undefined'
            ? globalThis
            : this
);
