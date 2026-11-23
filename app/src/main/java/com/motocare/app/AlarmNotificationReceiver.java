package com.motocare.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import androidx.core.app.NotificationCompat;

public class AlarmNotificationReceiver extends BroadcastReceiver {

    public static final String CHANNEL_ID_IDEAL = "motocare_ideal";
    public static final String CHANNEL_ID_URGENT = "motocare_urgent";

    @Override
    public void onReceive(Context context, Intent intent) {
        SharedPreferences prefs = context.getSharedPreferences("motocare_prefs", Context.MODE_PRIVATE);
        boolean notificationsEnabled = prefs.getBoolean("notifications_enabled", true);
        boolean overdueDailyEnabled = prefs.getBoolean("overdue_daily_enabled", true);

        if (!notificationsEnabled) {
            return;
        }

        // Check if intent carries custom title and message
        String title = intent.getStringExtra("title");
        String message = intent.getStringExtra("message");
        int notifId = intent.getIntExtra("notif_id", 101);
        boolean isOverdue = intent.getBooleanExtra("is_overdue", false);

        if (isOverdue && !overdueDailyEnabled) {
            return;
        }

        if (title != null && message != null) {
            sendNotification(context, title, message, notifId, isOverdue ? CHANNEL_ID_URGENT : CHANNEL_ID_IDEAL);
        }
    }

    public static void sendNotification(Context context, String title, String message, int notifId, String channelId) {
        NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager == null) return;

        createNotificationChannels(context);

        Intent intent = new Intent(context, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                context,
                notifId,
                intent,
                Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE : PendingIntent.FLAG_UPDATE_CURRENT
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, channelId)
                .setSmallIcon(R.drawable.ic_motocare_icon)
                .setContentTitle(title)
                .setContentText(message)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(message))
                .setPriority(CHANNEL_ID_URGENT.equals(channelId) ? NotificationCompat.PRIORITY_HIGH : NotificationCompat.PRIORITY_DEFAULT)
                .setAutoCancel(true)
                .setContentIntent(pendingIntent);

        manager.notify(notifId, builder.build());
    }

    public static void createNotificationChannels(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (manager == null) return;

            NotificationChannel idealChannel = new NotificationChannel(
                    CHANNEL_ID_IDEAL,
                    "Pengingat Servis & Pajak MotoCare",
                    NotificationManager.IMPORTANCE_DEFAULT
            );
            idealChannel.setDescription("Notifikasi jadwal ideal ganti oli, servis berkala, dan pajak STNK.");

            NotificationChannel urgentChannel = new NotificationChannel(
                    CHANNEL_ID_URGENT,
                    "Peringatan Kritis Harian (Overdue)",
                    NotificationManager.IMPORTANCE_HIGH
            );
            urgentChannel.setDescription("Peringatan harian jika kilometer oli atau pajak sudah melewati batas aman.");
            urgentChannel.enableVibration(true);

            manager.createNotificationChannel(idealChannel);
            manager.createNotificationChannel(urgentChannel);
        }
    }
}
