/**
 * MotoCare v2.0 - Pure Business Logic Module
 * Zero DOM dependencies: Fuel calculations, service health, tax reminders, and validation.
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.MotoLogic = factory();
    }
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    /**
     * Calculates fuel consumption statistics including average km/L using full-to-full method.
     * @param {Array} logs - Array of fuel log objects { odometer, liters, totalCost, isFullTank }
     * @returns {Object} { totalLiters, totalCost, avgKml, logCount }
     */
    function calculateFuelStats(logs) {
        if (!Array.isArray(logs) || logs.length === 0) {
            return { totalLiters: 0, totalCost: 0, avgKml: null, logCount: 0 };
        }

        let totalLiters = 0;
        let totalCost = 0;

        logs.forEach((l) => {
            const liters = Number(l.liters) || 0;
            const cost = Number(l.totalCost) || 0;
            if (liters > 0) totalLiters += liters;
            if (cost > 0) totalCost += cost;
        });

        // Full-to-Full Calculation
        const fullLogs = logs
            .filter((l) => Boolean(l.isFullTank) && !isNaN(Number(l.odometer)) && Number(l.liters) > 0)
            .sort((a, b) => Number(a.odometer) - Number(b.odometer));

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

        const avgKml = totalLitersFull > 0 && totalKm > 0 ? Number((totalKm / totalLitersFull).toFixed(1)) : null;

        return {
            totalLiters: Number(totalLiters.toFixed(2)),
            totalCost: Math.round(totalCost),
            avgKml,
            logCount: logs.length
        };
    }

    /**
     * Calculates total fuel purchase cost from volume and unit price.
     */
    function calculateBbmTotal(volume, pricePerLiter) {
        const v = parseFloat(volume);
        const p = parseFloat(pricePerLiter);
        if (isNaN(v) || isNaN(p) || v <= 0 || p <= 0) return 0;
        return Math.round(v * p);
    }

    /**
     * Evaluates component health status, remaining distance, and service urgency.
     * @param {Object} motor - Motor data object
     * @param {string} key - Component key (e.g. 'engineOil', 'vBelt')
     * @param {Array} [presets] - Optional MOTOR_PRESETS list
     * @returns {Object} Health details { key, interval, lastReplaced, nextServiceOdo, remainingKm, status, statusText, percent, isEstimated }
     */
    function getComponentHealth(motor, key, presets) {
        if (!motor || typeof motor !== 'object') {
            return {
                key,
                interval: 2500,
                lastReplaced: 0,
                nextServiceOdo: 2500,
                remainingKm: 2500,
                noticeWindow: 375,
                status: 'aman',
                statusText: 'AMAN',
                percent: 0,
                isEstimated: false
            };
        }

        let preset = null;
        if (Array.isArray(presets) && motor.presetId) {
            preset = presets.find((p) => p.id === motor.presetId) || null;
        }

        const intervals = preset && preset.serviceIntervals ? preset.serviceIntervals : motor.serviceIntervals || {};
        const noticeWindows = preset && preset.idealNoticeWindows ? preset.idealNoticeWindows : {};

        const interval = Math.max(100, Number(intervals[key]) || 2500);
        const currentOdo = Math.max(0, Number(motor.currentOdo) || 0);

        let lastReplaced =
            motor.componentReplacedOdo &&
            motor.componentReplacedOdo[key] !== undefined &&
            motor.componentReplacedOdo[key] !== null
                ? Number(motor.componentReplacedOdo[key])
                : null;

        let isEstimated = false;
        if (lastReplaced === null || isNaN(lastReplaced)) {
            const completedCycles = Math.floor(currentOdo / interval);
            lastReplaced = completedCycles * interval;
            isEstimated = true;
        }

        const nextServiceOdo = lastReplaced + interval;
        const remainingKm = nextServiceOdo - currentOdo;
        const noticeWindow = noticeWindows[key] || Math.round(interval * 0.15);

        let status = 'aman';
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

    /**
     * Calculates days remaining until annual STNK tax due date.
     * @param {string} taxAnnualDate - ISO date string YYYY-MM-DD
     * @param {Date} [currentDate] - Reference date (defaults to today)
     * @returns {number|null} Days remaining, or null if date is not specified/invalid
     */
    function calculateTaxDueDays(taxAnnualDate, currentDate = new Date()) {
        if (!taxAnnualDate || typeof taxAnnualDate !== 'string') return null;
        const target = new Date(taxAnnualDate);
        if (isNaN(target.getTime())) return null;

        const now = currentDate instanceof Date ? new Date(currentDate) : new Date(currentDate);
        now.setHours(0, 0, 0, 0);
        target.setHours(0, 0, 0, 0);
        const diffMs = target.getTime() - now.getTime();
        return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }

    /**
     * Returns tax due status pill configuration.
     * @param {string} taxAnnualDate - ISO date string
     * @param {Date} [currentDate]
     * @returns {Object} { status: 'aman'|'hampir'|'segera', label: string, daysRemaining: number|null }
     */
    function getTaxStatus(taxAnnualDate, currentDate = new Date()) {
        const days = calculateTaxDueDays(taxAnnualDate, currentDate);
        if (days === null) {
            return { status: 'aman', label: 'AMAN', daysRemaining: null };
        }
        if (days <= 0) {
            return { status: 'segera', label: 'SEGERA', daysRemaining: days };
        }
        if (days <= 30) {
            return { status: 'hampir', label: 'H-' + days, daysRemaining: days };
        }
        return { status: 'aman', label: 'AMAN', daysRemaining: days };
    }

    /**
     * Pure validation for motorcycle registration input.
     * @param {Object} input
     * @returns {Object} { isValid: boolean, errors: string[], sanitized: Object }
     */
    function validateMotorInput(input) {
        const errors = [];
        if (!input || typeof input !== 'object') {
            return { isValid: false, errors: ['Input data motor wajib berupa objek.'], sanitized: null };
        }

        const brand = typeof input.brand === 'string' ? input.brand.trim() : '';
        const model = typeof input.model === 'string' ? input.model.trim() : '';
        const nickname = typeof input.nickname === 'string' ? input.nickname.trim() : model;
        const plate = typeof input.plateNumber === 'string' ? input.plateNumber.trim().toUpperCase() : '';
        const year = Number(input.year);
        const currentOdo = Number(input.currentOdo);

        if (!brand) errors.push('Merek motor wajib diisi.');
        if (!model) errors.push('Model motor wajib diisi.');
        if (!nickname) errors.push('Nama panggilan motor wajib diisi.');

        const currentYear = new Date().getFullYear();
        if (isNaN(year) || year < 1960 || year > currentYear + 1) {
            errors.push(`Tahun motor harus antara 1960 dan ${currentYear + 1}.`);
        }

        if (isNaN(currentOdo) || currentOdo < 0 || currentOdo > 999999) {
            errors.push('Odometer saat ini harus berupa angka antara 0 dan 999.999 KM.');
        }

        return {
            isValid: errors.length === 0,
            errors,
            sanitized:
                errors.length === 0
                    ? {
                          brand,
                          model,
                          nickname,
                          plateNumber: plate,
                          year,
                          currentOdo,
                          initialOdo: currentOdo,
                          notes: typeof input.notes === 'string' ? input.notes.trim() : ''
                      }
                    : null
        };
    }

    /**
     * Pure validation for fuel filling log input.
     * @param {Object} input
     * @returns {Object} { isValid: boolean, errors: string[], sanitized: Object }
     */
    function validateFuelInput(input) {
        const errors = [];
        if (!input || typeof input !== 'object') {
            return { isValid: false, errors: ['Input catatan BBM wajib berupa objek.'], sanitized: null };
        }

        const liters = parseFloat(input.liters);
        const totalCost = parseFloat(input.totalCost);
        const odometer = Number(input.odometer);
        const fuelType = typeof input.fuelType === 'string' ? input.fuelType.trim() : '';
        const date = typeof input.date === 'string' ? input.date.trim() : '';

        if (!fuelType) errors.push('Jenis BBM wajib dipilih.');
        if (isNaN(liters) || liters <= 0 || liters > 100) {
            errors.push('Jumlah liter BBM harus lebih dari 0 dan maksimal 100 liter.');
        }
        if (isNaN(totalCost) || totalCost < 0) {
            errors.push('Total biaya BBM tidak valid.');
        }
        if (isNaN(odometer) || odometer < 0) {
            errors.push('Odometer tidak boleh bernilai negatif.');
        }
        if (!date || isNaN(new Date(date).getTime())) {
            errors.push('Tanggal pengisian BBM tidak valid.');
        }

        return {
            isValid: errors.length === 0,
            errors,
            sanitized:
                errors.length === 0
                    ? {
                          fuelType,
                          liters: Number(liters.toFixed(2)),
                          totalCost: Math.round(totalCost),
                          odometer,
                          date,
                          isFullTank: Boolean(input.isFullTank),
                          notes: typeof input.notes === 'string' ? input.notes.trim() : ''
                      }
                    : null
        };
    }

    /**
     * Pure validation for service maintenance log input.
     * @param {Object} input
     * @returns {Object} { isValid: boolean, errors: string[], sanitized: Object }
     */
    function validateServiceLogInput(input) {
        const errors = [];
        if (!input || typeof input !== 'object') {
            return { isValid: false, errors: ['Input log servis wajib berupa objek.'], sanitized: null };
        }

        const category = typeof input.category === 'string' ? input.category.trim() : '';
        const odometer = Number(input.odometer);
        const date = typeof input.date === 'string' ? input.date.trim() : '';
        const totalCost = input.totalCost !== undefined && input.totalCost !== '' ? Number(input.totalCost) : 0;

        if (!category) errors.push('Kategori servis wajib diisi.');
        if (isNaN(odometer) || odometer < 0) errors.push('Odometer tidak boleh negatif.');
        if (!date || isNaN(new Date(date).getTime())) errors.push('Tanggal servis tidak valid.');
        if (isNaN(totalCost) || totalCost < 0) errors.push('Biaya servis tidak boleh negatif.');

        return {
            isValid: errors.length === 0,
            errors,
            sanitized:
                errors.length === 0
                    ? {
                          category,
                          odometer,
                          date,
                          totalCost: Math.round(totalCost),
                          workshop: typeof input.workshop === 'string' ? input.workshop.trim() : 'Mandiri',
                          notes: typeof input.notes === 'string' ? input.notes.trim() : ''
                      }
                    : null
        };
    }

    return {
        calculateFuelStats,
        calculateBbmTotal,
        getComponentHealth,
        calculateTaxDueDays,
        getTaxStatus,
        validateMotorInput,
        validateFuelInput,
        validateServiceLogInput
    };
});
