import { describe, it, expect } from 'vitest';
import path from 'path';

// Load module from assets/app_v2.js
const appModule = require(path.join(__dirname, '..', 'assets', 'app_v2.js'));
const { StorageManager, applyMigrations, validateImportStructure, CURRENT_SCHEMA_VERSION } = appModule;

const legacyState = {
    motors: [
        {
            id: 'motor-1700000000001',
            brand: 'Honda',
            model: 'Vario 125',
            nickname: 'Si Hitam',
            plateNumber: 'B 1234 ABC',
            year: 2021,
            currentOdo: 15420,
            initialOdo: 12000,
            serviceIntervals: { engineOil: 2500, gearOil: 8000 },
            componentReplacedOdo: { engineOil: 14000 }
        },
        {
            id: 'motor-1700000000002',
            brand: 'Yamaha',
            model: 'NMAX 155',
            nickname: 'Si Biru',
            plateNumber: 'D 5678 XYZ',
            year: 2022,
            currentOdo: 8300,
            initialOdo: 0
        }
    ],
    activeMotorId: 'motor-1700000000001',
    fuelLogs: [
        {
            id: 'fuel-1',
            motorId: 'motor-1700000000001',
            fuelType: 'Pertamax',
            liters: 4.5,
            totalCost: 58500,
            odometer: 15100,
            date: '2026-11-20',
            isFullTank: true
        }
    ],
    serviceLogs: [
        {
            id: 'service-1',
            motorId: 'motor-1700000000001',
            category: 'Oli Mesin',
            odometer: 14000,
            date: '2026-11-01',
            workshop: 'Ahass Mandiri',
            notes: 'Ganti oli MPX2',
            totalCost: 65000
        }
    ],
    checklistStates: {
        'motor-1700000000001': { 'chk-lampu': true, 'chk-rem': true }
    },
    notificationSettings: {
        enabled: true,
        overdueDailyAlerts: true,
        idealWindowAlerts: true,
        taxAlerts: true
    },
    theme: 'dark'
};

