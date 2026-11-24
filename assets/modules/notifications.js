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
                            : 'Pajak tahunan jatuh tempo dalam ' + days + ' hari lagi (' + motor.taxAnnualDate + ').';
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
