import js from '@eslint/js';
import globals from 'globals';

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
                MOTOR_PRESETS: 'writable',
                COMPONENT_DEFINITIONS: 'writable',
                FUEL_TYPES: 'writable',
                SERVICE_PACKAGES: 'writable',
                SEED_DATA: 'writable',
                MotoLogic: 'writable',
                describe: 'readonly',
                it: 'readonly',
                expect: 'readonly',
                test: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly'
            }
        },
        rules: {
            'no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_|^e$|^err$',
                    varsIgnorePattern: '^(MOTOR_PRESETS|FUEL_TYPES|COMPONENT_DEFINITIONS|SERVICE_PACKAGES|SEED_DATA|loadState|wizardSelectedBrand|wizardSelectedPresetId)'
                }
            ],
            'no-undef': 'error',
            'no-empty': 'off'
        }
    }
];
