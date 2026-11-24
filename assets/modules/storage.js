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
                    if (motor.lastServiceOdo === undefined || motor.lastServiceOdo === null) motor.lastServiceOdo = odo;
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
            payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data) ? payload.data : payload;

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
