# Panduan Kontribusi MotoCare

Terima kasih atas minat Anda untuk berkontribusi pada pengembangan aplikasi MotoCare!

## Cara Menambahkan Database Motor Baru
Database kendaraan berada di file:
`app/src/main/assets/data.js` (array `MOTOR_PRESETS`)

Setiap preset motor memiliki struktur data:
```javascript
{
    id: 'nama-motor-tahun',
    brand: 'Honda / Yamaha / Suzuki / Kawasaki / Lainnya',
    model: 'Nama Lengkap Motor & Tahun',
    type: 'matic / sport / trail / bebek',
    badgeColor: '#FF6B00',
    engine: 'Kapasitas cc, tipe pendingin, katup',
    tankCapacity: 4.2, // Liter
    engineOilCapacity: 0.8, // Liter
    engineOilSpec: 'SAE 10W-30 / 10W-40 JASO MB/MA',
    gearOilCapacity: 120, // ml (0 jika sport/trail/bebek)
    hasRadiator: true, // boolean
    hasCVT: true, // boolean
    tirePressureFront: { solo: 29, duo: 29 },
    tirePressureRear: { solo: 33, duo: 36 },
    serviceIntervals: {
        engineOil: 2500,
        gearOil: 8000,
        vBelt: 24000,
        rollerCVT: 20000,
        airFilter: 15000,
        sparkPlug: 8000,
        coolant: 12000,
        brakePadFront: 12000,
        brakePadRear: 12000,
        tireFront: 20000,
        tireRear: 18000,
        brakeFluid: 20000,
        cvtClean: 8000,
        chainLube: 1000,
        chainAdjust: 2000
    },
    idealNoticeWindows: {
        engineOil: 350,
        gearOil: 800,
        vBelt: 2000,
        // ...
    },
    guide: {
        oilRecommendation: '...',
        cvtNote: '...',
        fuelRecommendation: '...'
    }
}
```

## Alur Pull Request
1. Fork repositori ini ke akun GitHub Anda.
2. Buat branch baru untuk fitur Anda (`git checkout -b fitur-motor-baru`).
3. Lakukan pengujian kompilasi dengan `./gradlew assembleDebug`.
4. Commit perubahan Anda (`git commit -m "feat: tambah preset motor Honda Stylo 160"`).
5. Push ke branch Anda dan buka Pull Request.
