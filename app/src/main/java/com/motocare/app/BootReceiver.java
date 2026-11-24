package com.motocare.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.util.Log;

/**
 * MotoCare v2.0 - Boot & Package Update Receiver
 * Restores scheduled alarms and verifies WorkManager status after device reboot or app update.
 */
public class BootReceiver extends BroadcastReceiver {

    public static final String TAG = "MotoCareBootReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || intent.getAction() == null) return;

        String action = intent.getAction();
        Log.i(TAG, "Device broadcast received: " + action);

        if (Intent.ACTION_BOOT_COMPLETED.equals(action)
                || Intent.ACTION_MY_PACKAGE_REPLACED.equals(action)
                || "android.intent.action.QUICKBOOT_POWERON".equals(action)) {

            // 1. Re-verify WorkManager periodic work is enqueued
            NotificationScheduler.schedulePeriodicWork(context);
            Log.d(TAG, "WorkManager periodic work verified on boot.");

            // 2. Reschedule any critical exact alarms if still in the future
            SharedPreferences prefs = context.getSharedPreferences(NotificationScheduler.PREFS_NAME, Context.MODE_PRIVATE);
            int lastAlarmId = prefs.getInt("last_active_alarm_id", -1);

            if (lastAlarmId != -1) {
                long savedTime = prefs.getLong("saved_alarm_time_" + lastAlarmId, 0);
                String title = prefs.getString("saved_alarm_title_" + lastAlarmId, null);
                String message = prefs.getString("saved_alarm_message_" + lastAlarmId, null);
                boolean isOverdue = prefs.getBoolean("saved_alarm_is_overdue_" + lastAlarmId, false);

                long now = System.currentTimeMillis();
                if (title != null && message != null) {
                    if (savedTime > now) {
                        Log.i(TAG, "Rescheduling pending future alarm (ID " + lastAlarmId + ") for " + savedTime);
                        NotificationScheduler.scheduleExactOrFallbackAlarm(context, savedTime, title, message, lastAlarmId, isOverdue);
                    } else if (now - savedTime < (12L * 60 * 60 * 1000)) {
                        // If it expired while phone was off during the last 12 hours, trigger gracefully
                        Log.i(TAG, "Alarm expired while device was powered down. Triggering overdue notification gracefully.");
                        String channelId = isOverdue
                                ? AlarmNotificationReceiver.CHANNEL_ID_URGENT
                                : AlarmNotificationReceiver.CHANNEL_ID_IDEAL;
                        AlarmNotificationReceiver.sendNotification(context, title, message, lastAlarmId, channelId);
                    }
                }
            }
            Log.i(TAG, "Boot restoration completed successfully.");
        }
    }
}
