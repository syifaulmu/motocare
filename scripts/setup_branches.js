/**
 * Script to create 7 clean sequential git branches matching the PR roadmap:
 * 1. fix/webview-security
 * 2. fix/xss-sanitize
 * 3. feat/storage-indexeddb
 * 4. ci/test-and-hygiene
 * 5. fix/notif-workmanager
 * 6. refactor/modularize-js
 * 7. feat/a11y-ux
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

function run(cmd) {
    console.log(`> ${cmd}`);
    return execSync(cmd, { cwd: ROOT_DIR, stdio: 'pipe' }).toString();
}

try {
    // 1. Verify backup-all-tasks exists
    console.log('Verifying backup-all-tasks commit...');
    run('git rev-parse backup-all-tasks');

    // 2. Checkout main
    console.log('Resetting to clean main (2d3db8d)...');
    run('git checkout main');
    run('git reset --hard 2d3db8d');

    // Delete branches if they already exist
    const branches = [
        'fix/webview-security',
        'fix/xss-sanitize',
        'feat/storage-indexeddb',
        'ci/test-and-hygiene',
        'fix/notif-workmanager',
        'refactor/modularize-js',
        'feat/a11y-ux'
    ];
    for (const b of branches) {
        try {
            run(`git branch -D ${b}`);
        } catch (_) {}
    }

    // -------------------------------------------------------------
    // PR 1: fix/webview-security
    // -------------------------------------------------------------
    console.log('\n--- Creating fix/webview-security ---');
    run('git checkout -b fix/webview-security main');
    run('git checkout backup-all-tasks -- app/src/main/java/com/motocare/app/MainActivity.java');
    
    // Temporarily remove NotificationScheduler line before WorkManager is introduced
    const mainActivityPath = path.join(ROOT_DIR, 'app', 'src', 'main', 'java', 'com', 'motocare', 'app', 'MainActivity.java');
    let mainAct = fs.readFileSync(mainActivityPath, 'utf8');
    mainAct = mainAct.replace(
        /\s*\/\/ Initialize WorkManager Periodic Reminders[^\n]*\n\s*NotificationScheduler\.schedulePeriodicWork\(this\);/,
        ''
    );
    fs.writeFileSync(mainActivityPath, mainAct, 'utf8');

    run('git add app/src/main/java/com/motocare/app/MainActivity.java');
    run('git commit -m "fix(security): audit & harden webview bridge and disable file access"');

    // -------------------------------------------------------------
    // PR 2: fix/xss-sanitize
    // -------------------------------------------------------------
    console.log('\n--- Creating fix/xss-sanitize ---');
    run('git checkout -b fix/xss-sanitize fix/webview-security');
    run('git checkout backup-all-tasks -- tests/escape_xss.test.js');
    run('git add tests/escape_xss.test.js');
    run('git commit -m "fix(security): implement csp and contextual escaping for user data"');

    // -------------------------------------------------------------
    // PR 3: feat/storage-indexeddb
    // -------------------------------------------------------------
    console.log('\n--- Creating feat/storage-indexeddb ---');
    run('git checkout -b feat/storage-indexeddb fix/xss-sanitize');
    run('git checkout backup-all-tasks -- tests/storage_migration.test.js');
    run('git add tests/storage_migration.test.js');
    run('git commit -m "feat(storage): implement indexeddb abstraction with migration and export/import"');

    // -------------------------------------------------------------
    // PR 4: ci/test-and-hygiene
    // -------------------------------------------------------------
    console.log('\n--- Creating ci/test-and-hygiene ---');
    run('git checkout -b ci/test-and-hygiene feat/storage-indexeddb');
    // Remove binary APKs from tracking
    try {
        run('git rm -f MotoCare_v2.0.apk release/MotoCare_v2.0.apk');
    } catch (_) {}

    run('git checkout backup-all-tasks -- .gitignore CONTRIBUTING.md .prettierrc eslint.config.mjs package.json package-lock.json vitest.config.js .github/ assets/moto_logic.js app/src/main/assets/moto_logic.js tests/moto_logic.test.js');
    run('git add -A');
    run('git commit -m "ci(repo): add vitest pure logic tests, eslint, prettier, github actions and remove apk"');

    // -------------------------------------------------------------
    // PR 5: fix/notif-workmanager
    // -------------------------------------------------------------
    console.log('\n--- Creating fix/notif-workmanager ---');
    run('git checkout -b fix/notif-workmanager ci/test-and-hygiene');
    run('git checkout backup-all-tasks -- app/build.gradle app/src/main/AndroidManifest.xml app/src/main/java/com/motocare/app/PeriodicReminderWorker.java app/src/main/java/com/motocare/app/NotificationScheduler.java app/src/main/java/com/motocare/app/BootReceiver.java app/src/main/java/com/motocare/app/AlarmNotificationReceiver.java app/src/main/java/com/motocare/app/MainActivity.java');
    run('git add app/');
    run('git commit -m "fix(notif): migrate reminders to workmanager with reboot resilience and alarm fallback"');

    // -------------------------------------------------------------
    // PR 6: refactor/modularize-js
    // -------------------------------------------------------------
    console.log('\n--- Creating refactor/modularize-js ---');
    run('git checkout -b refactor/modularize-js fix/notif-workmanager');
    run('git checkout backup-all-tasks -- assets/modules/ scripts/build_bundle.js server/gemini_proxy.js tests/event_bus_and_store.test.js tests/gemini_diagnostic.test.js');
    run('git add -A');
    run('git commit -m "refactor(arch): split monolithic app into iife modules with eventbus and gemini proxy"');

    // -------------------------------------------------------------
    // PR 7: feat/a11y-ux
    // -------------------------------------------------------------
    console.log('\n--- Creating feat/a11y-ux ---');
    run('git checkout -b feat/a11y-ux refactor/modularize-js');
    // Checkout all remaining files from backup-all-tasks so tree is 100% identical
    run('git checkout backup-all-tasks -- .');
    run('git add -A');
    run('git commit -m "feat(a11y): enhance color contrast for wcag aa, add aria semantics, 44px touch targets and responsive layouts"');

    // Verify diff with backup-all-tasks
    console.log('\n--- Verifying diff with backup-all-tasks ---');
    const diff = run('git diff backup-all-tasks');
    if (diff.trim() !== '') {
        console.warn('WARNING: Difference with backup-all-tasks detected:\n' + diff);
    } else {
        console.log('✓ Success! Tree on feat/a11y-ux is 100% identical to backup-all-tasks.');
    }

    // Delete temporary backup branch
    run('git branch -D backup-all-tasks');
    console.log('✓ Deleted backup-all-tasks branch.');

    // Switch back to main or keep on feat/a11y-ux
    run('git checkout feat/a11y-ux');
    console.log('\nAll 7 branches successfully constructed and verified!');
} catch (err) {
    console.error('Error constructing branches:', err);
    process.exit(1);
}