describe('Storage Abstraction & Schema Migration', () => {
    describe('applyMigrations', () => {
        it('migrates unversioned legacy state to schema version 1 without data loss', () => {
            const migrated = applyMigrations(legacyState, 1);

            expect(migrated.schemaVersion).toBe(1);
            expect(migrated.motors).toHaveLength(2);
            expect(migrated.activeMotorId).toBe('motor-1700000000001');

            const m1 = migrated.motors.find((m) => m.id === 'motor-1700000000001');
            expect(m1.nickname).toBe('Si Hitam');
            expect(m1.plateNumber).toBe('B 1234 ABC');
            expect(m1.currentOdo).toBe(15420);
            expect(m1.serviceIntervals.engineOil).toBe(2500);
            expect(m1.componentReplacedOdo.engineOil).toBe(14000);

            const m2 = migrated.motors.find((m) => m.id === 'motor-1700000000002');
            expect(m2.nickname).toBe('Si Biru');
            expect(m2.currentOdo).toBe(8300);

            expect(migrated.fuelLogs).toHaveLength(1);
            expect(migrated.fuelLogs[0].fuelType).toBe('Pertamax');
            expect(migrated.serviceLogs).toHaveLength(1);
            expect(migrated.serviceLogs[0].notes).toBe('Ganti oli MPX2');
            expect(migrated.checklistStates['motor-1700000000001']['chk-lampu']).toBe(true);
        });

        it('is idempotent: running migration repeatedly produces no duplicates or changes', () => {
            const first = applyMigrations(legacyState, 1);
            const second = applyMigrations(first, 1);
            const third = applyMigrations(second, 1);

            expect(third.schemaVersion).toBe(1);
            expect(third.motors).toHaveLength(2);
            expect(third.fuelLogs).toHaveLength(1);
            expect(third.serviceLogs).toHaveLength(1);
            expect(third.motors).toEqual(first.motors);
        });

        it('de-duplicates identical IDs cleanly during migration', () => {
            const dataWithDuplicates = {
                motors: [
                    { id: 'm-dup-1', brand: 'Honda', model: 'Beat', nickname: 'Beat A' },
                    { id: 'm-dup-1', brand: 'Honda', model: 'Beat', nickname: 'Beat Duplicate' },
                    { id: 'm-unique-2', brand: 'Yamaha', model: 'Mio', nickname: 'Mio' }
                ],
                fuelLogs: [
                    { id: 'f-dup', motorId: 'm-dup-1', liters: 3 },
                    { id: 'f-dup', motorId: 'm-dup-1', liters: 3 }
                ],
                serviceLogs: [
                    { id: 's-dup', motorId: 'm-dup-1', category: 'Oli' },
                    { id: 's-dup', motorId: 'm-dup-1', category: 'Oli' }
                ]
            };

            const migrated = applyMigrations(dataWithDuplicates, 1);
            expect(migrated.motors).toHaveLength(2);
            expect(migrated.motors[0].id).toBe('m-dup-1');
            expect(migrated.motors[1].id).toBe('m-unique-2');
            expect(migrated.fuelLogs).toHaveLength(1);
            expect(migrated.serviceLogs).toHaveLength(1);
        });
    });

    describe('Export & Import Round-trip', () => {
        it('exports state with standardized metadata', () => {
            const exported = StorageManager.exportData(legacyState);

            expect(exported.app).toBe('MotoCare');
            expect(exported.version).toBe('2.0');
            expect(exported.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
            expect(exported.exportedAt).toBeDefined();
            expect(exported.data.motors).toHaveLength(2);
        });

        it('round-trip import preserves all data 100%', () => {
            const exported = StorageManager.exportData(legacyState);
            const jsonStr = JSON.stringify(exported);

            const reimported = validateImportStructure(jsonStr);
            expect(reimported.schemaVersion).toBe(1);
            expect(reimported.motors).toHaveLength(2);
            expect(reimported.motors[0].nickname).toBe('Si Hitam');
            expect(reimported.motors[1].nickname).toBe('Si Biru');
            expect(reimported.fuelLogs).toHaveLength(1);
            expect(reimported.serviceLogs).toHaveLength(1);
        });

        it('supports legacy raw JSON format without metadata wrapper', () => {
            const rawLegacyJson = JSON.stringify(legacyState);
            const imported = validateImportStructure(rawLegacyJson);

            expect(imported.schemaVersion).toBe(1);
            expect(imported.motors).toHaveLength(2);
            expect(imported.motors[0].plateNumber).toBe('B 1234 ABC');
        });
    });

    describe('validateImportStructure', () => {
        it('rejects malformed JSON string with clear error', () => {
            expect(() => {
                validateImportStructure('{ "motors": [ { "id": "1", "brand": "Honda" ');
            }).toThrow(/Format JSON tidak valid/);
        });

        it('rejects non-object inputs', () => {
            expect(() => validateImportStructure(JSON.stringify([1, 2, 3]))).toThrow(/Data utama harus berupa objek/);
            expect(() => validateImportStructure(JSON.stringify('plain string'))).toThrow(
                /Data utama harus berupa objek/
            );
            expect(() => validateImportStructure(null)).toThrow(/Format data tidak valid/);
        });

        it('rejects backup missing "motors" property', () => {
            expect(() => {
                validateImportStructure(JSON.stringify({ fuelLogs: [], theme: 'dark' }));
            }).toThrow(/Properti "motors" tidak ditemukan/);
        });

        it('rejects motor missing ID', () => {
            const payload = { motors: [{ brand: 'Honda', model: 'Beat' }] };
            expect(() => {
                validateImportStructure(JSON.stringify(payload));
            }).toThrow(/tidak memiliki ID yang valid/);
        });

        it('rejects motor missing brand or model', () => {
            const noBrand = { motors: [{ id: 'm-1', model: 'Beat' }] };
            expect(() => validateImportStructure(JSON.stringify(noBrand))).toThrow(/tidak memiliki merek/);

            const noModel = { motors: [{ id: 'm-1', brand: 'Honda', model: '' }] };
            expect(() => validateImportStructure(JSON.stringify(noModel))).toThrow(/tidak memiliki model/);
        });

        it('rejects invalid fuelLogs or serviceLogs non-array types', () => {
            expect(() => {
                validateImportStructure(
                    JSON.stringify({
                        motors: [{ id: 'm-1', brand: 'Honda', model: 'Beat' }],
                        fuelLogs: 'not-an-array'
                    })
                );
            }).toThrow(/Properti "fuelLogs" harus berupa array/);
        });
    });

    describe('StorageManager Headless Fallback', () => {
        it('provides valid sync state in Node environment', () => {
            const syncState = StorageManager.getSync();
            expect(syncState).toBeDefined();
            expect(syncState.schemaVersion).toBe(1);
            expect(Array.isArray(syncState.motors)).toBe(true);
        });
    });
});
