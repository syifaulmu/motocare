package com.motocare.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.work.Worker;
import androidx.work.WorkerParameters;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * MotoCare v2.0 - WorkManager Periodic Reminder Worker
 * Doze-resilient periodic background worker for periodic maintenance, service, and tax notifications.
 * Automatically runs during OS maintenance windows and survives device reboots.
 */
public class PeriodicReminderWorker extends Worker {

    public static final String TAG = "MotoCarePeriodicWorker";
    public static final String WORK_NAME = "motocare_periodic_reminder";
    public static final int NOTIF_ID_PERIODIC = 1002;

    public PeriodicReminderWorker(@NonNull Context context, @NonNull WorkerParameters workerParams) {
        super(context, workerParams);
    }

    @NonNull
    @Override
    public Result doWork() {
        Context context = getApplicationContext();
        Log.i(TAG, "Executing periodic reminder worker evaluation...");

        SharedPreferences prefs = context.getSharedPreferences("motocare_prefs", Context.MODE_PRIVATE);
        boolean notifEnabled = prefs.getBoolean("notifications_enabled", true);
        boolean overdueDailyEnabled = prefs.getBoolean("overdue_daily_enabled", true);

        if (!notifEnabled) {
            Log.d(TAG, "Notifications are globally disabled in settings. Skipping work.");
            return Result.success();
        }

        String title = prefs.getString("periodic_reminder_title", null);
        String message = prefs.getString("periodic_reminder_message", null);
        boolean isOverdue = prefs.getBoolean("periodic_reminder_is_overdue", false);

        if (title == null || message == null || title.trim().isEmpty() || message.trim().isEmpty()) {
            Log.d(TAG, "No active periodic reminder registered yet. Skipping dispatch.");
            return Result.success();
        }

        if (isOverdue && !overdueDailyEnabled) {
            Log.d(TAG, "Overdue daily alert disabled by user. Skipping.");
            return Result.success();
        }

        // Deduplication: prevent firing multiple notifications on the exact same calendar date
        String today = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
        String lastFiredDate = prefs.getString("last_periodic_notif_date", "");

        if (today.equals(lastFiredDate)) {
            Log.d(TAG, "Notification already dispatched today (" + today + "). Suppressing duplicate.");
            return Result.success();
        }

        // Dispatch notification
        String channelId = isOverdue
                ? AlarmNotificationReceiver.CHANNEL_ID_URGENT
                : AlarmNotificationReceiver.CHANNEL_ID_IDEAL;

        AlarmNotificationReceiver.sendNotification(context, title, message, NOTIF_ID_PERIODIC, channelId);

        // Mark date as notified
        prefs.edit().putString("last_periodic_notif_date", today).apply();
        Log.i(TAG, "Periodic reminder notification dispatched successfully: " + title);

        return Result.success();
    }
}
