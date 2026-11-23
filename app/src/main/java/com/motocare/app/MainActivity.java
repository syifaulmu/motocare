package com.motocare.app;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.View;
import android.webkit.ConsoleMessage;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

public class MainActivity extends AppCompatActivity {

    private static final int PERMISSION_REQ_CODE = 1001;
    private WebView webView;
    private PermissionRequest pendingWebPermission;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Immersive full-screen / dark status bar styling
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        );

        // Initialize Notification Channels
        AlarmNotificationReceiver.createNotificationChannels(this);

        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setMediaPlaybackRequiresUserGesture(false);

        // Native JS Bridge
        webView.addJavascriptInterface(new WebAppInterface(this), "Android");

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                return super.onConsoleMessage(consoleMessage);
            }

            // Automatically grant camera access to webview getUserMedia
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> {
                    if (hasCameraPermission()) {
                        request.grant(request.getResources());
                    } else {
                        pendingWebPermission = request;
                        requestRequiredPermissions();
                    }
                });
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(intent);
                    return true;
                }
                return false;
            }
        });

        // Request camera & notification permissions on startup
        requestRequiredPermissions();

        // Load offline local web app
        webView.loadUrl("file:///android_asset/index.html");

        // Back button handling
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                webView.evaluateJavascript("if (window.handleAppBack) { window.handleAppBack(); } else { 'default'; }", value -> {
                    if ("\"handled\"".equals(value) || "true".equals(value)) {
                        // Handled by web app (e.g., closed modal or went back to dashboard)
                    } else if (webView.canGoBack()) {
                        webView.goBack();
                    } else {
                        finish();
                    }
                });
            }
        });
    }

    private boolean hasCameraPermission() {
        return ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED;
    }

    private boolean hasNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            return ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
        }
        return true;
    }

    private void requestRequiredPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (!hasCameraPermission() || !hasNotificationPermission()) {
                ActivityCompat.requestPermissions(
                        this,
                        new String[]{Manifest.permission.CAMERA, Manifest.permission.POST_NOTIFICATIONS},
                        PERMISSION_REQ_CODE
                );
            }
        } else {
            if (!hasCameraPermission()) {
                ActivityCompat.requestPermissions(
                        this,
                        new String[]{Manifest.permission.CAMERA},
                        PERMISSION_REQ_CODE
                );
            }
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQ_CODE) {
            if (hasCameraPermission() && pendingWebPermission != null) {
                pendingWebPermission.grant(pendingWebPermission.getResources());
                pendingWebPermission = null;
            }
        }
    }

    public class WebAppInterface {
        Context mContext;

        WebAppInterface(Context c) {
            mContext = c;
        }

        @JavascriptInterface
        public void showToast(String toast) {
            runOnUiThread(() -> Toast.makeText(mContext, toast, Toast.LENGTH_SHORT).show());
        }

        @JavascriptInterface
        public void vibrate(int durationMs) {
            try {
                Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
                if (v != null && v.hasVibrator()) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        v.vibrate(VibrationEffect.createOneShot(durationMs > 0 ? durationMs : 40, VibrationEffect.DEFAULT_AMPLITUDE));
                    } else {
                        v.vibrate(durationMs > 0 ? durationMs : 40);
                    }
                }
            } catch (Exception ignored) {}
        }

        @JavascriptInterface
        public void showSystemNotification(String title, String message, boolean isOverdue) {
            showSystemNotification(title, message, (int) (System.currentTimeMillis() % 100000), isOverdue);
        }

        @JavascriptInterface
        public void showSystemNotification(String title, String message, int notifId, boolean isOverdue) {
            runOnUiThread(() -> {
                SharedPreferences prefs = mContext.getSharedPreferences("motocare_prefs", Context.MODE_PRIVATE);
                boolean notifEnabled = prefs.getBoolean("notifications_enabled", true);
                boolean overdueDailyEnabled = prefs.getBoolean("overdue_daily_enabled", true);

                if (!notifEnabled) return;
                if (isOverdue && !overdueDailyEnabled) return;

                String channelId = isOverdue ? AlarmNotificationReceiver.CHANNEL_ID_URGENT : AlarmNotificationReceiver.CHANNEL_ID_IDEAL;
                AlarmNotificationReceiver.sendNotification(mContext, title, message, notifId, channelId);
            });
        }

        @JavascriptInterface
        public void setNotificationSettings(boolean enabled, boolean overdueDaily) {
            SharedPreferences prefs = mContext.getSharedPreferences("motocare_prefs", Context.MODE_PRIVATE);
            prefs.edit()
                    .putBoolean("notifications_enabled", enabled)
                    .putBoolean("overdue_daily_enabled", overdueDaily)
                    .apply();
        }

        @JavascriptInterface
        public void scheduleDailyOverdueAlarm(String title, String message, int notifId) {
            try {
                AlarmManager alarmManager = (AlarmManager) mContext.getSystemService(Context.ALARM_SERVICE);
                if (alarmManager == null) return;

                Intent intent = new Intent(mContext, AlarmNotificationReceiver.class);
                intent.setAction("com.motocare.app.CHECK_NOTIFICATIONS");
                intent.putExtra("title", title);
                intent.putExtra("message", message);
                intent.putExtra("notif_id", notifId);
                intent.putExtra("is_overdue", true);

                PendingIntent pendingIntent = PendingIntent.getBroadcast(
                        mContext,
                        notifId,
                        intent,
                        Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE : PendingIntent.FLAG_UPDATE_CURRENT
                );

                long triggerAtMillis = System.currentTimeMillis() + (24 * 60 * 60 * 1000); // 24 hours
                alarmManager.setInexactRepeating(
                        AlarmManager.RTC_WAKEUP,
                        triggerAtMillis,
                        AlarmManager.INTERVAL_DAY,
                        pendingIntent
                );
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        @JavascriptInterface
        public void cancelAlarm(int notifId) {
            try {
                AlarmManager alarmManager = (AlarmManager) mContext.getSystemService(Context.ALARM_SERVICE);
                if (alarmManager == null) return;

                Intent intent = new Intent(mContext, AlarmNotificationReceiver.class);
                intent.setAction("com.motocare.app.CHECK_NOTIFICATIONS");
                PendingIntent pendingIntent = PendingIntent.getBroadcast(
                        mContext,
                        notifId,
                        intent,
                        Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE : PendingIntent.FLAG_UPDATE_CURRENT
                );
                alarmManager.cancel(pendingIntent);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        @JavascriptInterface
        public void shareText(String title, String text) {
            runOnUiThread(() -> {
                Intent sendIntent = new Intent();
                sendIntent.setAction(Intent.ACTION_SEND);
                sendIntent.putExtra(Intent.EXTRA_TEXT, text);
                sendIntent.setType("text/plain");
                Intent shareIntent = Intent.createChooser(sendIntent, title);
                startActivity(shareIntent);
            });
        }

        @JavascriptInterface
        public void copyToClipboard(String text) {
            copyToClipboard("MotoCare", text);
        }

        @JavascriptInterface
        public void copyToClipboard(String label, String text) {
            runOnUiThread(() -> {
                ClipboardManager clipboard = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
                if (clipboard != null) {
                    ClipData clip = ClipData.newPlainText(label, text);
                    clipboard.setPrimaryClip(clip);
                }
            });
        }

        @JavascriptInterface
        public void openGeminiWithPrompt(String prompt) {
            runOnUiThread(() -> {
                ClipboardManager clipboard = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
                if (clipboard != null) {
                    ClipData clip = ClipData.newPlainText("MotoCare Gemini Diagnostic Prompt", prompt);
                    clipboard.setPrimaryClip(clip);
                }

                Toast.makeText(mContext, "Prompt keluhan disalin ke clipboard! Membuka Gemini AI...", Toast.LENGTH_LONG).show();

                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("https://gemini.google.com/app"));
                    startActivity(intent);
                } catch (Exception e) {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("https://gemini.google.com/"));
                    startActivity(intent);
                }
            });
        }
    }
}
