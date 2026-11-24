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

        // Initialize WorkManager Periodic Reminders (Doze & reboot resilient)
        NotificationScheduler.schedulePeriodicWork(this);

        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        // JavaScript and DOM storage are required for the offline SPA
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(false); // Deprecated WebSQL disabled

        // SECURITY HARDENING: Disable arbitrary file system and content provider access.
        // Android assets remain fully accessible offline via file:///android_asset/
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);

        // Block mixed HTTP/HTTPS content
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        }

        // Disable geolocation as it is not needed by MotoCare
        settings.setGeolocationEnabled(false);

        // Responsive viewport settings
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

            // Grant camera access ONLY to trusted local asset origin and video capture resource
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> {
                    if (request == null) return;

                    // Validate origin: only accept requests originating from local assets
                    Uri origin = request.getOrigin();
                    boolean isLocalOrigin = origin != null && (
                            "file".equalsIgnoreCase(origin.getScheme()) ||
                            "localhost".equalsIgnoreCase(origin.getHost()) ||
                            "appassets.androidplatform.net".equalsIgnoreCase(origin.getHost())
                    );

                    if (!isLocalOrigin) {
                        request.deny();
                        return;
                    }

                    // Validate requested resources: only grant VIDEO_CAPTURE (Camera)
                    String[] requestedResources = request.getResources();
                    boolean hasVideo = false;
                    for (String r : requestedResources) {
                        if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(r)) {
                            hasVideo = true;
                            break;
                        }
                    }

                    if (hasVideo && hasCameraPermission()) {
                        request.grant(new String[]{PermissionRequest.RESOURCE_VIDEO_CAPTURE});
                    } else if (hasVideo) {
                        pendingWebPermission = request;
                        requestRequiredPermissions();
                    } else {
                        request.deny();
                    }
                });
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (request == null || request.getUrl() == null) return true;
                return handleSafeUrlLoading(request.getUrl());
            }

            @SuppressWarnings("deprecation")
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url == null) return true;
                return handleSafeUrlLoading(Uri.parse(url));
            }

            private boolean handleSafeUrlLoading(Uri uri) {
                String scheme = uri.getScheme();
                if (scheme == null) return true;

                // Allow internal local asset navigation
                String uriString = uri.toString();
                if (uriString.startsWith("file:///android_asset/")) {
                    return false; // Load inside WebView
                }

                // Strictly allow external navigation only for http and https
                if ("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme)) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                        intent.addCategory(Intent.CATEGORY_BROWSABLE);
                        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        startActivity(intent);
                    } catch (Exception e) {
                        Toast.makeText(MainActivity.this, "Tidak dapat membuka tautan eksternal.", Toast.LENGTH_SHORT).show();
                    }
                    return true;
                }

                // Block any other schemes (e.g., javascript:, data:, content:, file: outside assets, intent:)
                return true;
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
            if (pendingWebPermission != null) {
                if (hasCameraPermission()) {
                    // Strictly grant only video capture resource to verified local asset origin
                    pendingWebPermission.grant(new String[]{PermissionRequest.RESOURCE_VIDEO_CAPTURE});
                } else {
                    pendingWebPermission.deny();
                }
                pendingWebPermission = null;
            }
        }
    }

    /**
     * WebAppInterface provides a hardened, validated bridge between the offline WebView
     * and native Android platform APIs.
     *
     * SECURITY ARCHITECTURE & DEFENSE-IN-DEPTH:
     * 1. Least Privilege: Only essential capabilities are exposed (toast, vibration,
     *    notifications, alarms, share, clipboard, and official Gemini portal link).
     * 2. Input Validation: All parameters are bounds-checked, sanitized, and type-validated.
     *    Untrusted or malformed inputs fail gracefully without throwing unhandled exceptions.
     * 3. Memory & Binder Safety: String sizes are strictly bounded to prevent DoS via
     *    TransactionTooLargeException during Binder IPC or intent dispatch.
     * 4. UI Thread Marshaling: Methods interacting with Views/Toasts are dispatched via
     *    runOnUiThread() with internal try-catch blocks.
     */
    public class WebAppInterface {
        private static final int MAX_TITLE_LENGTH = 100;
        private static final int MAX_MESSAGE_LENGTH = 500;
        private static final int MAX_TEXT_LENGTH = 50000; // Safe threshold well below 1MB Binder limit
        private static final int MAX_PROMPT_LENGTH = 4000;
        private static final int MIN_NOTIF_ID = 1;
        private static final int MAX_NOTIF_ID = 999999;

        private final Context mContext;

        WebAppInterface(Context c) {
            mContext = c;
        }

        /**
         * Sanitizes and bounds input strings from the JavaScript bridge.
         * @param input Raw string from JS.
         * @param maxLength Maximum allowable character length.
         * @param stripNewlines If true, removes line breaks/tabs to avoid log/header/UI injection.
         * @return Sanitized non-null string bounded to maxLength.
         */
        private String sanitizeText(String input, int maxLength, boolean stripNewlines) {
            if (input == null) return "";
            String cleaned = input.trim();
            if (stripNewlines) {
                cleaned = cleaned.replaceAll("[\\r\\n\\t]+", " ");
            }
            if (cleaned.length() > maxLength) {
                cleaned = cleaned.substring(0, maxLength);
            }
            return cleaned;
        }

        @JavascriptInterface
        public void showToast(String toast) {
            if (toast == null) return;
            final String safeToast = sanitizeText(toast, 200, true);
            if (safeToast.isEmpty()) return;

            runOnUiThread(() -> {
                try {
                    Toast.makeText(mContext, safeToast, Toast.LENGTH_SHORT).show();
                } catch (Exception ignored) {}
            });
        }

        @JavascriptInterface
        public void vibrate(int durationMs) {
            // Clamped between 10ms and 1000ms to prevent excessive battery drain / hardware stress
            final int safeDuration = Math.max(10, Math.min(durationMs, 1000));
            try {
                Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
                if (v != null && v.hasVibrator()) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        v.vibrate(VibrationEffect.createOneShot(safeDuration, VibrationEffect.DEFAULT_AMPLITUDE));
                    } else {
                        v.vibrate(safeDuration);
                    }
                }
            } catch (Exception ignored) {}
        }

        @JavascriptInterface
        public void showSystemNotification(String title, String message, boolean isOverdue) {
            int notifId = isOverdue ? 1001 : 1002;
            showSystemNotification(title, message, notifId, isOverdue);
        }

        @JavascriptInterface
        public void showSystemNotification(String title, String message, int notifId, boolean isOverdue) {
            final String safeTitle = sanitizeText(title, MAX_TITLE_LENGTH, true);
            final String safeMessage = sanitizeText(message, MAX_MESSAGE_LENGTH, false);
            if (safeTitle.isEmpty() && safeMessage.isEmpty()) return;

            final int safeNotifId = (notifId >= MIN_NOTIF_ID && notifId <= MAX_NOTIF_ID)
                    ? notifId
                    : (isOverdue ? 1001 : 1002);

            runOnUiThread(() -> {
                try {
                    SharedPreferences prefs = mContext.getSharedPreferences("motocare_prefs", Context.MODE_PRIVATE);
                    boolean notifEnabled = prefs.getBoolean("notifications_enabled", true);
                    boolean overdueDailyEnabled = prefs.getBoolean("overdue_daily_enabled", true);

                    if (!notifEnabled) return;
                    if (isOverdue && !overdueDailyEnabled) return;

                    String channelId = isOverdue
                            ? AlarmNotificationReceiver.CHANNEL_ID_URGENT
                            : AlarmNotificationReceiver.CHANNEL_ID_IDEAL;
                    AlarmNotificationReceiver.sendNotification(mContext, safeTitle, safeMessage, safeNotifId, channelId);
                } catch (Exception ignored) {}
            });
        }

        @JavascriptInterface
        public void setNotificationSettings(boolean enabled, boolean overdueDaily) {
            try {
                SharedPreferences prefs = mContext.getSharedPreferences("motocare_prefs", Context.MODE_PRIVATE);
                prefs.edit()
                        .putBoolean("notifications_enabled", enabled)
                        .putBoolean("overdue_daily_enabled", overdueDaily)
                        .apply();
            } catch (Exception ignored) {}
        }

        @JavascriptInterface
        public void schedulePeriodicReminder(String title, String message, boolean isOverdue) {
            final String safeTitle = sanitizeText(title, MAX_TITLE_LENGTH, true);
            final String safeMessage = sanitizeText(message, MAX_MESSAGE_LENGTH, false);
            if (safeTitle.isEmpty() && safeMessage.isEmpty()) return;

            NotificationScheduler.updatePeriodicReminderData(mContext, safeTitle, safeMessage, isOverdue);
            NotificationScheduler.schedulePeriodicWork(mContext);
        }

        @JavascriptInterface
        public void scheduleDailyOverdueAlarm(String title, String message, int notifId) {
            final String safeTitle = sanitizeText(title, MAX_TITLE_LENGTH, true);
            final String safeMessage = sanitizeText(message, MAX_MESSAGE_LENGTH, false);
            final int safeNotifId = (notifId >= MIN_NOTIF_ID && notifId <= MAX_NOTIF_ID) ? notifId : 1001;

            try {
                // Update persistent WorkManager payload for background resilience
                NotificationScheduler.updatePeriodicReminderData(mContext, safeTitle, safeMessage, true);

                long triggerAtMillis = System.currentTimeMillis() + (24L * 60 * 60 * 1000); // 24 hours
                NotificationScheduler.scheduleExactOrFallbackAlarm(mContext, triggerAtMillis, safeTitle, safeMessage, safeNotifId, true);
            } catch (Exception ignored) {}
        }

        @JavascriptInterface
        public void cancelAlarm(int notifId) {
            final int safeNotifId = (notifId >= MIN_NOTIF_ID && notifId <= MAX_NOTIF_ID) ? notifId : 1001;
            try {
                NotificationScheduler.cancelAlarm(mContext, safeNotifId);
            } catch (Exception ignored) {}
        }

        @JavascriptInterface
        public void shareText(String title, String text) {
            if (text == null) return;
            final String safeTitle = sanitizeText(title, MAX_TITLE_LENGTH, true);
            final String safeText = sanitizeText(text, MAX_TEXT_LENGTH, false);
            if (safeText.isEmpty()) return;

            runOnUiThread(() -> {
                try {
                    Intent sendIntent = new Intent();
                    sendIntent.setAction(Intent.ACTION_SEND);
                    sendIntent.putExtra(Intent.EXTRA_TEXT, safeText);
                    sendIntent.setType("text/plain");

                    Intent shareIntent = Intent.createChooser(
                            sendIntent,
                            safeTitle.isEmpty() ? "Bagikan" : safeTitle
                    );
                    shareIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(shareIntent);
                } catch (Exception e) {
                    Toast.makeText(mContext, "Gagal membagikan data.", Toast.LENGTH_SHORT).show();
                }
            });
        }

        @JavascriptInterface
        public void copyToClipboard(String text) {
            copyToClipboard("MotoCare", text);
        }

        @JavascriptInterface
        public void copyToClipboard(String label, String text) {
            if (text == null) return;
            final String safeLabel = sanitizeText(label, MAX_TITLE_LENGTH, true);
            final String safeText = sanitizeText(text, MAX_TEXT_LENGTH, false);
            if (safeText.isEmpty()) return;

            runOnUiThread(() -> {
                try {
                    ClipboardManager clipboard = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
                    if (clipboard != null) {
                        ClipData clip = ClipData.newPlainText(
                                safeLabel.isEmpty() ? "MotoCare" : safeLabel,
                                safeText
                        );
                        clipboard.setPrimaryClip(clip);
                    }
                } catch (Exception ignored) {}
            });
        }

        @JavascriptInterface
        public void openGeminiWithPrompt(String prompt) {
            final String safePrompt = sanitizeText(prompt, MAX_PROMPT_LENGTH, false);

            runOnUiThread(() -> {
                try {
                    if (!safePrompt.isEmpty()) {
                        ClipboardManager clipboard = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
                        if (clipboard != null) {
                            ClipData clip = ClipData.newPlainText("MotoCare Gemini Diagnostic Prompt", safePrompt);
                            clipboard.setPrimaryClip(clip);
                        }
                    }

                    Toast.makeText(mContext, "Prompt keluhan disalin ke clipboard! Membuka Gemini AI...", Toast.LENGTH_LONG).show();

                    // Open strictly verified external Gemini web endpoint via browsable Intent
                    Uri primaryUri = Uri.parse("https://gemini.google.com/app");
                    Intent intent = new Intent(Intent.ACTION_VIEW, primaryUri);
                    intent.addCategory(Intent.CATEGORY_BROWSABLE);
                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(intent);
                } catch (Exception e) {
                    try {
                        Uri fallbackUri = Uri.parse("https://gemini.google.com/");
                        Intent fallbackIntent = new Intent(Intent.ACTION_VIEW, fallbackUri);
                        fallbackIntent.addCategory(Intent.CATEGORY_BROWSABLE);
                        fallbackIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        startActivity(fallbackIntent);
                    } catch (Exception ex) {
                        Toast.makeText(mContext, "Tidak dapat membuka peramban untuk Gemini AI.", Toast.LENGTH_SHORT).show();
                    }
                }
            });
        }
    }
}
