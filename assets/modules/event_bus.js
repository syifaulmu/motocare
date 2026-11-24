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
