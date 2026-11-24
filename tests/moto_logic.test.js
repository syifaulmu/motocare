import { describe, it, expect } from 'vitest';
import MotoLogic from '../assets/moto_logic.js';

describe('MotoLogic - Pure Calculation & Business Logic', () => {
    describe('calculateFuelStats (km/L & Fuel Consumption)', () => {
        it('returns zero defaults for empty, null, or non-array inputs', () => {
            expect(MotoLogic.calculateFuelStats([])).toEqual({
                totalLiters: 0,
                totalCost: 0,
                avgKml: null,
                logCount: 0
            });
            expect(MotoLogic.calculateFuelStats(null)).toEqual({
                totalLiters: 0,
                totalCost: 0,
                avgKml: null,
                logCount: 0
            });
            expect(MotoLogic.calculateFuelStats(undefined)).toEqual({
                totalLiters: 0,
                totalCost: 0,
                avgKml: null,
                logCount: 0
            });
            expect(MotoLogic.calculateFuelStats('invalid')).toEqual({
                totalLiters: 0,
                totalCost: 0,
                avgKml: null,
                logCount: 0
            });
        });

        it('returns null avgKml when only one full-tank log exists', () => {
            const logs = [{ odometer: 1000, liters: 4.0, totalCost: 52000, isFullTank: true }];
            const stats = MotoLogic.calculateFuelStats(logs);
            expect(stats.totalLiters).toBe(4.0);
            expect(stats.totalCost).toBe(52000);
            expect(stats.avgKml).toBeNull();
            expect(stats.logCount).toBe(1);
        });

        it('calculates accurate full-to-full average km/L across multiple entries', () => {
            const logs = [
                { odometer: 1000, liters: 4.0, totalCost: 52000, isFullTank: true },
                { odometer: 1200, liters: 4.0, totalCost: 52000, isFullTank: true }, // 200 km / 4.0 L = 50.0 km/L
                { odometer: 1420, liters: 4.4, totalCost: 57200, isFullTank: true } // 220 km / 4.4 L = 50.0 km/L (Total: 420 km / 8.4 L = 50.0 km/L)
            ];
            const stats = MotoLogic.calculateFuelStats(logs);
            expect(stats.totalLiters).toBe(12.4);
            expect(stats.totalCost).toBe(161200);
            expect(stats.avgKml).toBe(50.0);
            expect(stats.logCount).toBe(3);
        });

        it('ignores non-full tank logs during distance/efficiency calculations', () => {
            const logs = [
                { odometer: 1000, liters: 4.0, totalCost: 50000, isFullTank: true },
                { odometer: 1100, liters: 2.0, totalCost: 25000, isFullTank: false }, // partial, not full
                { odometer: 1250, liters: 5.0, totalCost: 65000, isFullTank: true } // 250 km / 5.0 L = 50.0 km/L
            ];
            const stats = MotoLogic.calculateFuelStats(logs);
            expect(stats.totalLiters).toBe(11.0);
            expect(stats.avgKml).toBe(50.0);
        });

        it('handles out-of-order odometer entries by sorting them ascendingly', () => {
            const logs = [
                { odometer: 1300, liters: 4.0, totalCost: 50000, isFullTank: true },
                { odometer: 1000, liters: 4.0, totalCost: 50000, isFullTank: true },
                { odometer: 1600, liters: 6.0, totalCost: 75000, isFullTank: true }
            ];
            const stats = MotoLogic.calculateFuelStats(logs);
            // distance: (1300 - 1000) = 300km (4L), (1600 - 1300) = 300km (6L) -> total 600km / 10L = 60.0 km/L
            expect(stats.avgKml).toBe(60.0);
        });

        it('safely handles zero distance, negative deltas, or invalid odometer values without NaN', () => {
            const logsZeroDist = [
                { odometer: 1000, liters: 4.0, totalCost: 50000, isFullTank: true },
                { odometer: 1000, liters: 4.0, totalCost: 50000, isFullTank: true } // 0 dist
            ];
            expect(MotoLogic.calculateFuelStats(logsZeroDist).avgKml).toBeNull();

            const logsInvalid = [
                { odometer: 'invalid', liters: 'none', totalCost: 50000, isFullTank: true },
                { odometer: null, liters: 4.0, totalCost: 50000, isFullTank: true }
            ];
            expect(MotoLogic.calculateFuelStats(logsInvalid).avgKml).toBeNull();
        });
    });

    describe('calculateBbmTotal', () => {
        it('calculates rounded total price correctly', () => {
            expect(MotoLogic.calculateBbmTotal(3.5, 10000)).toBe(35000);
            expect(MotoLogic.calculateBbmTotal(3.333, 13700)).toBe(45662);
        });

        it('returns 0 for negative, zero, or non-numeric inputs', () => {
            expect(MotoLogic.calculateBbmTotal(-3.5, 10000)).toBe(0);
            expect(MotoLogic.calculateBbmTotal(3.5, -10000)).toBe(0);
            expect(MotoLogic.calculateBbmTotal(0, 10000)).toBe(0);
            expect(MotoLogic.calculateBbmTotal('abc', 10000)).toBe(0);
            expect(MotoLogic.calculateBbmTotal(null, undefined)).toBe(0);
        });
    });

    describe('getComponentHealth & Service Intervals', () => {
        const sampleMotor = {
            id: 'm-1',
            presetId: 'beat-esp',
            currentOdo: 12000,
            serviceIntervals: { engineOil: 2500, vBelt: 24000 },
            componentReplacedOdo: { engineOil: 10000, vBelt: 0 }
        };

        it('returns AMAN status when component has plenty of distance remaining', () => {
            // interval: 2500, last: 10000 -> next: 12500. current: 12000 -> remaining: 500 km (> noticeWindow 375 km)
            const health = MotoLogic.getComponentHealth(sampleMotor, 'engineOil');
            expect(health.status).toBe('aman');
            expect(health.statusText).toBe('AMAN');
            expect(health.remainingKm).toBe(500);
            expect(health.isEstimated).toBe(false);
            expect(health.percent).toBe(80); // (2000 / 2500) * 100
        });

        it('returns HAMPIR status when remaining distance falls within notice window', () => {
            const motorNear = { ...sampleMotor, currentOdo: 12200 };
            // remaining: 300 km <= notice window 375 km
            const health = MotoLogic.getComponentHealth(motorNear, 'engineOil');
            expect(health.status).toBe('hampir');
            expect(health.statusText).toBe('HAMPIR');
            expect(health.remainingKm).toBe(300);
        });

        it('returns SEGERA status when component is overdue', () => {
            const motorOverdue = { ...sampleMotor, currentOdo: 13000 };
            // remaining: -500 km
            const health = MotoLogic.getComponentHealth(motorOverdue, 'engineOil');
            expect(health.status).toBe('segera');
            expect(health.statusText).toBe('SEGERA');
            expect(health.remainingKm).toBe(-500);
            expect(health.percent).toBe(100);
        });

        it('uses intelligent cycle estimation when replacement history is missing', () => {
            const motorSecond = {
                id: 'm-second',
                currentOdo: 15420,
                serviceIntervals: { engineOil: 2500 },
                componentReplacedOdo: {} // no replacement history
            };
            // 15420 / 2500 = 6 completed cycles -> lastReplaced = 15000. next = 17500. remaining = 2080 km
            const health = MotoLogic.getComponentHealth(motorSecond, 'engineOil');
            expect(health.isEstimated).toBe(true);
            expect(health.lastReplaced).toBe(15000);
            expect(health.nextServiceOdo).toBe(17500);
            expect(health.remainingKm).toBe(2080);
            expect(health.status).toBe('aman');
        });

        it('handles null, empty, or malformed motor objects safely without crashing', () => {
            const health = MotoLogic.getComponentHealth(null, 'engineOil');
            expect(health.status).toBe('aman');
            expect(health.remainingKm).toBe(2500);
            expect(health.interval).toBe(2500);
        });

        it('supports external presets parameter with custom notice windows', () => {
            const presets = [
                {
                    id: 'custom-beat',
                    serviceIntervals: { engineOil: 2000 },
                    idealNoticeWindows: { engineOil: 500 }
                }
            ];
            const motor = { presetId: 'custom-beat', currentOdo: 1600 };
            const health = MotoLogic.getComponentHealth(motor, 'engineOil', presets);
            expect(health.interval).toBe(2000);
            expect(health.noticeWindow).toBe(500);
            expect(health.status).toBe('hampir'); // remaining 400 km <= noticeWindow 500
        });
    });

    describe('calculateTaxDueDays & getTaxStatus', () => {
        it('calculates positive days for future tax date', () => {
            const today = new Date('2026-11-24');
            const taxDate = '2026-12-24';
            const days = MotoLogic.calculateTaxDueDays(taxDate, today);
            expect(days).toBe(30);

            const status = MotoLogic.getTaxStatus(taxDate, today);
            expect(status.status).toBe('hampir');
            expect(status.label).toBe('H-30');
        });

        it('returns aman status when tax is due far in the future (> 30 days)', () => {
            const today = new Date('2026-11-24');
            const taxDate = '2027-05-01';
            const status = MotoLogic.getTaxStatus(taxDate, today);
            expect(status.status).toBe('aman');
            expect(status.label).toBe('AMAN');
            expect(status.daysRemaining).toBeGreaterThan(30);
        });

        it('returns segera status when tax is due today or overdue', () => {
            const today = new Date('2026-11-24');
            const taxToday = '2026-11-24';
            expect(MotoLogic.getTaxStatus(taxToday, today).status).toBe('segera');
            expect(MotoLogic.getTaxStatus(taxToday, today).label).toBe('SEGERA');

            const taxOverdue = '2026-11-20';
            const overdueStatus = MotoLogic.getTaxStatus(taxOverdue, today);
            expect(overdueStatus.status).toBe('segera');
            expect(overdueStatus.label).toBe('SEGERA');
            expect(overdueStatus.daysRemaining).toBe(-4);
        });

        it('handles missing, null, or invalid tax dates gracefully', () => {
            expect(MotoLogic.calculateTaxDueDays(null)).toBeNull();
            expect(MotoLogic.calculateTaxDueDays('')).toBeNull();
            expect(MotoLogic.calculateTaxDueDays('not-a-date')).toBeNull();

            const status = MotoLogic.getTaxStatus(null);
            expect(status.status).toBe('aman');
            expect(status.label).toBe('AMAN');
            expect(status.daysRemaining).toBeNull();
        });
    });

    describe('validateMotorInput', () => {
        it('accepts valid motor input and returns sanitized fields', () => {
            const input = {
                brand: ' Honda ',
                model: ' Vario 160 ',
                nickname: ' Vario Hitam ',
                plateNumber: ' b 1234 cd ',
                year: '2023',
                currentOdo: '15000',
                notes: ' Servis rutin '
            };
            const res = MotoLogic.validateMotorInput(input);
            expect(res.isValid).toBe(true);
            expect(res.errors).toHaveLength(0);
            expect(res.sanitized.brand).toBe('Honda');
            expect(res.sanitized.model).toBe('Vario 160');
            expect(res.sanitized.plateNumber).toBe('B 1234 CD');
            expect(res.sanitized.year).toBe(2023);
            expect(res.sanitized.currentOdo).toBe(15000);
        });

        it('rejects missing brand, model, or nickname', () => {
            const res = MotoLogic.validateMotorInput({ brand: '', model: '', nickname: '', year: 2022, currentOdo: 0 });
            expect(res.isValid).toBe(false);
            expect(res.errors.length).toBeGreaterThanOrEqual(2);
        });

        it('rejects invalid year boundaries', () => {
            const resPast = MotoLogic.validateMotorInput({ brand: 'Honda', model: 'Beat', year: 1950, currentOdo: 0 });
            expect(resPast.isValid).toBe(false);
            expect(resPast.errors[0]).toMatch(/Tahun motor/);

            const resFuture = MotoLogic.validateMotorInput({
                brand: 'Honda',
                model: 'Beat',
                year: 2099,
                currentOdo: 0
            });
            expect(resFuture.isValid).toBe(false);
        });

        it('rejects negative or absurd odometer values', () => {
            const resNeg = MotoLogic.validateMotorInput({
                brand: 'Honda',
                model: 'Beat',
                year: 2022,
                currentOdo: -500
            });
            expect(resNeg.isValid).toBe(false);

            const resHuge = MotoLogic.validateMotorInput({
                brand: 'Honda',
                model: 'Beat',
                year: 2022,
                currentOdo: 10000000
            });
            expect(resHuge.isValid).toBe(false);
        });

        it('rejects non-object input', () => {
            expect(MotoLogic.validateMotorInput(null).isValid).toBe(false);
            expect(MotoLogic.validateMotorInput('string').isValid).toBe(false);
        });
    });

    describe('validateFuelInput', () => {
        it('accepts valid fuel input', () => {
            const input = {
                fuelType: 'Pertamax',
                liters: '4.5',
                totalCost: '58500',
                odometer: '15400',
                date: '2026-11-24',
                isFullTank: true
            };
            const res = MotoLogic.validateFuelInput(input);
            expect(res.isValid).toBe(true);
            expect(res.sanitized.liters).toBe(4.5);
            expect(res.sanitized.totalCost).toBe(58500);
            expect(res.sanitized.isFullTank).toBe(true);
        });

        it('rejects non-object or null input', () => {
            expect(MotoLogic.validateFuelInput(null).isValid).toBe(false);
            expect(MotoLogic.validateFuelInput('invalid').isValid).toBe(false);
        });

        it('rejects missing fuel type, zero/negative liters, or excessive liters', () => {
            expect(
                MotoLogic.validateFuelInput({
                    fuelType: '',
                    liters: 4,
                    totalCost: 50000,
                    odometer: 1000,
                    date: '2026-11-24'
                }).isValid
            ).toBe(false);
            expect(
                MotoLogic.validateFuelInput({
                    fuelType: 'Pertalite',
                    liters: 0,
                    totalCost: 50000,
                    odometer: 1000,
                    date: '2026-11-24'
                }).isValid
            ).toBe(false);
            expect(
                MotoLogic.validateFuelInput({
                    fuelType: 'Pertalite',
                    liters: 150,
                    totalCost: 50000,
                    odometer: 1000,
                    date: '2026-11-24'
                }).isValid
            ).toBe(false);
        });

        it('rejects negative cost or odometer and invalid date', () => {
            expect(
                MotoLogic.validateFuelInput({
                    fuelType: 'Pertalite',
                    liters: 4,
                    totalCost: -100,
                    odometer: 1000,
                    date: '2026-11-24'
                }).isValid
            ).toBe(false);
            expect(
                MotoLogic.validateFuelInput({
                    fuelType: 'Pertalite',
                    liters: 4,
                    totalCost: 50000,
                    odometer: -50,
                    date: '2026-11-24'
                }).isValid
            ).toBe(false);
            expect(
                MotoLogic.validateFuelInput({
                    fuelType: 'Pertalite',
                    liters: 4,
                    totalCost: 50000,
                    odometer: 1000,
                    date: 'not-a-date'
                }).isValid
            ).toBe(false);
        });
    });

    describe('validateServiceLogInput', () => {
        it('accepts valid service log input', () => {
            const input = {
                category: 'Ganti Oli Mesin',
                odometer: '14000',
                date: '2026-11-24',
                totalCost: '65000',
                workshop: 'Ahass',
                notes: 'MPX2'
            };
            const res = MotoLogic.validateServiceLogInput(input);
            expect(res.isValid).toBe(true);
            expect(res.sanitized.category).toBe('Ganti Oli Mesin');
            expect(res.sanitized.totalCost).toBe(65000);
        });

        it('rejects non-object or null input', () => {
            expect(MotoLogic.validateServiceLogInput(null).isValid).toBe(false);
            expect(MotoLogic.validateServiceLogInput(12345).isValid).toBe(false);
        });

        it('rejects missing category or negative values', () => {
            expect(
                MotoLogic.validateServiceLogInput({ category: '', odometer: 1000, date: '2026-11-24' }).isValid
            ).toBe(false);
            expect(
                MotoLogic.validateServiceLogInput({ category: 'Servis', odometer: -10, date: '2026-11-24' }).isValid
            ).toBe(false);
            expect(
                MotoLogic.validateServiceLogInput({
                    category: 'Servis',
                    odometer: 1000,
                    date: '2026-11-24',
                    totalCost: -5000
                }).isValid
            ).toBe(false);
        });
    });
});
