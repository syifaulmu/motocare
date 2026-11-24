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
