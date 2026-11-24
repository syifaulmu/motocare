/**
 * MotoCare v2.0 - Module Bundler Script
 * Bundles discrete modular files into single-file bundles for WebView & Node compatibility.
 */
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const MODULES_DIR = path.join(ROOT_DIR, 'assets', 'modules');

const MODULE_FILES = [
    'event_bus.js',
    'utils.js',
    'storage.js',
    'state.js',
    'notifications.js',
    'fuel.js',
    'service.js',
    'wizard.js',
    'camera.js',
    'gemini.js',
    'render.js',
    'app.js'
];

function buildBundle() {
    console.log('Building MotoCare v2.0 modular bundle...');

    let bundleParts = [];

    bundleParts.push(`/**
 * MotoCare v2.0 - Application Bundle
 * Generated automatically from modular architecture in assets/modules/
 * (c) 2026 MotoCare Indonesia - Distributed under MIT License
 */
(function (global) {
    'use strict';
    const root = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : global);
    root.MotoCare = root.MotoCare || {};
`);

    for (const file of MODULE_FILES) {
        const filePath = path.join(MODULES_DIR, file);
        if (!fs.existsSync(filePath)) {
            throw new Error(`Module file not found: ${filePath}`);
        }
        const content = fs.readFileSync(filePath, 'utf8');
        bundleParts.push(`\n// =========================================================================`);
        bundleParts.push(`// MODULE: ${file}`);
        bundleParts.push(`// =========================================================================`);
        bundleParts.push(content);
    }

    bundleParts.push(`
    // =========================================================================
    // EXPOSE BACKWARD-COMPATIBLE HELPERS & COMMONJS EXPORTS
    // =========================================================================
    const MotoCare = root.MotoCare || {};
    const Utils = MotoCare.Utils || {};
    const Storage = MotoCare.Storage || {};
    const Store = MotoCare.Store || {};
    const EventBus = MotoCare.EventBus || {};

    if (typeof window !== 'undefined') {
        window.escapeHtml = Utils.escapeHtml;
        window.StorageManager = Storage.StorageManager;
        window.applyMigrations = Storage.applyMigrations;
        window.validateImportStructure = Storage.validateImportStructure;
        window.CURRENT_SCHEMA_VERSION = Storage.CURRENT_SCHEMA_VERSION;
        window.DEFAULT_SETTINGS = Storage.DEFAULT_SETTINGS;
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            escapeHtml: Utils.escapeHtml,
            StorageManager: Storage.StorageManager,
            applyMigrations: Storage.applyMigrations,
            validateImportStructure: Storage.validateImportStructure,
            CURRENT_SCHEMA_VERSION: Storage.CURRENT_SCHEMA_VERSION,
            DEFAULT_SETTINGS: Storage.DEFAULT_SETTINGS,
            MotoCare,
            Store,
            EventBus,
            Storage,
            Utils
        };
    }

    // =========================================================================
    // DOM READY AUTO-START
    // =========================================================================
    if (typeof document !== 'undefined') {
        function boot() {
            if (root.MotoCare && root.MotoCare.App && typeof root.MotoCare.App.init === 'function') {
                root.MotoCare.App.init();
            }
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', boot);
        } else {
            boot();
        }
    }
})(typeof self !== 'undefined' ? self : (typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this)));
`);

    const fullBundle = bundleParts.join('\n');

    // Destinations to write
    const targets = [
        path.join(ROOT_DIR, 'assets', 'app.js'),
        path.join(ROOT_DIR, 'assets', 'app_v2.js'),
        path.join(ROOT_DIR, 'app', 'src', 'main', 'assets', 'app.js')
    ];

    for (const target of targets) {
        fs.writeFileSync(target, fullBundle, 'utf8');
        console.log(`✓ Written bundle to: ${path.relative(ROOT_DIR, target)}`);
    }

    // Sync other core assets to app src main assets
    const copyPairs = [
        [path.join(ROOT_DIR, 'assets', 'moto_logic.js'), path.join(ROOT_DIR, 'app', 'src', 'main', 'assets', 'moto_logic.js')],
        [path.join(ROOT_DIR, 'assets', 'data.js'), path.join(ROOT_DIR, 'app', 'src', 'main', 'assets', 'data.js')],
        [path.join(ROOT_DIR, 'assets', 'style.css'), path.join(ROOT_DIR, 'app', 'src', 'main', 'assets', 'style.css')],
        [path.join(ROOT_DIR, 'assets', 'index.html'), path.join(ROOT_DIR, 'app', 'src', 'main', 'assets', 'index.html')]
    ];

    for (const [src, dest] of copyPairs) {
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, dest);
            console.log(`✓ Synced: ${path.relative(ROOT_DIR, dest)}`);
        }
    }

    console.log('Build completed successfully!');
}

if (require.main === module) {
    buildBundle();
}

module.exports = { buildBundle };
