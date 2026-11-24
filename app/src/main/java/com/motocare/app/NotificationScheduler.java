package com.motocare.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;
import androidx.work.Constraints;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import java.util.concurrent.TimeUnit;

/**
 * MotoCare v2.0 - Notification Scheduler
 * Coordinates WorkManager for periodic reminders (Doze & reboot resilient)
 * and AlarmManager for critical exact alarms with robust permission checks.
 */
public class NotificationScheduler {

    public static final String TAG = "MotoCareScheduler";
    public static final String ACTION_CHECK_NOTIFICATIONS = "com.motocare.app.CHECK_NOTIFICATIONS";
    public static final String PREFS_NAME = "motocare_prefs";

    /**
     * Enqueues or keeps the WorkManager 24-hour periodic reminder worker.
     * WorkManager automatically survives reboots and respects Doze maintenance windows.
     */
    public static void schedulePeriodicWork(Context context) {
        try {
            Constraints constraints = new Constraints.Builder()
                    .setRequiresBatteryNotLow(false)
                    .build();

            // Periodic request running once every 24 hours with a 2-hour flex interval
            PeriodicWorkRequest periodicRequest = new PeriodicWorkRequest.Builder(
                    PeriodicReminderWorker.class,
                    24, TimeUnit.HOURS,
                    2, TimeUnit.HOURS
            )
                    .setConstraints(constraints)
                    .addTag(PeriodicReminderWorker.TAG)
                    .build();

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                    PeriodicReminderWorker.WORK_NAME,
                    ExistingPeriodicWorkPolicy.KEEP,
                    periodicRequest
            );

            Log.i(TAG, "WorkManager periodic reminder scheduled with KEEP policy.");
        } catch (Exception e) {
            Log.e(TAG, "Error scheduling WorkManager periodic work: " + e.getMessage(), e);
        }
    }

    /**
     * Updates the periodic reminder payload stored in SharedPreferences.
     */
    public static void updatePeriodicReminderData(Context context, String title, String message, boolean isOverdue) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit()
                .putString("periodic_reminder_title", title)
                .putString("periodic_reminder_message", message)
                .putBoolean("periodic_reminder_is_overdue", isOverdue)
                .apply();
        Log.d(TAG, "Updated periodic reminder data in preferences: " + title);
    }

    /**
     * Schedules a critical exact alarm via AlarmManager.
     * Evaluates Android 12+ (API 31+) canScheduleExactAlarms() and gracefully falls back to
     * setAndAllowWhileIdle() without crashing if exact alarm permission is missing or revoked.
     */
    public static void scheduleExactOrFallbackAlarm(Context context, long triggerAtMillis, String title, String message, int notifId, boolean isOverdue) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) {
            Log.w(TAG, "AlarmManager service unavailable.");
            return;
        }

        Intent intent = new Intent(context, AlarmNotificationReceiver.class);
        intent.setAction(ACTION_CHECK_NOTIFICATIONS);
        intent.putExtra("title", title);
        intent.putExtra("message", message);
        intent.putExtra("notif_id", notifId);
        intent.putExtra("is_overdue", isOverdue);

        PendingIntent pendingIntent = PendingIntent.getBroadcast(
                context,
                notifId,
                intent,
                Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
                        ? PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                        : PendingIntent.FLAG_UPDATE_CURRENT
        );

        boolean canScheduleExact = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            canScheduleExact = alarmManager.canScheduleExactAlarms();
        }

        if (canScheduleExact) {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
                } else {
                    alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
                }
                Log.i(TAG, "Exact alarm scheduled successfully for ID: " + notifId + " at " + triggerAtMillis);
            } catch (SecurityException se) {
                Log.w(TAG, "Exact alarm permission revoked at runtime. Falling back to setAndAllowWhileIdle(): " + se.getMessage());
                fallbackSchedule(alarmManager, triggerAtMillis, pendingIntent);
            }
        } else {
            Log.i(TAG, "Exact alarms not permitted by OS policy on this device. Using Doze-resilient fallback.");
            fallbackSchedule(alarmManager, triggerAtMillis, pendingIntent);
        }

        // Persist alarm metadata for reboot recovery
        persistAlarmMetadata(context, notifId, triggerAtMillis, title, message, isOverdue);
    }

    private static void fallbackSchedule(AlarmManager alarmManager, long triggerAtMillis, PendingIntent pendingIntent) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
        } else {
            alarmManager.set(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
        }
        Log.i(TAG, "Doze-compatible inexact alarm scheduled as fallback.");
    }

    public static void cancelAlarm(Context context, int notifId) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return;

        Intent intent = new Intent(context, AlarmNotificationReceiver.class);
        intent.setAction(ACTION_CHECK_NOTIFICATIONS);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(
                context,
                notifId,
                intent,
                Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
                        ? PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                        : PendingIntent.FLAG_UPDATE_CURRENT
        );

        alarmManager.cancel(pendingIntent);
        clearPersistedAlarm(context, notifId);
        Log.i(TAG, "Alarm cancelled for ID: " + notifId);
    }

    private static void persistAlarmMetadata(Context context, int notifId, long triggerAtMillis, String title, String message, boolean isOverdue) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit()
                .putLong("saved_alarm_time_" + notifId, triggerAtMillis)
                .putString("saved_alarm_title_" + notifId, title)
                .putString("saved_alarm_message_" + notifId, message)
                .putBoolean("saved_alarm_is_overdue_" + notifId, isOverdue)
                .putInt("last_active_alarm_id", notifId)
                .apply();
    }

    private static void clearPersistedAlarm(Context context, int notifId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit()
                .remove("saved_alarm_time_" + notifId)
                .remove("saved_alarm_title_" + notifId)
                .remove("saved_alarm_message_" + notifId)
                .remove("saved_alarm_is_overdue_" + notifId)
                .apply();
    }
}
