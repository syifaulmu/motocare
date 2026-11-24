import { describe, it, expect, beforeEach, vi } from 'vitest';
import path from 'path';

const { EventBus, Store } = require(path.join(__dirname, '..', 'assets', 'app_v2.js'));

describe('MotoCare Modular Architecture: EventBus & Store', () => {
    describe('EventBus Pub/Sub Observer Pattern', () => {
        beforeEach(() => {
            EventBus.clearAll();
        });

        it('has immutable EVENTS constants object', () => {
            expect(EventBus.EVENTS).toBeDefined();
            expect(EventBus.EVENTS.STATE_LOADED).toBe('state:loaded');
            expect(EventBus.EVENTS.MOTOR_SELECTED).toBe('motor:selected');
            expect(EventBus.EVENTS.ODOMETER_UPDATED).toBe('odometer:updated');
            expect(EventBus.EVENTS.FUEL_ADDED).toBe('fuel:added');
            expect(EventBus.EVENTS.COMPONENT_REPLACED).toBe('component:replaced');
        });

        it('subscribes and receives emitted events with payloads', () => {
            const listener = vi.fn();
            EventBus.on(EventBus.EVENTS.MOTOR_SELECTED, listener);

            EventBus.emit(EventBus.EVENTS.MOTOR_SELECTED, { motor: { id: 'm-1' } });
            expect(listener).toHaveBeenCalledTimes(1);
            expect(listener).toHaveBeenCalledWith({ motor: { id: 'm-1' } });
        });

        it('supports multiple listeners for the same event', () => {
            const listenerA = vi.fn();
            const listenerB = vi.fn();

            EventBus.on(EventBus.EVENTS.ODOMETER_UPDATED, listenerA);
            EventBus.on(EventBus.EVENTS.ODOMETER_UPDATED, listenerB);

            EventBus.emit(EventBus.EVENTS.ODOMETER_UPDATED, { newOdo: 15000 });
            expect(listenerA).toHaveBeenCalledTimes(1);
            expect(listenerB).toHaveBeenCalledTimes(1);
        });

        it('unsubscribes cleanly via returned unsubscribe function or off()', () => {
            const listener = vi.fn();
            const unsubscribe = EventBus.on(EventBus.EVENTS.FUEL_ADDED, listener);

            EventBus.emit(EventBus.EVENTS.FUEL_ADDED, { liters: 3 });
            expect(listener).toHaveBeenCalledTimes(1);

            unsubscribe();
            EventBus.emit(EventBus.EVENTS.FUEL_ADDED, { liters: 4 });
            expect(listener).toHaveBeenCalledTimes(1);
        });

        it('catches listener errors without breaking event dispatch to other listeners', () => {
            const throwingListener = vi.fn(() => {
                throw new Error('Listener crash');
            });
            const safeListener = vi.fn();

            EventBus.on('test:event', throwingListener);
            EventBus.on('test:event', safeListener);

            expect(() => {
                EventBus.emit('test:event', { ok: true });
            }).not.toThrow();

            expect(throwingListener).toHaveBeenCalledTimes(1);
            expect(safeListener).toHaveBeenCalledTimes(1);
        });
    });

    describe('Central Store (State Actions & Queries)', () => {
        let mockStorage;
        let mockEventBus;

        beforeEach(() => {
            mockStorage = {
                set: vi.fn(),
                get: vi.fn()
            };
            mockEventBus = {
                EVENTS: EventBus.EVENTS,
                emit: vi.fn(),
                on: vi.fn(),
                off: vi.fn()
            };

            Store.init(
                {
                    motors: [
                        {
                            id: 'm-1',
                            brand: 'Honda',
                            model: 'Beat',
                            nickname: 'Beat Merah',
                            currentOdo: 10000,
                            initialOdo: 0
                        },
                        {
                            id: 'm-2',
                            brand: 'Yamaha',
                            model: 'NMAX',
                            nickname: 'NMAX Hitam',
                            currentOdo: 25000,
                            initialOdo: 0
                        }
                    ],
                    activeMotorId: 'm-1',
                    fuelLogs: [],
                    serviceLogs: [],
                    checklistStates: {},
                    notificationSettings: { enabled: true },
                    theme: 'dark'
                },
                mockStorage,
                mockEventBus
            );
        });

        it('retrieves active motor and list of motors correctly', () => {
            const active = Store.getActiveMotor();
            expect(active).toBeDefined();
            expect(active.id).toBe('m-1');

            const all = Store.getMotors();
            expect(all).toHaveLength(2);

            const m2 = Store.getMotorById('m-2');
            expect(m2.nickname).toBe('NMAX Hitam');
        });

        it('switches active motor and emits MOTOR_SELECTED', () => {
            Store.setActiveMotor('m-2');
            expect(Store.getActiveMotor().id).toBe('m-2');
            expect(mockStorage.set).toHaveBeenCalled();
            expect(mockEventBus.emit).toHaveBeenCalledWith(EventBus.EVENTS.MOTOR_SELECTED, {
                motor: expect.objectContaining({ id: 'm-2' })
            });
        });

        it('adds a new motor and emits MOTOR_ADDED', () => {
            const newMotor = { id: 'm-3', brand: 'Suzuki', model: 'Nex II', nickname: 'Nex', currentOdo: 500 };
            Store.addMotor(newMotor);

            expect(Store.getMotors()).toHaveLength(3);
            expect(Store.getActiveMotor().id).toBe('m-3');
            expect(mockEventBus.emit).toHaveBeenCalledWith(EventBus.EVENTS.MOTOR_ADDED, { motor: newMotor });
            expect(mockStorage.set).toHaveBeenCalled();
        });

        it('deletes motor and switches active to remaining motor', () => {
            Store.deleteMotor('m-1');
            expect(Store.getMotors()).toHaveLength(1);
            expect(Store.getActiveMotor().id).toBe('m-2');
            expect(mockEventBus.emit).toHaveBeenCalledWith(EventBus.EVENTS.MOTOR_DELETED, { motorId: 'm-1' });
        });

        it('updates odometer and emits ODOMETER_UPDATED', () => {
            Store.updateOdometer(12500);
            expect(Store.getActiveMotor().currentOdo).toBe(12500);
            expect(mockEventBus.emit).toHaveBeenCalledWith(EventBus.EVENTS.ODOMETER_UPDATED, {
                motor: expect.objectContaining({ currentOdo: 12500 }),
                newOdo: 12500
            });
            expect(mockStorage.set).toHaveBeenCalled();
        });

        it('adds fuel log, updates odometer if greater, and emits FUEL_ADDED', () => {
            const fuelLog = { id: 'f-1', motorId: 'm-1', liters: 3.5, odometer: 11000, totalCost: 45000 };
            Store.addFuelLog(fuelLog);

            expect(Store.getFuelLogs('m-1')).toHaveLength(1);
            expect(Store.getActiveMotor().currentOdo).toBe(11000);
            expect(mockEventBus.emit).toHaveBeenCalledWith(EventBus.EVENTS.FUEL_ADDED, {
                log: fuelLog,
                motor: expect.objectContaining({ id: 'm-1' })
            });
        });

        it('deletes fuel log and emits FUEL_DELETED', () => {
            Store.addFuelLog({ id: 'f-1', motorId: 'm-1', liters: 3.5, odometer: 10500 });
            Store.deleteFuelLog('f-1');

            expect(Store.getFuelLogs('m-1')).toHaveLength(0);
            expect(mockEventBus.emit).toHaveBeenCalledWith(EventBus.EVENTS.FUEL_DELETED, {
                id: 'f-1',
                motor: expect.anything()
            });
        });

        it('records component replacement and service log', () => {
            Store.addComponentReplacement('engineOil', 12000, '2026-11-24', {
                id: 'srv-1',
                motorId: 'm-1',
                category: 'Ganti Oli Mesin',
                odometer: 12000
            });

            const active = Store.getActiveMotor();
            expect(active.componentReplacedOdo.engineOil).toBe(12000);
            expect(active.componentReplacedDates.engineOil).toBe('2026-11-24');
            expect(Store.getServiceLogs('m-1')).toHaveLength(1);
            expect(mockEventBus.emit).toHaveBeenCalledWith(EventBus.EVENTS.COMPONENT_REPLACED, expect.anything());
        });

        it('manages checklist item state reactively', () => {
            Store.setChecklistItem('m-1', 'chk-lampu', true);
            expect(Store.getChecklist('m-1')['chk-lampu']).toBe(true);

            Store.resetChecklist('m-1');
            expect(Store.getChecklist('m-1')['chk-lampu']).toBeUndefined();
            expect(mockEventBus.emit).toHaveBeenCalledWith(EventBus.EVENTS.CHECKLIST_CHANGED, expect.anything());
        });

        it('updates notification settings and theme', () => {
            Store.updateNotificationSettings({ overdueDailyAlerts: false });
            expect(Store.getNotificationSettings().overdueDailyAlerts).toBe(false);

            Store.setTheme('light');
            expect(Store.getTheme()).toBe('light');
            expect(mockEventBus.emit).toHaveBeenCalledWith(EventBus.EVENTS.THEME_CHANGED, { theme: 'light' });
        });

        it('resets all data cleanly to default state', () => {
            Store.resetAllData({ enabled: true });
            expect(Store.getMotors()).toHaveLength(0);
            expect(Store.getActiveMotor()).toBeNull();
            expect(mockEventBus.emit).toHaveBeenCalledWith(EventBus.EVENTS.DATA_RESET, expect.anything());
        });
    });
});
