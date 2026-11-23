/**
 * MotoCare v2.0 — Database Utama
 * Dibuat: 2024
 * Berisi: MOTOR_PRESETS, FUEL_TYPES, COMPONENT_DEFINITIONS, SERVICE_PACKAGES, SEED_DATA
 */

// =============================================================================
// MOTOR PRESETS — 33 Motor Populer Indonesia
// =============================================================================
const MOTOR_PRESETS = [

  // ---------------------------------------------------------------------------
  // HONDA MATIC
  // ---------------------------------------------------------------------------
  {
    id: 'honda-beat-esp-2021',
    brand: 'Honda',
    model: 'Beat eSP (2021-2023)',
    type: 'matic',
    badgeColor: '#CC0000',
    engine: '108 cc, SOHC, eSP, 1 silinder',
    tankCapacity: 3.7,
    engineOilCapacity: 0.65,
    engineOilSpec: 'SAE 10W-30 JASO MB (Honda Ultra S1 / AHM Oil)',
    gearOilCapacity: 90,
    hasRadiator: false,
    hasCVT: true,
    tirePressureFront: { solo: 29, duo: 29 },
    tirePressureRear: { solo: 29, duo: 33 },
    sparkPlug: 'NGK CPR6EA-9S / Denso U20EPR9',
    battery: 'YTZ5S / GTZ5S (12V 4Ah)',
    frontTireSize: '80/90-14 M/C 40P',
    rearTireSize: '90/90-14 M/C 46P',
    serviceIntervals: {
      engineOil: 2000,
      gearOil: 8000,
      vBelt: 24000,
      rollerCVT: 24000,
      airFilter: 16000,
      sparkPlug: 8000,
      coolant: 0,
      brakePadFront: 24000,
      brakePadRear: 24000,
      tireFront: 48000,
      tireRear: 32000,
      brakeFluid: 24000,
      cvtClean: 8000,
      chainLube: 0,
      chainAdjust: 0
    },
    idealNoticeWindows: {
      engineOil: 500, gearOil: 1000, vBelt: 2000, rollerCVT: 2000,
      airFilter: 1500, sparkPlug: 1000, coolant: 0, brakePadFront: 2000,
      brakePadRear: 2000, tireFront: 5000, tireRear: 4000, brakeFluid: 2000, cvtClean: 1000
    },
    guide: {
      oilRecommendation: 'Honda Ultra S1 10W-30 atau AHM Oil MPX2. Hindari oli matic (JASO MA) karena dapat merusak kopling CVT.',
      cvtNote: 'V-Belt wajib diperiksa setiap 8.000 km. Roller CVT Honda Beat berdiameter 15mm × 12mm, 16 gram. Ganti jika sudah oval atau aus.',
      fuelRecommendation: 'Pertamax (RON 92) direkomendasikan. Minimum Pertalite (RON 90). Hindari BBM tidak standar.',
      commonIssues: [
        'CVT kasar / bergetar saat akselerasi — cek roller dan v-belt',
        'Starter elektrik lemah — cek aki dan relay starter',
        'Mesin brebet saat dingin — bersihkan karburator / throttle body',
        'Rem belakang bunyi gesekan — cek kampas rem'
      ]
    }
  },

  {
    id: 'honda-beat-street-2022',
    brand: 'Honda',
    model: 'Beat Street (2022)',
    type: 'matic',
    badgeColor: '#CC0000',
    engine: '108 cc, SOHC, eSP, 1 silinder',
    tankCapacity: 3.7,
    engineOilCapacity: 0.65,
    engineOilSpec: 'SAE 10W-30 JASO MB (Honda Ultra S1)',
    gearOilCapacity: 90,
    hasRadiator: false,
    hasCVT: true,
    tirePressureFront: { solo: 29, duo: 29 },
    tirePressureRear: { solo: 29, duo: 33 },
    sparkPlug: 'NGK CPR6EA-9S / Denso U20EPR9',
    battery: 'YTZ5S / GTZ5S (12V 4Ah)',
    frontTireSize: '80/90-14 M/C 40P',
    rearTireSize: '90/90-14 M/C 46P',
    serviceIntervals: {
      engineOil: 2000,
      gearOil: 8000,
      vBelt: 24000,
      rollerCVT: 24000,
      airFilter: 16000,
      sparkPlug: 8000,
      coolant: 0,
      brakePadFront: 24000,
      brakePadRear: 24000,
      tireFront: 48000,
      tireRear: 32000,
      brakeFluid: 24000,
      cvtClean: 8000,
      chainLube: 0,
      chainAdjust: 0
    },
    idealNoticeWindows: {
      engineOil: 500, gearOil: 1000, vBelt: 2000, rollerCVT: 2000,
      airFilter: 1500, sparkPlug: 1000, coolant: 0, brakePadFront: 2000,
      brakePadRear: 2000, tireFront: 5000, tireRear: 4000, brakeFluid: 2000, cvtClean: 1000
    },
    guide: {
      oilRecommendation: 'Honda Ultra S1 10W-30 JASO MB. Kapasitas 0,65 liter saat ganti rutin.',
      cvtNote: 'Sama dengan Beat standar. Perhatikan kondisi v-belt dan roller tiap 8.000 km.',
      fuelRecommendation: 'Pertamax atau Pertalite.',
      commonIssues: [
        'Suspensi depan keras (telescopic) — cek oli shock absorber',
        'CVT berisik — bersihkan ruang CVT dari kotoran',
        'Lampu sein tidak menyala — cek sekring'
      ]
    }
  },

  {
    id: 'honda-scoopy-2021',
    brand: 'Honda',
    model: 'Scoopy (2021)',
    type: 'matic',
    badgeColor: '#CC0000',
    engine: '108 cc, SOHC, eSP, 1 silinder',
    tankCapacity: 3.5,
    engineOilCapacity: 0.65,
    engineOilSpec: 'SAE 10W-30 JASO MB (Honda Ultra S1)',
    gearOilCapacity: 90,
    hasRadiator: false,
    hasCVT: true,
    tirePressureFront: { solo: 29, duo: 29 },
    tirePressureRear: { solo: 29, duo: 33 },
    sparkPlug: 'NGK CPR6EA-9S',
    battery: 'YTZ5S (12V 4Ah)',
    frontTireSize: '80/90-14 M/C 40P',
    rearTireSize: '90/90-14 M/C 46P',
    serviceIntervals: {
      engineOil: 2000,
      gearOil: 8000,
      vBelt: 24000,
      rollerCVT: 24000,
      airFilter: 16000,
      sparkPlug: 8000,
      coolant: 0,
      brakePadFront: 24000,
      brakePadRear: 24000,
      tireFront: 48000,
      tireRear: 32000,
      brakeFluid: 24000,
      cvtClean: 8000,
      chainLube: 0,
      chainAdjust: 0
    },
    idealNoticeWindows: {
      engineOil: 500, gearOil: 1000, vBelt: 2000, rollerCVT: 2000,
      airFilter: 1500, sparkPlug: 1000, coolant: 0, brakePadFront: 2000,
      brakePadRear: 2000, tireFront: 5000, tireRear: 4000, brakeFluid: 2000, cvtClean: 1000
    },
    guide: {
      oilRecommendation: 'Honda Ultra S1 10W-30 JASO MB. Ganti tiap 2.000 km atau 3 bulan.',
      cvtNote: 'Roller Scoopy 2021: 15×12 mm, 15 gram. V-belt wajib cek berkala.',
      fuelRecommendation: 'Pertamax direkomendasikan untuk performa optimal.',
      commonIssues: [
        'Starter bunyi kasar — periksa gigi starter',
        'Throttle berat — bersihkan throttle body dan kabel gas',
        'Konsumsi bahan bakar boros — cek filter udara'
      ]
    }
  },

  {
    id: 'honda-vario110-2016',
    brand: 'Honda',
    model: 'Vario 110 (2016)',
    type: 'matic',
    badgeColor: '#CC0000',
    engine: '108 cc, SOHC, eSP, 1 silinder',
    tankCapacity: 3.6,
    engineOilCapacity: 0.65,
    engineOilSpec: 'SAE 10W-30 JASO MB',
    gearOilCapacity: 90,
    hasRadiator: false,
    hasCVT: true,
    tirePressureFront: { solo: 29, duo: 29 },
    tirePressureRear: { solo: 33, duo: 36 },
    sparkPlug: 'NGK CPR6EA-9S',
    battery: 'YTZ5S (12V 4Ah)',
    frontTireSize: '80/90-14 M/C 46P',
    rearTireSize: '90/90-14 M/C 52P',
    serviceIntervals: {
      engineOil: 2000,
      gearOil: 8000,
      vBelt: 24000,
      rollerCVT: 24000,
      airFilter: 16000,
      sparkPlug: 8000,
      coolant: 0,
      brakePadFront: 24000,
      brakePadRear: 24000,
      tireFront: 48000,
      tireRear: 32000,
      brakeFluid: 24000,
      cvtClean: 8000,
      chainLube: 0,
      chainAdjust: 0
    },
    idealNoticeWindows: {
      engineOil: 500, gearOil: 1000, vBelt: 2000, rollerCVT: 2000,
      airFilter: 1500, sparkPlug: 1000, coolant: 0, brakePadFront: 2000,
      brakePadRear: 2000, tireFront: 5000, tireRear: 4000, brakeFluid: 2000, cvtClean: 1000
    },
    guide: {
      oilRecommendation: 'AHM Oil MPX1 atau Honda Ultra S1 10W-30.',
      cvtNote: 'Periksa kondisi v-belt setiap 8.000 km. Roller 16×13 mm.',
      fuelRecommendation: 'Pertalite atau Pertamax.',
      commonIssues: [
        'Tarikan awal berat — cek kampas ganda dan roller CVT',
        'Suara ngorok dari mesin — ganti oli segera',
        'Rem cakram belakang bunyi — bersihkan dan cek kampas'
      ]
    }
  },

  {
    id: 'honda-vario110-2021',
    brand: 'Honda',
    model: 'Vario 110 (2021)',
    type: 'matic',
    badgeColor: '#CC0000',
    engine: '108 cc, SOHC, eSP, 1 silinder',
    tankCapacity: 3.6,
    engineOilCapacity: 0.65,
    engineOilSpec: 'SAE 10W-30 JASO MB (Honda Ultra S1)',
    gearOilCapacity: 90,
    hasRadiator: false,
    hasCVT: true,
    tirePressureFront: { solo: 29, duo: 29 },
    tirePressureRear: { solo: 33, duo: 36 },
    sparkPlug: 'NGK CPR6EA-9S',
    battery: 'YTZ5S (12V 4Ah)',
    frontTireSize: '80/90-14 M/C 46P',
    rearTireSize: '90/90-14 M/C 52P',
    serviceIntervals: {
      engineOil: 2000,
      gearOil: 8000,
      vBelt: 24000,
      rollerCVT: 24000,
      airFilter: 16000,
      sparkPlug: 8000,
      coolant: 0,
      brakePadFront: 24000,
      brakePadRear: 24000,
      tireFront: 48000,
      tireRear: 32000,
      brakeFluid: 24000,
      cvtClean: 8000,
      chainLube: 0,
      chainAdjust: 0
    },
    idealNoticeWindows: {
      engineOil: 500, gearOil: 1000, vBelt: 2000, rollerCVT: 2000,
      airFilter: 1500, sparkPlug: 1000, coolant: 0, brakePadFront: 2000,
      brakePadRear: 2000, tireFront: 5000, tireRear: 4000, brakeFluid: 2000, cvtClean: 1000
    },
    guide: {
      oilRecommendation: 'Honda Ultra S1 10W-30 JASO MB.',
      cvtNote: 'Vario 110 2021 sudah menggunakan sistem eSP yang lebih efisien. Interval CVT sama.',
      fuelRecommendation: 'Pertalite minimum, Pertamax direkomendasikan.',
      commonIssues: [
        'ESP indikator menyala — cek koneksi sensor',
        'Getaran berlebih — periksa mounting mesin',
        'Kampas rem cepat habis — hindari pengereman mendadak'
      ]
    }
  },

  {
    id: 'honda-vario125-2022',
    brand: 'Honda',
    model: 'Vario 125 (2022)',
    type: 'matic',
    badgeColor: '#CC0000',
    engine: '124 cc, SOHC, eSP, 1 silinder',
    tankCapacity: 5.5,
    engineOilCapacity: 0.8,
    engineOilSpec: 'SAE 10W-30 JASO MB (Honda Ultra S1)',
    gearOilCapacity: 100,
    hasRadiator: false,
    hasCVT: true,
    tirePressureFront: { solo: 29, duo: 29 },
    tirePressureRear: { solo: 33, duo: 36 },
    sparkPlug: 'NGK CPR6EA-9S',
    battery: 'YTZ7S (12V 6Ah)',
    frontTireSize: '80/90-14 M/C 46P',
    rearTireSize: '100/90-14 M/C 57P',
    serviceIntervals: {
      engineOil: 2000,
      gearOil: 8000,
      vBelt: 24000,
      rollerCVT: 24000,
      airFilter: 16000,
      sparkPlug: 8000,
      coolant: 0,
      brakePadFront: 24000,
      brakePadRear: 24000,
      tireFront: 48000,
      tireRear: 32000,
      brakeFluid: 24000,
      cvtClean: 8000,
      chainLube: 0,
      chainAdjust: 0
    },
    idealNoticeWindows: {
      engineOil: 500, gearOil: 1000, vBelt: 2000, rollerCVT: 2000,
      airFilter: 1500, sparkPlug: 1000, coolant: 0, brakePadFront: 2000,
      brakePadRear: 2000, tireFront: 5000, tireRear: 4000, brakeFluid: 2000, cvtClean: 1000
    },
    guide: {
      oilRecommendation: 'Honda Ultra S1 10W-30 atau AHM MPX2. Kapasitas 0,8 liter.',
      cvtNote: 'Roller CVT Vario 125: 20×15 mm, 18 gram. V-belt original Honda lebih awet.',
      fuelRecommendation: 'Pertamax (RON 92) untuk mesin eSP agar lebih efisien.',
      commonIssues: [
        'Tarikan ngeden saat tanjakan — cek roller dan v-belt',
        'Lampu MIL berkedip — scan ECU',
        'Konsumsi oli berlebih — cek ring piston'
      ]
    }
  },

  {
    id: 'honda-vario160-2022',
    brand: 'Honda',
    model: 'Vario 160 (2022)',
    type: 'matic',
    badgeColor: '#CC0000',
    engine: '156.9 cc, SOHC, eSP+, 1 silinder',
    tankCapacity: 5.5,
    engineOilCapacity: 0.8,
    engineOilSpec: 'SAE 10W-30 JASO MB (Honda Ultra S1)',
    gearOilCapacity: 100,
    hasRadiator: false,
    hasCVT: true,
    tirePressureFront: { solo: 29, duo: 29 },
    tirePressureRear: { solo: 33, duo: 36 },
    sparkPlug: 'NGK CPR7EA-9S',
    battery: 'YTZ7S (12V 6Ah)',
    frontTireSize: '80/90-14 M/C 46P',
    rearTireSize: '100/80-14 M/C 54P',
    serviceIntervals: {
      engineOil: 2000,
      gearOil: 8000,
      vBelt: 24000,
      rollerCVT: 24000,
      airFilter: 16000,
      sparkPlug: 8000,
      coolant: 0,
      brakePadFront: 24000,
      brakePadRear: 24000,
      tireFront: 48000,
      tireRear: 32000,
      brakeFluid: 24000,
      cvtClean: 8000,
      chainLube: 0,
      chainAdjust: 0
    },
    idealNoticeWindows: {
      engineOil: 500, gearOil: 1000, vBelt: 2000, rollerCVT: 2000,
      airFilter: 1500, sparkPlug: 1000, coolant: 0, brakePadFront: 2000,
      brakePadRear: 2000, tireFront: 5000, tireRear: 4000, brakeFluid: 2000, cvtClean: 1000
    },
    guide: {
      oilRecommendation: 'Honda Ultra S1 atau Ultra S2 10W-30 JASO MB.',
      cvtNote: 'Vario 160 menggunakan Honda Smart Key System. Perawatan CVT sama, tapi performa lebih tinggi — pastikan roller masih bulat sempurna.',
      fuelRecommendation: 'Pertamax (RON 92) wajib. Pertamax Turbo untuk performa maksimal.',
      commonIssues: [
        'Smart key tidak respon — ganti baterai remote atau cek antenna',
        'Getaran tinggi di kecepatan 60-80 kmh — balance roda',
        'Idle kasar — servis throttle body'
      ]
    }
  },

  {
    id: 'honda-adv160-2022',
    brand: 'Honda',
    model: 'ADV 160 (2022)',
    type: 'matic',
    badgeColor: '#CC0000',
    engine: '156.9 cc, SOHC, eSP+, 1 silinder',
    tankCapacity: 8.1,
    engineOilCapacity: 0.8,
    engineOilSpec: 'SAE 10W-30 JASO MB (Honda Ultra S2)',
    gearOilCapacity: 100,
    hasRadiator: false,
    hasCVT: true,
    tirePressureFront: { solo: 29, duo: 32 },
    tirePressureRear: { solo: 33, duo: 36 },
    sparkPlug: 'NGK CPR7EA-9S',
    battery: 'YTZ7S (12V 6Ah)',
    frontTireSize: '100/80-14 M/C 48P',
    rearTireSize: '120/70-14 M/C 55P',
    serviceIntervals: {
      engineOil: 2000,
      gearOil: 8000,
      vBelt: 24000,
      rollerCVT: 24000,
      airFilter: 16000,
      sparkPlug: 8000,
      coolant: 0,
      brakePadFront: 24000,
      brakePadRear: 24000,
      tireFront: 48000,
      tireRear: 32000,
      brakeFluid: 24000,
      cvtClean: 8000,
      chainLube: 0,
      chainAdjust: 0
    },
    idealNoticeWindows: {
      engineOil: 500, gearOil: 1000, vBelt: 2000, rollerCVT: 2000,
      airFilter: 1500, sparkPlug: 1000, coolant: 0, brakePadFront: 2000,
      brakePadRear: 2000, tireFront: 5000, tireRear: 4000, brakeFluid: 2000, cvtClean: 1000
    },
    guide: {
      oilRecommendation: 'Honda Ultra S2 10W-30 JASO MB untuk performa adventure.',
      cvtNote: 'ADV 160 dilengkapi suspensi belakang dual shock dengan per yang stiffer. Pastikan CVT bersih dari lumpur saat dipakai off-road ringan.',
      fuelRecommendation: 'Pertamax (RON 92) minimum. Disarankan Pertamax Turbo untuk perjalanan jauh.',
      commonIssues: [
        'Suspensi belakang ambles — cek preload dan ganti shock',
        'ABS aktif tidak normal — kalibrasi sensor roda',
        'Tangki besar, pastikan rutin cek kondisi bensin'
      ]
    }
  },

  {
    id: 'honda-pcx160-2021',
    brand: 'Honda',
    model: 'PCX 160 (2021)',
    type: 'matic',
    badgeColor: '#CC0000',
    engine: '156.9 cc, SOHC, eSP+, 1 silinder',
    tankCapacity: 8.1,
    engineOilCapacity: 0.8,
    engineOilSpec: 'SAE 10W-30 JASO MB (Honda Ultra S2)',
    gearOilCapacity: 100,
    hasRadiator: false,
    hasCVT: true,
    tirePressureFront: { solo: 29, duo: 32 },
    tirePressureRear: { solo: 33, duo: 36 },
    sparkPlug: 'NGK CPR7EA-9S',
    battery: 'YTZ7S (12V 6Ah)',
    frontTireSize: '100/80-14 M/C 48P',
    rearTireSize: '120/70-14 M/C 55P',
    serviceIntervals: {
      engineOil: 2000,
      gearOil: 8000,
      vBelt: 24000,
      rollerCVT: 24000,
      airFilter: 16000,
      sparkPlug: 8000,
      coolant: 0,
      brakePadFront: 24000,
      brakePadRear: 24000,
      tireFront: 48000,
      tireRear: 32000,
      brakeFluid: 24000,
      cvtClean: 8000,
      chainLube: 0,
      chainAdjust: 0
    },
    idealNoticeWindows: {
      engineOil: 500, gearOil: 1000, vBelt: 2000, rollerCVT: 2000,
      airFilter: 1500, sparkPlug: 1000, coolant: 0, brakePadFront: 2000,
      brakePadRear: 2000, tireFront: 5000, tireRear: 4000, brakeFluid: 2000, cvtClean: 1000
    },
    guide: {
      oilRecommendation: 'Honda Ultra S2 10W-30 JASO MB.',
      cvtNote: 'PCX 160 menggunakan teknologi eSP+ dengan ACG starter. CVT lebih halus. Ganti v-belt dan roller sesuai interval.',
      fuelRecommendation: 'Pertamax atau Pertamax Turbo untuk efisiensi optimal.',
      commonIssues: [
        'Idling tidak stabil — cek sensor O2 dan throttle body',
        'Konsumsi BBM meningkat — cek filter udara dan busi',
        'Bagasi kunci tidak mau buka — cek solenoid kunci'
      ]
    }
  },

  {
    id: 'honda-genio-2022',
    brand: 'Honda',
    model: 'Genio (2022)',
    type: 'matic',
    badgeColor: '#CC0000',
    engine: '108 cc, SOHC, eSP, 1 silinder',
    tankCapacity: 3.5,
    engineOilCapacity: 0.65,
    engineOilSpec: 'SAE 10W-30 JASO MB (Honda Ultra S1)',
    gearOilCapacity: 90,
    hasRadiator: false,
    hasCVT: true,
    tirePressureFront: { solo: 29, duo: 29 },
    tirePressureRear: { solo: 29, duo: 33 },
    sparkPlug: 'NGK CPR6EA-9S',
    battery: 'YTZ5S (12V 4Ah)',
    frontTireSize: '80/90-14 M/C 40P',
    rearTireSize: '90/90-14 M/C 46P',
    serviceIntervals: {
      engineOil: 2000,
      gearOil: 8000,
      vBelt: 24000,
      rollerCVT: 24000,
      airFilter: 16000,
      sparkPlug: 8000,
      coolant: 0,
      brakePadFront: 24000,
      brakePadRear: 24000,
      tireFront: 48000,
      tireRear: 32000,
      brakeFluid: 24000,
      cvtClean: 8000,
      chainLube: 0,
      chainAdjust: 0
    },
    idealNoticeWindows: {
      engineOil: 500, gearOil: 1000, vBelt: 2000, rollerCVT: 2000,
      airFilter: 1500, sparkPlug: 1000, coolant: 0, brakePadFront: 2000,
      brakePadRear: 2000, tireFront: 5000, tireRear: 4000, brakeFluid: 2000, cvtClean: 1000
    },
    guide: {
      oilRecommendation: 'Honda Ultra S1 10W-30 JASO MB.',
      cvtNote: 'Genio berbasis platform Beat. Roller dan v-belt sama dengan Beat eSP.',
      fuelRecommendation: 'Pertamax atau Pertalite.',
      commonIssues: [
        'Getaran di stang — cek bushing stang dan bearing roda depan',
        'Rem belakang kabel — setel sesuai anjuran pabrik',
        'Panel bodi goyang — kencangkan baut-baut bodi'
      ]
    }
  },

  // ---------------------------------------------------------------------------
  // YAMAHA MATIC
  // ---------------------------------------------------------------------------
  {
    id: 'yamaha-mio-m3-2022',
    brand: 'Yamaha',
    model: 'Mio M3 125 (2022)',
    type: 'matic',
    badgeColor: '#003087',
    engine: '125 cc, SOHC, Blue Core, 1 silinder',
    tankCapacity: 4.2,
    engineOilCapacity: 0.9,
    engineOilSpec: 'SAE 10W-40 JASO MB (Yamalube Matic)',
    gearOilCapacity: 90,
    hasRadiator: false,
    hasCVT: true,
    tirePressureFront: { solo: 29, duo: 29 },
    tirePressureRear: { solo: 29, duo: 36 },
    sparkPlug: 'NGK CR6E / Denso U20EPR',
    battery: 'GT5B-3 (12V 5Ah)',
    frontTireSize: '70/90-14 M/C 34P',
    rearTireSize: '80/90-14 M/C 40P',
    serviceIntervals: {
      engineOil: 3000,
      gearOil: 10000,
      vBelt: 25000,
      rollerCVT: 25000,
      airFilter: 15000,
      sparkPlug: 8000,
      coolant: 0,
      brakePadFront: 24000,
      brakePadRear: 24000,
      tireFront: 48000,
      tireRear: 32000,
      brakeFluid: 24000,
      cvtClean: 10000,
      chainLube: 0,
      chainAdjust: 0
    },
    idealNoticeWindows: {
      engineOil: 500, gearOil: 1500, vBelt: 2500, rollerCVT: 2500,
      airFilter: 2000, sparkPlug: 1000, coolant: 0, brakePadFront: 2000,
      brakePadRear: 2000, tireFront: 5000, tireRear: 4000, brakeFluid: 2000, cvtClean: 1500
    },
    guide: {
      oilRecommendation: 'Yamalube Matic 10W-40 atau Castrol Power1 Matic 10W-40 JASO MB.',
      cvtNote: 'Mio M3 menggunakan roller 17g. Periksa v-belt setiap 25.000 km atau jika ada gejala selip.',
      fuelRecommendation: 'Pertalite (RON 90) atau Pertamax.',
      commonIssues: [
        'Tarikan loyo — periksa roller CVT dan karburator',
        'Mesin brebet — bersihkan karburator',
        'Rem belakang tromol aus — setel kabel rem'
      ]
    }
  },

  {
    id: 'yamaha-mio-s-2022',
    brand: 'Yamaha',
    model: 'Mio S (2022)',
    type: 'matic',
    badgeColor: '#003087',
    engine: '125 cc, SOHC, Blue Core, 1 silinder',
    tankCapacity: 4.2,
    engineOilCapacity: 0.9,
    engineOilSpec: 'SAE 10W-40 JASO MB (Yamalube Matic)',
    gearOilCapacity: 90,
    hasRadiator: false,
    hasCVT: true,
    tirePressureFront: { solo: 29, duo: 29 },
    tirePressureRear: { solo: 29, duo: 36 },
    sparkPlug: 'NGK CR6E',
    battery: 'GT5B-3 (12V 5Ah)',
    frontTireSize: '70/90-14 M/C 34P',
    rearTireSize: '80/90-14 M/C 40P',
    serviceIntervals: {
      engineOil: 3000,
      gearOil: 10000,
      vBelt: 25000,
      rollerCVT: 25000,
      airFilter: 15000,
      sparkPlug: 8000,
      coolant: 0,
      brakePadFront: 24000,
      brakePadRear: 24000,
      tireFront: 48000,
      tireRear: 32000,
      brakeFluid: 24000,
      cvtClean: 10000,
      chainLube: 0,
      chainAdjust: 0
    },
    idealNoticeWindows: {
      engineOil: 500, gearOil: 1500, vBelt: 2500, rollerCVT: 2500,
      airFilter: 2000, sparkPlug: 1000, coolant: 0, brakePadFront: 2000,
      brakePadRear: 2000, tireFront: 5000, tireRear: 4000, brakeFluid: 2000, cvtClean: 1500
    },
    guide: {
      oilRecommendation: 'Yamalube Matic 10W-40 JASO MB.',
      cvtNote: 'Mio S versi lebih modern dari M3 dengan fitur smart key. CVT identik.',
      fuelRecommendation: 'Pertamax atau Pertalite.',
      commonIssues: [
        'Smart key baterai habis — ganti CR2032',
        'CVT selip — cek kampas ganda',
        'Klakson lemah — cek sekring klakson'
      ]
    }
  },

  {
    id: 'yamaha-gear125-2022',
    brand: 'Yamaha',
    model: 'Gear 125 (2022)',
    type: 'matic',
    badgeColor: '#003087',
    engine: '125 cc, SOHC, Blue Core, 1 silinder',
    tankCapacity: 4.2,
    engineOilCapacity: 0.9,
    engineOilSpec: 'SAE 10W-40 JASO MB (Yamalube)',
    gearOilCapacity: 90,
    hasRadiator: false,
    hasCVT: true,
    tirePressureFront: { solo: 29, duo: 29 },
    tirePressureRear: { solo: 33, duo: 36 },
    sparkPlug: 'NGK CR6E',
    battery: 'GT5B-3 (12V 5Ah)',
    frontTireSize: '80/90-14 M/C 40P',
    rearTireSize: '90/90-14 M/C 46P',
    serviceIntervals: {
      engineOil: 3000,
      gearOil: 10000,
      vBelt: 25000,
      rollerCVT: 25000,
      airFilter: 15000,
      sparkPlug: 8000,
      coolant: 0,
      brakePadFront: 24000,
      brakePadRear: 24000,
      tireFront: 48000,
      tireRear: 32000,
      brakeFluid: 24000,
      cvtClean: 10000,
      chainLube: 0,
      chainAdjust: 0
    },
    idealNoticeWindows: {
      engineOil: 500, gearOil: 1500, vBelt: 2500, rollerCVT: 2500,
      airFilter: 2000, sparkPlug: 1000, coolant: 0, brakePadFront: 2000,
      brakePadRear: 2000, tireFront: 5000, tireRear: 4000, brakeFluid: 2000, cvtClean: 1500
    },
    guide: {
      oilRecommendation: 'Yamalube 10W-40 JASO MB. Kapasitas 0,9 liter.',
      cvtNote: 'Gear 125 cocok untuk harian di perkotaan. CVT perlu dibersihkan setiap 10.000 km.',
      fuelRecommendation: 'Pertamax atau Pertalite.',
      commonIssues: [
        'Bodi plastik cepat retak — hindari parkir di panas terik langsung',
        'Suspensi belakang limbung — ganti shock yang sudah bocor',
        'Rem depan cakram — bleeding rem tiap 2 tahun'
      ]
    }
  },

  {
    id: 'yamaha-nmax155-gen1',
    brand: 'Yamaha',
    model: 'NMAX 155 Gen1 (2015-2019)',
    type: 'matic',
    badgeColor: '#003087',
    engine: '155 cc, SOHC, Blue Core VVA, 1 silinder',
    tankCapacity: 6.6,
    engineOilCapacity: 1.0,
    engineOilSpec: 'SAE 10W-40 JASO MB (Yamalube Matic)',
    gearOilCapacity: 110,
    hasRadiator: false,
    hasCVT: true,
    tirePressureFront: { solo: 29, duo: 32 },
    tirePressureRear: { solo: 33, duo: 36 },
    sparkPlug: 'NGK CPR8EA-9',
    battery: 'YTZ7S (12V 6Ah)',
    frontTireSize: '110/70-13 M/C 48P',
    rearTireSize: '130/70-13 M/C 57P',
    serviceIntervals: {
      engineOil: 3000,
      gearOil: 10000,
      vBelt: 25000,
      rollerCVT: 25000,
      airFilter: 15000,
      sparkPlug: 8000,
      coolant: 0,
      brakePadFront: 24000,
      brakePadRear: 24000,
      tireFront: 48000,
      tireRear: 32000,
      brakeFluid: 24000,
      cvtClean: 10000,
      chainLube: 0,
      chainAdjust: 0
    },
    idealNoticeWindows: {
      engineOil: 500, gearOil: 1500, vBelt: 2500, rollerCVT: 2500,
      airFilter: 2000, sparkPlug: 1000, coolant: 0, brakePadFront: 2000,
      brakePadRear: 2000, tireFront: 5000, tireRear: 4000, brakeFluid: 2000, cvtClean: 1500
    },
    guide: {
      oilRecommendation: 'Yamalube Matic 10W-40 atau Shell Advance Matic 10W-40.',
      cvtNote: 'Gen1 NMAX menggunakan v-belt lebih panjang. Pastikan ganti v-belt setiap 25.000 km. Roller 18g.',
      fuelRecommendation: 'Pertamax (RON 92) untuk mesin VVA.',
      commonIssues: [
        'VVA tidak aktif — cek solenoid VVA',
        'Getaran saat akselerasi — cek roller CVT oval',
        'Panel speedometer redup — cek koneksi listrik'
      ]
    }
  },

  {
    id: 'yamaha-nmax155-gen2',
    brand: 'Yamaha',
    model: 'NMAX 155 Gen2 (2020-2023)',
    type: 'matic',
    badgeColor: '#003087',
    engine: '155 cc, SOHC, Blue Core VVA, 1 silinder',
    tankCapacity: 7.1,
    engineOilCapacity: 1.0,
    engineOilSpec: 'SAE 10W-40 JASO MB (Yamalube Matic)',
    gearOilCapacity: 110,
    hasRadiator: false,
    hasCVT: true,
    tirePressureFront: { solo: 29, duo: 32 },
    tirePressureRear: { solo: 33, duo: 36 },
    sparkPlug: 'NGK CPR8EA-9',
    battery: 'YTZ7S (12V 6Ah)',
    frontTireSize: '110/70-13 M/C 48P',
    rearTireSize: '130/70-13 M/C 57P',
    serviceIntervals: {
      engineOil: 3000,
      gearOil: 10000,
      vBelt: 25000,
      rollerCVT: 25000,
      airFilter: 15000,
      sparkPlug: 8000,
      coolant: 0,
      brakePadFront: 24000,
      brakePadRear: 24000,
      tireFront: 48000,
      tireRear: 32000,
      brakeFluid: 24000,
      cvtClean: 10000,
      chainLube: 0,
      chainAdjust: 0
    },
    idealNoticeWindows: {
      engineOil: 500, gearOil: 1500, vBelt: 2500, rollerCVT: 2500,
      airFilter: 2000, sparkPlug: 1000, coolant: 0, brakePadFront: 2000,
      brakePadRear: 2000, tireFront: 5000, tireRear: 4000, brakeFluid: 2000, cvtClean: 1500
    },
    guide: {
      oilRecommendation: 'Yamalube Matic 10W-40 JASO MB. Kapasitas 1 liter.',
      cvtNote: 'Gen2 sudah dilengkapi fitur Y-Connect (Bluetooth). CVT lebih halus dari Gen1. Ganti v-belt dan roller tepat waktu.',
      fuelRecommendation: 'Pertamax (RON 92) direkomendasikan pabrikan.',
      commonIssues: [
        'Y-Connect disconnects — update firmware dan reset pairing',
        'ABS pompa berbunyi — normal saat pertama hidupkan, jika terus-menerus cek sensor',
        'Setang getar di kecepatan tinggi — balance roda atau cek bearing'
      ]
    }
  },

  {
    id: 'yamaha-nmax155-gen3',
    brand: 'Yamaha',
    model: 'NMAX 155 Gen3 (2024)',
    type: 'matic',
    badgeColor: '#003087',
    engine: '155 cc, SOHC, Blue Core VVA, 1 silinder',
    tankCapacity: 7.1,
    engineOilCapacity: 1.0,
    engineOilSpec: 'SAE 10W-40 JASO MB (Yamalube Matic)',
    gearOilCapacity: 110,
    hasRadiator: false,
    hasCVT: true,
    tirePressureFront: { solo: 29, duo: 32 },
    tirePressureRear: { solo: 33, duo: 36 },
    sparkPlug: 'NGK CPR8EA-9',
    battery: 'YTZ7S (12V 6Ah)',
    frontTireSize: '110/70-13 M/C 48P',
    rearTireSize: '130/70-13 M/C 57P',
    serviceIntervals: {
      engineOil: 3000,
      gearOil: 10000,
      vBelt: 25000,
      rollerCVT: 25000,
      airFilter: 15000,
      sparkPlug: 8000,
      coolant: 0,
      brakePadFront: 24000,
      brakePadRear: 24000,
      tireFront: 48000,
      tireRear: 32000,
      brakeFluid: 24000,
      cvtClean: 10000,
      chainLube: 0,
      chainAdjust: 0
    },
    idealNoticeWindows: {
      engineOil: 500, gearOil: 1500, vBelt: 2500, rollerCVT: 2500,
      airFilter: 2000, sparkPlug: 1000, coolant: 0, brakePadFront: 2000,
      brakePadRear: 2000, tireFront: 5000, tireRear: 4000, brakeFluid: 2000, cvtClean: 1500
    },
    guide: {
      oilRecommendation: 'Yamalube Matic 10W-40 JASO MB.',
      cvtNote: 'Gen3 hadir dengan desain baru dan fitur lebih lengkap. Interval servis sama dengan Gen2.',
      fuelRecommendation: 'Pertamax (RON 92).',
      commonIssues: [
        'Software TCS — update ke versi terbaru jika ada bug',
        'Suspensi depan keras — sesuaikan dengan bobot pengguna',
        'Setang bar end getar — kencangkan atau ganti yang lebih berat'
      ]
    }
  },

  {
    id: 'yamaha-aerox155-2022',
    brand: 'Yamaha',
    model: 'Aerox 155 (2022)',
    type: 'matic',
    badgeColor: '#003087',
    engine: '155 cc, SOHC, Blue Core VVA, 1 silinder',
    tankCapacity: 4.5,
    engineOilCapacity: 1.0,
    engineOilSpec: 'SAE 10W-40 JASO MB (Yamalube Matic)',
    gearOilCapacity: 110,
    hasRadiator: false,
    hasCVT: true,
    tirePressureFront: { solo: 29, duo: 32 },
    tirePressureRear: { solo: 33, duo: 36 },
    sparkPlug: 'NGK CPR8EA-9',
    battery: 'YTZ7S (12V 6Ah)',
    frontTireSize: '110/70-13 M/C 48P',
    rearTireSize: '130/70-13 M/C 57P',
    serviceIntervals: {
      engineOil: 3000,
      gearOil: 10000,
      vBelt: 25000,
      rollerCVT: 25000,
      airFilter: 15000,
      sparkPlug: 8000,
      coolant: 0,
      brakePadFront: 24000,
      brakePadRear: 24000,
      tireFront: 48000,
      tireRear: 32000,
      brakeFluid: 24000,
      cvtClean: 10000,
      chainLube: 0,
      chainAdjust: 0
    },
    idealNoticeWindows: {
      engineOil: 500, gearOil: 1500, vBelt: 2500, rollerCVT: 2500,
      airFilter: 2000, sparkPlug: 1000, coolant: 0, brakePadFront: 2000,
      brakePadRear: 2000, tireFront: 5000, tireRear: 4000, brakeFluid: 2000, cvtClean: 1500
    },
    guide: {
      oilRecommendation: 'Yamalube 10W-40 JASO MB. Aerox menggunakan mesin sama dengan NMAX.',
      cvtNote: 'Aerox lebih sporty, penggunaan mesin lebih tinggi rpm. Pastikan roller dalam kondisi baik agar akselerasi optimal.',
      fuelRecommendation: 'Pertamax (RON 92) sangat direkomendasikan.',
      commonIssues: [
        'Tangki kecil (4,5L) — perhatikan indikator bahan bakar',
        'CVT kasar saat akselerasi agresif — cek kampas ganda',
        'Rem cakram belakang — bleeding setiap 2 tahun'
      ]
    }
  },

  {
    id: 'yamaha-fazzio-2022',
    brand: 'Yamaha',
    model: 'Fazzio (2022)',
    type: 'matic',
    badgeColor: '#003087',
    engine: '125 cc, SOHC, Blue Core, 1 silinder',
    tankCapacity: 4.6,
    engineOilCapacity: 0.9,
    engineOilSpec: 'SAE 10W-40 JASO MB (Yamalube)',
    gearOilCapacity: 90,
    hasRadiator: false,
    hasCVT: true,
    tirePressureFront: { solo: 29, duo: 29 },
    tirePressureRear: { solo: 29, duo: 36 },
    sparkPlug: 'NGK CR6E',
    battery: 'GT5B-3 (12V 5Ah)',
    frontTireSize: '90/90-14 M/C 46P',
    rearTireSize: '100/90-14 M/C 57P',
    serviceIntervals: {
      engineOil: 3000,
      gearOil: 10000,
      vBelt: 25000,
      rollerCVT: 25000,
      airFilter: 15000,
      sparkPlug: 8000,
      coolant: 0,
      brakePadFront: 24000,
      brakePadRear: 24000,
      tireFront: 48000,
      tireRear: 32000,
      brakeFluid: 24000,
      cvtClean: 10000,
      chainLube: 0,
      chainAdjust: 0
    },
    idealNoticeWindows: {
      engineOil: 500, gearOil: 1500, vBelt: 2500, rollerCVT: 2500,
      airFilter: 2000, sparkPlug: 1000, coolant: 0, brakePadFront: 2000,
      brakePadRear: 2000, tireFront: 5000, tireRear: 4000, brakeFluid: 2000, cvtClean: 1500
    },
    guide: {
      oilRecommendation: 'Yamalube 10W-40 JASO MB.',
      cvtNote: 'Fazzio bergaya retro modern. Mesin Blue Core 125 cc efisien. Perawatan CVT rutin.',
      fuelRecommendation: 'Pertamax atau Pertalite.',
      commonIssues: [
        'Desain retro dengan bodi besar — perhatikan parkir di area sempit',
        'USB charger built-in kadang lemah — cek sekring',
        'Suspensi belakang single — cek kondisi per secara berkala'
      ]
    }
  },

  {
    id: 'yamaha-freego-2022',
    brand: 'Yamaha',
    model: 'Freego (2022)',
    type: 'matic',
    badgeColor: '#003087',
    engine: '125 cc, SOHC, Blue Core, 1 silinder',
    tankCapacity: 4.6,
    engineOilCapacity: 0.9,
    engineOilSpec: 'SAE 10W-40 JASO MB (Yamalube)',
    gearOilCapacity: 90,
    hasRadiator: false,
    hasCVT: true,
    tirePressureFront: { solo: 29, duo: 29 },
    tirePressureRear: { solo: 29, duo: 36 },
    sparkPlug: 'NGK CR6E',
    battery: 'GT5B-3 (12V 5Ah)',
    frontTireSize: '100/80-14 M/C 48P',
    rearTireSize: '110/80-14 M/C 59P',
    serviceIntervals: {
      engineOil: 3000,
      gearOil: 10000,
      vBelt: 25000,
      rollerCVT: 25000,
      airFilter: 15000,
      sparkPlug: 8000,
      coolant: 0,
      brakePadFront: 24000,
      brakePadRear: 24000,
      tireFront: 48000,
      tireRear: 32000,
      brakeFluid: 24000,
      cvtClean: 10000,
      chainLube: 0,
      chainAdjust: 0
    },
    idealNoticeWindows: {
      engineOil: 500, gearOil: 1500, vBelt: 2500, rollerCVT: 2500,
      airFilter: 2000, sparkPlug: 1000, coolant: 0, brakePadFront: 2000,
      brakePadRear: 2000, tireFront: 5000, tireRear: 4000, brakeFluid: 2000, cvtClean: 1500
    },
    guide: {
      oilRecommendation: 'Yamalube 10W-40 JASO MB.',
      cvtNote: 'Freego hadir dengan ban lebar untuk kenyamanan berkendara. CVT standar Blue Core.',
      fuelRecommendation: 'Pertamax atau Pertalite.',
      commonIssues: [
        'Ban lebar lebih berat — konsumsi BBM sedikit lebih boros',
        'Bagasi tambahan di bawah jok — cek kondisi engsel',
        'Suspensi depan teleskopik — cek seal oli shock'
      ]
    }
  },

  // ---------------------------------------------------------------------------
  // HONDA SPORT & TRAIL
  // ---------------------------------------------------------------------------
  {
    id: 'honda-supra-gtr150-2021',
    brand: 'Honda',
    model: 'Supra GTR 150 (2021)',
    type: 'bebek',
    badgeColor: '#CC0000',
    engine: '149.2 cc, DOHC, PGM-FI, 1 silinder',
    tankCapacity: 4.0,
    engineOilCapacity: 1.0,
    engineOilSpec: 'SAE 10W-30 JASO MA2 (Honda Ultra Gold)',
    gearOilCapacity: 0,
    hasRadiator: false,
    hasCVT: false,
    tirePressureFront: { solo: 29, duo: 29 },
    tirePressureRear: { solo: 33, duo: 40 },
    sparkPlug: 'NGK SIMR8A9 (iridium)',
    battery: 'YTZ5S (12V 4Ah)',
    frontTireSize: '70/90-17 M/C 38S',
    rearTireSize: '80/90-17 M/C 44S',
    serviceIntervals: {
      engineOil: 2000,
      gearOil: 0,
      vBelt: 0,
      rollerCVT: 0,
      airFilter: 16000,
      sparkPlug: 8000,
      coolant: 0,
      brakePadFront: 24000,
      brakePadRear: 24000,
      tireFront: 48000,
      tireRear: 32000,
      brakeFluid: 24000,
      cvtClean: 0,
      chainLube: 500,
      chainAdjust: 2000
    },
    idealNoticeWindows: {
      engineOil: 500, gearOil: 0, vBelt: 0, rollerCVT: 0,
      airFilter: 2000, sparkPlug: 1000, coolant: 0, brakePadFront: 2000,
      brakePadRear: 2000, tireFront: 5000, tireRear: 4000, brakeFluid: 2000, cvtClean: 0
    },
    guide: {
      oilRecommendation: 'Honda Ultra Gold 10W-30 JASO MA2 (untuk kopling basah). JANGAN gunakan oli JASO MB.',
      chainNote: 'Rantai dilumasi setiap 500 km, disetel setiap 2.000 km. Slack rantai ideal: 10-20 mm.',
      fuelRecommendation: 'Pertamax (RON 92) untuk mesin DOHC performa tinggi.',
      commonIssues: [
        'Rantai cepat kendur — periksa kondisi sproket',
        'Perpindahan gigi keras — ganti oli mesin segera',
        'Klakson lemah — umum, bisa upgrade'
      ]
    }
  },

  {
    id: 'honda-cb150r-2021',
    brand: 'Honda',
    model: 'CB150R Streetfire (2021)',
    type: 'sport',
    badgeColor: '#CC0000',
    engine: '149.2 cc, DOHC, PGM-FI, 1 silinder',
    tankCapacity: 12.0,
    engineOilCapacity: 1.3,
    engineOilSpec: 'SAE 10W-30 JASO MA2 (Honda Ultra Gold)',
    gearOilCapacity: 0,
    hasRadiator: false,
    hasCVT: false,
    tirePressureFront: { solo: 29, duo: 32 },
    tirePressureRear: { solo: 33, duo: 40 },
    sparkPlug: 'NGK SIMR8A9 (iridium)',
    battery: 'YTZ7S (12V 6Ah)',
    frontTireSize: '90/80-17 M/C 46H',
    rearTireSize: '110/70-17 M/C 54H',
    serviceIntervals: {
      engineOil: 2000,
      gearOil: 0,
      vBelt: 0,
      rollerCVT: 0,
      airFilter: 16000,
      sparkPlug: 8000,
      coolant: 0,
      brakePadFront: 24000,
      brakePadRear: 24000,
      tireFront: 48000,
      tireRear: 32000,
      brakeFluid: 24000,
      cvtClean: 0,
      chainLube: 500,
      chainAdjust: 2000
    },
    idealNoticeWindows: {
      engineOil: 500, gearOil: 0, vBelt: 0, rollerCVT: 0,
      airFilter: 2000, sparkPlug: 1000, coolant: 0, brakePadFront: 2000,
      brakePadRear: 2000, tireFront: 5000, tireRear: 4000, brakeFluid: 2000, cvtClean: 0
    },
    guide: {
      oilRecommendation: 'Honda Ultra Gold 10W-30 JASO MA2. Kapasitas 1,3 liter dengan ganti filter.',
      chainNote: 'Rantai sealed (O-ring chain). Lumasi setiap 500 km, cek slack 25-35 mm.',
      fuelRecommendation: 'Pertamax (RON 92) minimum untuk mesin DOHC.',
      commonIssues: [
        'Suara klotok dari mesin — cek tension rantai keteng',
        'Rem depan keras — bleeding master rem',
        'Lampu sein LED tidak nyala — cek modul sein'
      ]
    }
  },

  {
    id: 'honda-cb150-verza-2022',
    brand: 'Honda',
    model: 'CB150 Verza (2022)',
    type: 'sport',
    badgeColor: '#CC0000',
    engine: '149.2 cc, SOHC, PGM-FI, 1 silinder',
    tankCapacity: 12.3,
    engineOilCapacity: 1.0,
    engineOilSpec: 'SAE 10W-30 JASO MA2 (Honda Ultra Gold)',
    gearOilCapacity: 0,
    hasRadiator: false,
    hasCVT: false,
    tirePressureFront: { solo: 29, duo: 32 },
    tirePressureRear: { solo: 33, duo: 40 },
    sparkPlug: 'NGK CPR9EA-9',
    battery: 'YTZ5S (12V 4Ah)',
    frontTireSize: '70/90-17 M/C 38H',
    rearTireSize: '80/90-17 M/C 44H',
    serviceIntervals: {
      engineOil: 2000,
      gearOil: 0,
      vBelt: 0,
      rollerCVT: 0,
      airFilter: 16000,
      sparkPlug: 8000,
      coolant: 0,
      brakePadFront: 24000,
      brakePadRear: 24000,
      tireFront: 48000,
      tireRear: 32000,
      brakeFluid: 24000,
      cvtClean: 0,
      chainLube: 500,
      chainAdjust: 2000
    },
    idealNoticeWindows: {
      engineOil: 500, gearOil: 0, vBelt: 0, rollerCVT: 0,
      airFilter: 2000, sparkPlug: 1000, coolant: 0, brakePadFront: 2000,
      brakePadRear: 2000, tireFront: 5000, tireRear: 4000, brakeFluid: 2000, cvtClean: 0
    },
    guide: {
      oilRecommendation: 'Honda Ultra Gold 10W-30 JASO MA2.',
      chainNote: 'Rantai konvensional non-sealed. Lumasi setiap 500 km. Ganti jika sudah mulur berlebihan.',
      fuelRecommendation: 'Pertalite atau Pertamax.',
      commonIssues: [
        'Rantai cepat berkarat — gunakan pelumas rantai berkualitas',
        'Klakson standar lemah — bisa upgrade',
        'Suspensi monoshock — cek kondisi seal'
      ]
    }
  },

  {
    id: 'honda-crf150l-2021',
    brand: 'Honda',
    model: 'CRF150L (2021)',
    type: 'trail',
    badgeColor: '#CC0000',
    engine: '149.2 cc, SOHC, PGM-FI, 1 silinder',
    tankCapacity: 7.5,
    engineOilCapacity: 1.1,
    engineOilSpec: 'SAE 10W-30 JASO MA2 (Honda Ultra Gold)',
    gearOilCapacity: 0,
    hasRadiator: false,
    hasCVT: false,
    tirePressureFront: { solo: 15, duo: 15 },
    tirePressureRear: { solo: 15, duo: 18 },
    sparkPlug: 'NGK CPR6EA-9S',
    battery: 'YTZ5S (12V 4Ah)',
    frontTireSize: '70/100-19 M/C 42M',
    rearTireSize: '90/100-16 M/C 51M',
    serviceIntervals: {
      engineOil: 2000,
      gearOil: 0,
      vBelt: 0,
      rollerCVT: 0,
      airFilter: 8000,
      sparkPlug: 8000,
      coolant: 0,
      brakePadFront: 16000,
      brakePadRear: 16000,
      tireFront: 24000,
      tireRear: 16000,
      brakeFluid: 16000,
      cvtClean: 0,
      chainLube: 300,
      chainAdjust: 1000
    },
    idealNoticeWindows: {
      engineOil: 500, gearOil: 0, vBelt: 0, rollerCVT: 0,
      airFilter: 1000, sparkPlug: 1000, coolant: 0, brakePadFront: 2000,
      brakePadRear: 2000, tireFront: 3000, tireRear: 2000, brakeFluid: 2000, cvtClean: 0
    },
    guide: {
      oilRecommendation: 'Honda Ultra Gold 10W-30 JASO MA2. Interval lebih pendek karena penggunaan off-road.',
      chainNote: 'Rantai trail lebih sering kotor. Bersihkan dan lumasi setiap 300 km atau setelah off-road. Cek slack rantai setiap 1.000 km.',
      fuelRecommendation: 'Pertalite atau Pertamax.',
      commonIssues: [
        'Filter udara cepat kotor — bersihkan setelah off-road',
        'Rantai cepat kendur — periksa kondisi sproket dan rantai',
        'Suspensi depan terlalu empuk untuk off-road berat — pertimbangkan upgrade spring'
      ]
    }
  },

  {
    id: 'honda-xl150-dax-2022',
    brand: 'Honda',
    model: 'XL150 Dax (2022)',
    type: 'sport',
    badgeColor: '#CC0000',
    engine: '149.2 cc, SOHC, PGM-FI, 1 silinder',
    tankCapacity: 3.8,
    engineOilCapacity: 1.0,
    engineOilSpec: 'SAE 10W-30 JASO MA2 (Honda Ultra Gold)',
    gearOilCapacity: 0,
    hasRadiator: false,
    hasCVT: false,
    tirePressureFront: { solo: 29, duo: 32 },
    tirePressureRear: { solo: 33, duo: 40 },
    sparkPlug: 'NGK CPR6EA-9S',
    battery: 'YTZ5S (12V 4Ah)',
    frontTireSize: '80/90-17 M/C 44H',
    rearTireSize: '80/90-17 M/C 50H',
    serviceIntervals: {
      engineOil: 2000,
      gearOil: 0,
      vBelt: 0,
      rollerCVT: 0,
      airFilter: 16000,
      sparkPlug: 8000,
      coolant: 0,
      brakePadFront: 24000,
      brakePadRear: 24000,
      tireFront: 48000,
      tireRear: 32000,
      brakeFluid: 24000,
      cvtClean: 0,
      chainLube: 500,
      chainAdjust: 2000
    },
    idealNoticeWindows: {
      engineOil: 500, gearOil: 0, vBelt: 0, rollerCVT: 0,
      airFilter: 2000, sparkPlug: 1000, coolant: 0, brakePadFront: 2000,
      brakePadRear: 2000, tireFront: 5000, tireRear: 4000, brakeFluid: 2000, cvtClean: 0
    },
    guide: {
      oilRecommendation: 'Honda Ultra Gold 10W-30 JASO MA2.',
      chainNote: 'XL150 Dax menggunakan rantai. Lumasi setiap 500 km.',
      fuelRecommendation: 'Pertamax atau Pertalite.',
      commonIssues: [
        'Tangki kecil (3,8L) — isi bahan bakar lebih sering',
        'Desain retro — perhatikan kualitas sparepart aftermarket',
        'Ground clearance rendah — hindari jalan berlubang dalam'
      ]
    }
  },

  // ---------------------------------------------------------------------------
  // YAMAHA SPORT
  // ---------------------------------------------------------------------------
  {
    id: 'yamaha-mxking150-2022',
    brand: 'Yamaha',
    model: 'MX King 150 (2022)',
    type: 'bebek',
    badgeColor: '#003087',
    engine: '149.8 cc, SOHC, VVA, 1 silinder',
    tankCapacity: 4.6,
    engineOilCapacity: 1.15,
    engineOilSpec: 'SAE 10W-40 JASO MA2 (Yamalube 4ST)',
    gearOilCapacity: 0,
    hasRadiator: false,
    hasCVT: false,
    tirePressureFront: { solo: 29, duo: 29 },
    tirePressureRear: { solo: 33, duo: 40 },
    sparkPlug: 'NGK CPR8EA-9',
    battery: 'GT5B-3 (12V 5Ah)',
    frontTireSize: '70/90-17 M/C 38H',
    rearTireSize: '80/90-17 M/C 44H',
    serviceIntervals: {
      engineOil: 3000,
      gearOil: 0,
      vBelt: 0,
      rollerCVT: 0,
      airFilter: 15000,
      sparkPlug: 8000,
      coolant: 0,
      brakePadFront: 24000,
      brakePadRear: 24000,
      tireFront: 48000,
      tireRear: 32000,
      brakeFluid: 24000,
      cvtClean: 0,
      chainLube: 500,
      chainAdjust: 2000
    },
    idealNoticeWindows: {
      engineOil: 500, gearOil: 0, vBelt: 0, rollerCVT: 0,
      airFilter: 2000, sparkPlug: 1000, coolant: 0, brakePadFront: 2000,
      brakePadRear: 2000, tireFront: 5000, tireRear: 4000, brakeFluid: 2000, cvtClean: 0
    },
    guide: {
      oilRecommendation: 'Yamalube 4ST 10W-40 JASO MA2. Kapasitas 1,15 liter.',
      chainNote: 'Rantai MX King lebih cepat aus jika sering dipacu. Gunakan chain lube berkualitas setiap 500 km.',
      fuelRecommendation: 'Pertamax (RON 92) untuk mesin VVA.',
      commonIssues: [
        'VVA tidak aktif di rpm tinggi — cek solenoid',
        'Perpindahan gigi kasar — ganti oli dan setel kabel kopling',
        'Rantai cepat kendur — periksa sproket'
      ]
    }
  },

  {
    id: 'yamaha-xsr155-2022',
    brand: 'Yamaha',
    model: 'XSR 155 (2022)',
    type: 'sport',
    badgeColor: '#003087',
    engine: '155 cc, SOHC, VVA, 1 silinder',
    tankCapacity: 14.1,
    engineOilCapacity: 1.15,
    engineOilSpec: 'SAE 10W-40 JASO MA2 (Yamalube 4ST)',
    gearOilCapacity: 0,
    hasRadiator: false,
    hasCVT: false,
    tirePressureFront: { solo: 29, duo: 32 },
    tirePressureRear: { solo: 33, duo: 40 },
    sparkPlug: 'NGK CPR8EA-9',
    battery: 'YTZ7S (12V 6Ah)',
    frontTireSize: '110/70-17 M/C 54H',
    rearTireSize: '150/60-17 M/C 66H',
    serviceIntervals: {
      engineOil: 3000,
      gearOil: 0,
      vBelt: 0,
      rollerCVT: 0,
      airFilter: 15000,
      sparkPlug: 8000,
      coolant: 0,
      brakePadFront: 24000,
      brakePadRear: 24000,
      tireFront: 48000,
      tireRear: 32000,
      brakeFluid: 24000,
      cvtClean: 0,
      chainLube: 500,
      chainAdjust: 2000
    },
    idealNoticeWindows: {
      engineOil: 500, gearOil: 0, vBelt: 0, rollerCVT: 0,
      airFilter: 2000, sparkPlug: 1000, coolant: 0, brakePadFront: 2000,
      brakePadRear: 2000, tireFront: 5000, tireRear: 4000, brakeFluid: 2000, cvtClean: 0
    },
    guide: {
      oilRecommendation: 'Yamalube 4ST 10W-40 JASO MA2. Kapasitas 1,15 liter ganti filter.',
      chainNote: 'XSR155 menggunakan rantai 428. Gunakan pelumas rantai khusus O-ring. Slack rantai 30-40 mm.',
      fuelRecommendation: 'Pertamax (RON 92) untuk performa maksimal mesin VVA.',
      commonIssues: [
        'Ban belakang lebar 150 — perhatikan tekanan angin',
        'Tangki besar, rangkaian kabel kompleks — cek di bengkel resmi',
        'Lampu full LED — jika bermasalah, ganti modul bukan bulb'
      ]
    }
  },

  {
    id: 'yamaha-wr155r-2022',
    brand: 'Yamaha',
    model: 'WR155R (2022)',
    type: 'trail',
    badgeColor: '#003087',
    engine: '155 cc, SOHC, VVA, 1 silinder',
    tankCapacity: 7.0,
    engineOilCapacity: 1.15,
    engineOilSpec: 'SAE 10W-40 JASO MA2 (Yamalube 4ST)',
    gearOilCapacity: 0,
    hasRadiator: false,
    hasCVT: false,
    tirePressureFront: { solo: 15, duo: 15 },
    tirePressureRear: { solo: 15, duo: 18 },
    sparkPlug: 'NGK CPR8EA-9',
    battery: 'YTZ5S (12V 4Ah)',
    frontTireSize: '80/100-21 M/C 51R',
    rearTireSize: '100/100-18 M/C 59R',
    serviceIntervals: {
      engineOil: 2000,
      gearOil: 0,
      vBelt: 0,
      rollerCVT: 0,
      airFilter: 8000,
      sparkPlug: 8000,
      coolant: 0,
      brakePadFront: 16000,
      brakePadRear: 16000,
      tireFront: 24000,
      tireRear: 16000,
      brakeFluid: 16000,
      cvtClean: 0,
      chainLube: 300,
      chainAdjust: 1000
    },
    idealNoticeWindows: {
      engineOil: 500, gearOil: 0, vBelt: 0, rollerCVT: 0,
      airFilter: 1000, sparkPlug: 1000, coolant: 0, brakePadFront: 2000,
      brakePadRear: 2000, tireFront: 3000, tireRear: 2000, brakeFluid: 2000, cvtClean: 0
    },
    guide: {
      oilRecommendation: 'Yamalube 4ST 10W-40 JASO MA2. Interval lebih pendek untuk trail.',
      chainNote: 'Bersihkan dan lumasi rantai setiap 300 km atau setelah sesi off-road. Gunakan rantai 428 heavy duty untuk trail berat.',
      fuelRecommendation: 'Pertamax atau Pertalite.',
      commonIssues: [
        'Filter udara busa cepat kotor — bersihkan dan olesi dengan minyak filter',
        'Rantai dan sproket cepat aus di medan berat — gunakan produk premium',
        'Suspensi perlu re-valving untuk rider berat — upgrade spring'
      ]
    }
  },

  {
    id: 'yamaha-r15v3-2022',
    brand: 'Yamaha',
    model: 'R15 V3 (2022)',
    type: 'sport',
    badgeColor: '#003087',
    engine: '155 cc, SOHC, VVA, 1 silinder',
    tankCapacity: 11.0,
    engineOilCapacity: 1.15,
    engineOilSpec: 'SAE 10W-40 JASO MA2 (Yamalube 4ST)',
    gearOilCapacity: 0,
    hasRadiator: false,
    hasCVT: false,
    tirePressureFront: { solo: 29, duo: 32 },
    tirePressureRear: { solo: 33, duo: 40 },
    sparkPlug: 'NGK CPR8EA-9',
    battery: 'YTZ7S (12V 6Ah)',
    frontTireSize: '100/80-17 M/C 52H',
    rearTireSize: '130/70-17 M/C 62H',
    serviceIntervals: {
      engineOil: 3000,
      gearOil: 0,
      vBelt: 0,
      rollerCVT: 0,
      airFilter: 15000,
      sparkPlug: 8000,
      coolant: 0,
      brakePadFront: 24000,
      brakePadRear: 24000,
      tireFront: 48000,
      tireRear: 32000,
      brakeFluid: 24000,
      cvtClean: 0,
      chainLube: 500,
      chainAdjust: 2000
    },
    idealNoticeWindows: {
      engineOil: 500, gearOil: 0, vBelt: 0, rollerCVT: 0,
      airFilter: 2000, sparkPlug: 1000, coolant: 0, brakePadFront: 2000,
      brakePadRear: 2000, tireFront: 5000, tireRear: 4000, brakeFluid: 2000, cvtClean: 0
    },
    guide: {
      oilRecommendation: 'Yamalube 4ST 10W-40 JASO MA2 atau Motul 5100 10W-40 untuk performa lebih tinggi.',
      chainNote: 'R15 menggunakan rantai 428. Slack ideal 25-35 mm. Gunakan pelumas rantai O-ring.',
      fuelRecommendation: 'Pertamax (RON 92) minimum. Pertamax Turbo untuk sirkuit.',
      commonIssues: [
        'Posisi riding agresif — tidak nyaman untuk harian jarak jauh',
        'Lampu utama LED — jika redup, cek koneksi dan relay',
        'ABS: bleeding rem secara berkala'
      ]
    }
  },

  // ---------------------------------------------------------------------------
  // SUZUKI
  // ---------------------------------------------------------------------------
  {
    id: 'suzuki-address-2021',
    brand: 'Suzuki',
    model: 'Address (2021)',
    type: 'matic',
    badgeColor: '#1A5276',
    engine: '113 cc, SOHC, SEP, 1 silinder',
    tankCapacity: 5.2,
    engineOilCapacity: 0.8,
    engineOilSpec: 'SAE 10W-40 JASO MB (Suzuki Ecstar)',
    gearOilCapacity: 90,
    hasRadiator: false,
    hasCVT: true,
    tirePressureFront: { solo: 29, duo: 29 },
    tirePressureRear: { solo: 29, duo: 33 },
    sparkPlug: 'NGK CR7E',
    battery: 'YTZ5S (12V 4Ah)',
    frontTireSize: '80/90-14 M/C 40P',
    rearTireSize: '90/90-14 M/C 46P',
    serviceIntervals: {
      engineOil: 2500,
      gearOil: 10000,
      vBelt: 25000,
      rollerCVT: 25000,
      airFilter: 15000,
      sparkPlug: 10000,
      coolant: 0,
      brakePadFront: 24000,
      brakePadRear: 24000,
      tireFront: 48000,
      tireRear: 32000,
      brakeFluid: 24000,
      cvtClean: 10000,
      chainLube: 0,
      chainAdjust: 0
    },
    idealNoticeWindows: {
      engineOil: 500, gearOil: 1500, vBelt: 2500, rollerCVT: 2500,
      airFilter: 2000, sparkPlug: 1500, coolant: 0, brakePadFront: 2000,
      brakePadRear: 2000, tireFront: 5000, tireRear: 4000, brakeFluid: 2000, cvtClean: 1500
    },
    guide: {
      oilRecommendation: 'Suzuki Ecstar 10W-40 JASO MB atau Motul Scooter LE 10W-40.',
      cvtNote: 'Address 125 menggunakan CVT yang cukup andal. Periksa kondisi v-belt dan roller setiap 10.000 km.',
      fuelRecommendation: 'Pertamax atau Pertalite.',
      commonIssues: [
        'Starter elektrik lemah — cek aki',
        'Klakson lemah — bisa upgrade',
        'Panel instrumen analog — tidak ada MIL indikator, pantau kondisi fisik'
      ]
    }
  },

  {
    id: 'suzuki-nex2-2021',
    brand: 'Suzuki',
    model: 'Nex II (2021)',
    type: 'matic',
    badgeColor: '#1A5276',
    engine: '113 cc, SOHC, SEP, 1 silinder',
    tankCapacity: 4.2,
    engineOilCapacity: 0.8,
    engineOilSpec: 'SAE 10W-40 JASO MB (Suzuki Ecstar)',
    gearOilCapacity: 90,
    hasRadiator: false,
    hasCVT: true,
    tirePressureFront: { solo: 29, duo: 29 },
    tirePressureRear: { solo: 29, duo: 33 },
    sparkPlug: 'NGK CR7E',
    battery: 'YTZ5S (12V 4Ah)',
    frontTireSize: '80/90-14 M/C 40P',
    rearTireSize: '90/90-14 M/C 46P',
    serviceIntervals: {
      engineOil: 2500,
      gearOil: 10000,
      vBelt: 25000,
      rollerCVT: 25000,
      airFilter: 15000,
      sparkPlug: 10000,
      coolant: 0,
      brakePadFront: 24000,
      brakePadRear: 24000,
      tireFront: 48000,
      tireRear: 32000,
      brakeFluid: 24000,
      cvtClean: 10000,
      chainLube: 0,
      chainAdjust: 0
    },
    idealNoticeWindows: {
      engineOil: 500, gearOil: 1500, vBelt: 2500, rollerCVT: 2500,
      airFilter: 2000, sparkPlug: 1500, coolant: 0, brakePadFront: 2000,
      brakePadRear: 2000, tireFront: 5000, tireRear: 4000, brakeFluid: 2000, cvtClean: 1500
    },
    guide: {
      oilRecommendation: 'Suzuki Ecstar 10W-40 JASO MB.',
      cvtNote: 'Nex II sangat ringan. CVT compact, perawatan rutin cegah masalah.',
      fuelRecommendation: 'Pertalite atau Pertamax.',
      commonIssues: [
        'Karburator kotor — bersihkan setiap 15.000 km',
        'Lampu belakang bohlam — ganti ke LED untuk daya tahan lebih lama',
        'Suspensi belakang single — perhatikan keausan'
      ]
    }
  },

  {
    id: 'suzuki-burgman-street-125-2022',
    brand: 'Suzuki',
    model: 'Burgman Street 125 (2022)',
    type: 'matic',
    badgeColor: '#1A5276',
    engine: '124 cc, SOHC, SEP, 1 silinder',
    tankCapacity: 5.5,
    engineOilCapacity: 0.9,
    engineOilSpec: 'SAE 10W-40 JASO MB (Suzuki Ecstar)',
    gearOilCapacity: 100,
    hasRadiator: false,
    hasCVT: true,
    tirePressureFront: { solo: 29, duo: 29 },
    tirePressureRear: { solo: 33, duo: 36 },
    sparkPlug: 'NGK CR7E',
    battery: 'YTZ7S (12V 6Ah)',
    frontTireSize: '90/80-14 M/C 49P',
    rearTireSize: '100/80-14 M/C 54P',
    serviceIntervals: {
      engineOil: 3000,
      gearOil: 10000,
      vBelt: 25000,
      rollerCVT: 25000,
      airFilter: 15000,
      sparkPlug: 10000,
      coolant: 0,
      brakePadFront: 24000,
      brakePadRear: 24000,
      tireFront: 48000,
      tireRear: 32000,
      brakeFluid: 24000,
      cvtClean: 10000,
      chainLube: 0,
      chainAdjust: 0
    },
    idealNoticeWindows: {
      engineOil: 500, gearOil: 1500, vBelt: 2500, rollerCVT: 2500,
      airFilter: 2000, sparkPlug: 1500, coolant: 0, brakePadFront: 2000,
      brakePadRear: 2000, tireFront: 5000, tireRear: 4000, brakeFluid: 2000, cvtClean: 1500
    },
    guide: {
      oilRecommendation: 'Suzuki Ecstar 10W-40 JASO MB atau Motul 5100 Matic.',
      cvtNote: 'Burgman bergaya maxi-scooter. CVT berperforma halus. Ganti v-belt dan roller tepat waktu.',
      fuelRecommendation: 'Pertamax untuk kenyamanan berkendara.',
      commonIssues: [
        'Dimensi lebar — perhatikan saat parkir di tempat sempit',
        'Bagasi besar namun posisi pengisian bahan bakar di depan — teliti saat isi BBM',
        'Panel digital — servis di bengkel resmi Suzuki'
      ]
    }
  },

  // ---------------------------------------------------------------------------
  // KAWASAKI
  // ---------------------------------------------------------------------------
  {
    id: 'kawasaki-klx150-2021',
    brand: 'Kawasaki',
    model: 'KLX 150 (2021)',
    type: 'trail',
    badgeColor: '#006400',
    engine: '144 cc, SOHC, 1 silinder',
    tankCapacity: 7.5,
    engineOilCapacity: 1.1,
    engineOilSpec: 'SAE 10W-40 JASO MA (Kawasaki Genuine Oil)',
    gearOilCapacity: 0,
    hasRadiator: false,
    hasCVT: false,
    tirePressureFront: { solo: 15, duo: 15 },
    tirePressureRear: { solo: 15, duo: 18 },
    sparkPlug: 'NGK CR7E',
    battery: 'YTX5L-BS (12V 4Ah)',
    frontTireSize: '70/100-19 M/C 42M',
    rearTireSize: '90/100-16 M/C 51M',
    serviceIntervals: {
      engineOil: 2000,
      gearOil: 0,
      vBelt: 0,
      rollerCVT: 0,
      airFilter: 8000,
      sparkPlug: 8000,
      coolant: 0,
      brakePadFront: 16000,
      brakePadRear: 16000,
      tireFront: 24000,
      tireRear: 16000,
      brakeFluid: 16000,
      cvtClean: 0,
      chainLube: 300,
      chainAdjust: 1000
    },
    idealNoticeWindows: {
      engineOil: 500, gearOil: 0, vBelt: 0, rollerCVT: 0,
      airFilter: 1000, sparkPlug: 1000, coolant: 0, brakePadFront: 2000,
      brakePadRear: 2000, tireFront: 3000, tireRear: 2000, brakeFluid: 2000, cvtClean: 0
    },
    guide: {
      oilRecommendation: 'Kawasaki Genuine Oil 10W-40 JASO MA atau Motul 7100 10W-40.',
      chainNote: 'KLX 150 trail sejati — bersihkan rantai setiap 300 km, lumasi, dan cek slack 35-45 mm.',
      fuelRecommendation: 'Pertalite atau Pertamax.',
      commonIssues: [
        'Karburator kotor setelah off-road berlumpur — bersihkan segera',
        'Suspensi perlu upgrade untuk rider berat >80 kg',
        'Rantai dan sproket cepat aus di medan berat'
      ]
    }
  },

  {
    id: 'kawasaki-w175-2022',
    brand: 'Kawasaki',
    model: 'W175 (2022)',
    type: 'sport',
    badgeColor: '#006400',
    engine: '177 cc, SOHC, 1 silinder',
    tankCapacity: 13.0,
    engineOilCapacity: 1.4,
    engineOilSpec: 'SAE 20W-50 JASO MA (Kawasaki Genuine Oil)',
    gearOilCapacity: 0,
    hasRadiator: false,
    hasCVT: false,
    tirePressureFront: { solo: 29, duo: 29 },
    tirePressureRear: { solo: 33, duo: 40 },
    sparkPlug: 'NGK CR7E',
    battery: 'YTX7L-BS (12V 6Ah)',
    frontTireSize: '90/90-19 M/C 52S',
    rearTireSize: '110/90-18 M/C 61S',
    serviceIntervals: {
      engineOil: 3000,
      gearOil: 0,
      vBelt: 0,
      rollerCVT: 0,
      airFilter: 15000,
      sparkPlug: 10000,
      coolant: 0,
      brakePadFront: 24000,
      brakePadRear: 24000,
      tireFront: 48000,
      tireRear: 32000,
      brakeFluid: 24000,
      cvtClean: 0,
      chainLube: 500,
      chainAdjust: 2000
    },
    idealNoticeWindows: {
      engineOil: 500, gearOil: 0, vBelt: 0, rollerCVT: 0,
      airFilter: 2000, sparkPlug: 1500, coolant: 0, brakePadFront: 2000,
      brakePadRear: 2000, tireFront: 5000, tireRear: 4000, brakeFluid: 2000, cvtClean: 0
    },
    guide: {
      oilRecommendation: 'Kawasaki Genuine Oil 20W-50 JASO MA. W175 menggunakan spesifikasi SAE 20W-50 yang lebih kental.',
      chainNote: 'W175 bergaya klasik British. Rantai konvensional — lumasi setiap 500 km, cek slack 20-30 mm.',
      fuelRecommendation: 'Pertamax atau Pertalite.',
      commonIssues: [
        'Karburator — perlu setel ulang di dataran tinggi',
        'Desain klasik — sparepart aftermarket terbatas',
        'Ground clearance rendah untuk jalan rusak'
      ]
    }
  },

  // ---------------------------------------------------------------------------
  // TEMPLATE CUSTOM / LAINNYA
  // ---------------------------------------------------------------------------
  {
    id: 'custom-motor-template',
    brand: 'Custom',
    model: 'Motor Lainnya',
    type: 'matic',
    badgeColor: '#888888',
    engine: '-',
    tankCapacity: 0,
    engineOilCapacity: 0,
    engineOilSpec: '-',
    gearOilCapacity: 0,
    hasRadiator: false,
    hasCVT: false,
    tirePressureFront: { solo: 29, duo: 29 },
    tirePressureRear: { solo: 29, duo: 33 },
    sparkPlug: '-',
    battery: '-',
    frontTireSize: '-',
    rearTireSize: '-',
    serviceIntervals: {
      engineOil: 2000,
      gearOil: 0,
      vBelt: 0,
      rollerCVT: 0,
      airFilter: 16000,
      sparkPlug: 8000,
      coolant: 0,
      brakePadFront: 24000,
      brakePadRear: 24000,
      tireFront: 48000,
      tireRear: 32000,
      brakeFluid: 24000,
      cvtClean: 0,
      chainLube: 0,
      chainAdjust: 0
    },
    idealNoticeWindows: {
      engineOil: 500, gearOil: 0, vBelt: 0, rollerCVT: 0,
      airFilter: 2000, sparkPlug: 1000, coolant: 0, brakePadFront: 2000,
      brakePadRear: 2000, tireFront: 5000, tireRear: 4000, brakeFluid: 2000, cvtClean: 0
    },
    guide: {
      oilRecommendation: 'Sesuaikan dengan buku manual kendaraan Anda.',
      cvtNote: 'Sesuaikan dengan buku manual kendaraan Anda.',
      fuelRecommendation: 'Sesuaikan dengan rekomendasi pabrikan.',
      commonIssues: []
    }
  }

];

// =============================================================================
// FUEL TYPES
// =============================================================================
const FUEL_TYPES = [
  { id: 'pertalite',       name: 'Pertalite',          octane: 90,   brand: 'Pertamina',   color: '#00AA00' },
  { id: 'pertamax',        name: 'Pertamax',            octane: 92,   brand: 'Pertamina',   color: '#0066CC' },
  { id: 'pertamax-turbo',  name: 'Pertamax Turbo',      octane: 98,   brand: 'Pertamina',   color: '#CC0000' },
  { id: 'dexlite',         name: 'Dexlite',             octane: null, brand: 'Pertamina',   color: '#FF8800', cetane: 51 },
  { id: 'biosolar',        name: 'Biosolar',            octane: null, brand: 'Pertamina',   color: '#228B22', cetane: 48 },
  { id: 'shell-super',     name: 'Shell Super',         octane: 92,   brand: 'Shell',       color: '#FFD700' },
  { id: 'shell-vpower',    name: 'Shell V-Power',       octane: 95,   brand: 'Shell',       color: '#CC0000' },
  { id: 'bp-92',           name: 'BP 92',               octane: 92,   brand: 'BP',          color: '#007A33' },
  { id: 'bp-ultimate',     name: 'BP Ultimate',         octane: 98,   brand: 'BP',          color: '#003399' },
  { id: 'vivo-revvo92',    name: 'Vivo Revvo 92',       octane: 92,   brand: 'Vivo',        color: '#FF4500' },
  { id: 'vivo-revvo95',    name: 'Vivo Revvo 95',       octane: 95,   brand: 'Vivo',        color: '#CC2200' }
];

// =============================================================================
// COMPONENT DEFINITIONS — 15 Komponen
// =============================================================================
const COMPONENT_DEFINITIONS = [
  {
    key: 'engineOil',
    name: 'Oli Mesin',
    category: 'pelumas',
    icon: 'Droplets',
    defaultInterval: 2000,
    unit: 'km',
    description: 'Oli mesin melumasi, mendinginkan, dan membersihkan bagian dalam mesin. Ganti secara berkala sesuai interval yang dianjurkan.',
    symptoms: ['Mesin kasar / ngorok', 'Tarikan berat', 'Suhu mesin naik', 'Bau oli terbakar', 'Warna oli hitam pekat'],
    criticalKm: 4000,
    appliesToType: ['all']
  },
  {
    key: 'gearOil',
    name: 'Oli Gardan / Transmisi',
    category: 'pelumas',
    icon: 'Settings',
    defaultInterval: 8000,
    unit: 'km',
    description: 'Oli gardan melumasi gigi transmisi pada motor matic. Ganti sesuai interval untuk mencegah keausan gigi.',
    symptoms: ['Suara denging dari gardan', 'Transmisi terasa kasar', 'Kebocoran oli gardan'],
    criticalKm: 16000,
    appliesToType: ['matic']
  },
  {
    key: 'vBelt',
    name: 'V-Belt CVT',
    category: 'cvt',
    icon: 'CircleDot',
    defaultInterval: 24000,
    unit: 'km',
    description: 'V-Belt adalah komponen utama CVT yang menghubungkan puli primer dan sekunder. Ganti sesuai interval untuk mencegah putus di jalan.',
    symptoms: ['Selip saat akselerasi', 'Suara berdecit dari CVT', 'Tarikan loyo', 'Akselerasi tidak responsif'],
    criticalKm: 32000,
    appliesToType: ['matic']
  },
  {
    key: 'rollerCVT',
    name: 'Roller CVT',
    category: 'cvt',
    icon: 'Circle',
    defaultInterval: 24000,
    unit: 'km',
    description: 'Roller CVT menentukan rasio transmisi. Roller yang sudah oval menyebabkan akselerasi kasar dan tidak linier.',
    symptoms: ['Getaran saat akselerasi awal', 'Tarikan terasa menghentak', 'Suara berisik dari ruang CVT'],
    criticalKm: 32000,
    appliesToType: ['matic']
  },
  {
    key: 'airFilter',
    name: 'Filter Udara',
    category: 'mesin',
    icon: 'Wind',
    defaultInterval: 16000,
    unit: 'km',
    description: 'Filter udara mencegah kotoran masuk ke mesin. Filter kotor mengurangi performa dan efisiensi bahan bakar.',
    symptoms: ['Mesin brebet', 'Konsumsi BBM boros', 'Tenaga mesin turun', 'Asap knalpot hitam'],
    criticalKm: 24000,
    appliesToType: ['all']
  },
  {
    key: 'sparkPlug',
    name: 'Busi',
    category: 'pengapian',
    icon: 'Zap',
    defaultInterval: 8000,
    unit: 'km',
    description: 'Busi menghasilkan percikan api untuk membakar campuran bahan bakar. Busi aus menyebabkan mesin susah hidup dan boros BBM.',
    symptoms: ['Mesin susah hidup', 'Idle kasar', 'Konsumsi BBM boros', 'Tenaga mesin berkurang', 'Mesin mati mendadak'],
    criticalKm: 16000,
    appliesToType: ['all']
  },
  {
    key: 'coolant',
    name: 'Cairan Pendingin (Coolant)',
    category: 'pendingin',
    icon: 'Thermometer',
    defaultInterval: 24000,
    unit: 'km',
    description: 'Coolant menjaga suhu mesin dengan radiator. Hanya untuk motor berpendingin cairan. Ganti setiap 2 tahun atau sesuai interval.',
    symptoms: ['Overheat', 'Lampu indikator suhu menyala', 'Coolant berubah warna', 'Kebocoran sistem pendingin'],
    criticalKm: 48000,
    appliesToType: ['matic', 'sport', 'trail']
  },
  {
    key: 'brakePadFront',
    name: 'Kampas Rem Depan',
    category: 'rem',
    icon: 'Disc',
    defaultInterval: 24000,
    unit: 'km',
    description: 'Kampas rem depan (cakram) memberikan daya pengereman utama. Ganti sebelum mencapai batas ketebalan minimum.',
    symptoms: ['Rem tidak pakem', 'Suara berdecit saat rem', 'Getaran saat pengereman', 'Kampas tipis (< 2mm)'],
    criticalKm: 32000,
    appliesToType: ['all']
  },
  {
    key: 'brakePadRear',
    name: 'Kampas Rem Belakang',
    category: 'rem',
    icon: 'Disc',
    defaultInterval: 24000,
    unit: 'km',
    description: 'Kampas rem belakang (tromol atau cakram). Periksa secara berkala, biasanya lebih awet dari rem depan.',
    symptoms: ['Rem belakang tidak pakem', 'Suara berdecit / gesekan logam', 'Jarak pengereman memanjang'],
    criticalKm: 32000,
    appliesToType: ['all']
  },
  {
    key: 'tireFront',
    name: 'Ban Depan',
    category: 'ban',
    icon: 'CircleDot',
    defaultInterval: 48000,
    unit: 'km',
    description: 'Ban depan memberikan traksi dan kemudi. Ganti saat kedalaman alur kurang dari 1,6 mm atau ada retak pada dinding ban.',
    symptoms: ['Alur ban habis', 'Dinding ban retak', 'Motor oleng', 'Tekanan tidak stabil (bocor halus)'],
    criticalKm: 60000,
    appliesToType: ['all']
  },
  {
    key: 'tireRear',
    name: 'Ban Belakang',
    category: 'ban',
    icon: 'CircleDot',
    defaultInterval: 32000,
    unit: 'km',
    description: 'Ban belakang menanggung beban lebih berat dan memberikan tenaga dorong. Biasanya lebih cepat aus dari ban depan.',
    symptoms: ['Alur ban habis lebih cepat', 'Motor slip saat akselerasi', 'Dinding ban benjol'],
    criticalKm: 48000,
    appliesToType: ['all']
  },
  {
    key: 'brakeFluid',
    name: 'Minyak Rem',
    category: 'rem',
    icon: 'Droplet',
    defaultInterval: 24000,
    unit: 'km',
    description: 'Minyak rem (DOT 3 atau DOT 4) meneruskan tekanan dari tuas rem ke kaliper. Ganti setiap 2 tahun karena minyak rem bersifat higroskopis.',
    symptoms: ['Rem terasa spons', 'Tuas rem dalam', 'Warna minyak rem gelap / kotor', 'Kebocoran sistem rem'],
    criticalKm: 48000,
    appliesToType: ['all']
  },
  {
    key: 'cvtClean',
    name: 'Pembersihan CVT',
    category: 'cvt',
    icon: 'Wrench',
    defaultInterval: 8000,
    unit: 'km',
    description: 'Pembersihan ruang CVT dari kotoran, debu, dan sisa gesekan kampas ganda. Penting untuk menjaga kinerja transmisi.',
    symptoms: ['Suara berisik dari ruang CVT', 'Tarikan kasar', 'Kampas ganda kotor', 'Debu berlebih di ruang CVT'],
    criticalKm: 16000,
    appliesToType: ['matic']
  },
  {
    key: 'chainLube',
    name: 'Pelumasan Rantai',
    category: 'transmisi',
    icon: 'Link',
    defaultInterval: 500,
    unit: 'km',
    description: 'Pelumasan rantai mencegah karat dan keausan. Gunakan chain lube khusus, bukan oli mesin atau WD-40.',
    symptoms: ['Rantai berbunyi krik-krik', 'Rantai terlihat kering / berkarat', 'Tarikan tidak mulus'],
    criticalKm: 1000,
    appliesToType: ['sport', 'trail', 'bebek']
  },
  {
    key: 'chainAdjust',
    name: 'Penyetelan Rantai',
    category: 'transmisi',
    icon: 'SlidersHorizontal',
    defaultInterval: 2000,
    unit: 'km',
    description: 'Penyetelan kekenduran rantai (slack). Rantai terlalu kendur atau terlalu kencang sama-sama berbahaya.',
    symptoms: ['Rantai terlalu kendur (> 40 mm slack)', 'Suara rantai memukul mesin', 'Getaran berlebih', 'Perpindahan gigi kasar'],
    criticalKm: 4000,
    appliesToType: ['sport', 'trail', 'bebek']
  }
];

// =============================================================================
// SERVICE PACKAGES
// =============================================================================
const SERVICE_PACKAGES = {
  ringan: {
    id: 'ringan',
    name: 'Servis Ringan',
    description: 'Perawatan rutin harian: ganti oli mesin, cek dan setel komponen dasar.',
    icon: 'Wrench',
    estimatedTime: '30-60 menit',
    recommendedInterval: 2000,
    components: ['engineOil', 'sparkPlug'],
    checklistItems: [
      'Ganti oli mesin',
      'Cek dan bersihkan busi',
      'Cek tekanan angin ban',
      'Cek lampu-lampu',
      'Cek dan setel rem',
      'Cek kabel gas dan kopling',
      'Cek level minyak rem',
      'Cek aki',
      'Pelumasan rantai (motor bebek/sport)'
    ],
    estimatedCost: { min: 50000, max: 150000, currency: 'IDR' }
  },
  besar: {
    id: 'besar',
    name: 'Servis Besar',
    description: 'Perawatan menyeluruh termasuk semua komponen wajib ganti berkala.',
    icon: 'Settings',
    estimatedTime: '2-4 jam',
    recommendedInterval: 8000,
    components: ['engineOil', 'gearOil', 'airFilter', 'sparkPlug', 'brakeFluid'],
    checklistItems: [
      'Semua item servis ringan',
      'Ganti oli mesin',
      'Ganti oli gardan (matic)',
      'Ganti atau bersihkan filter udara',
      'Ganti busi',
      'Ganti minyak rem',
      'Cek dan bersihkan throttle body / karburator',
      'Cek bearing roda',
      'Cek dan setel rantai / cek CVT',
      'Cek suspensi',
      'Cek sistem pendingin (jika ada)',
      'Bersihkan area mesin'
    ],
    estimatedCost: { min: 250000, max: 600000, currency: 'IDR' }
  },
  cvt_check: {
    id: 'cvt_check',
    name: 'Servis CVT',
    description: 'Pemeriksaan dan perawatan sistem CVT secara menyeluruh untuk motor matic.',
    icon: 'CircleDot',
    estimatedTime: '1-2 jam',
    recommendedInterval: 8000,
    components: ['vBelt', 'rollerCVT', 'cvtClean', 'gearOil'],
    checklistItems: [
      'Buka dan bersihkan ruang CVT',
      'Periksa kondisi v-belt (retak, aus, lebar)',
      'Periksa dan ukur roller CVT (keoalan)',
      'Periksa kampas ganda',
      'Periksa puli primer dan sekunder',
      'Bersihkan semua kotoran di ruang CVT',
      'Pasang kembali dan uji coba',
      'Ganti oli gardan'
    ],
    appliesToType: ['matic'],
    estimatedCost: { min: 100000, max: 350000, currency: 'IDR' }
  },
  chain_check: {
    id: 'chain_check',
    name: 'Servis Rantai & Transmisi',
    description: 'Pemeriksaan, pembersihan, dan penyetelan rantai untuk motor bebek, sport, dan trail.',
    icon: 'Link',
    estimatedTime: '30-60 menit',
    recommendedInterval: 2000,
    components: ['chainLube', 'chainAdjust'],
    checklistItems: [
      'Bersihkan rantai dari kotoran dan karat',
      'Ukur elongasi rantai',
      'Lumasi rantai dengan chain lube',
      'Setel kekenduran rantai (slack)',
      'Periksa kondisi sproket depan dan belakang',
      'Periksa master link',
      'Cek alignment roda belakang'
    ],
    appliesToType: ['sport', 'trail', 'bebek'],
    estimatedCost: { min: 30000, max: 150000, currency: 'IDR' }
  }
};

// =============================================================================
// SEED DATA — Default kosong, tidak ada motor preloaded
// =============================================================================
const SEED_DATA = {
  motors: [],
  version: '2.0.0',
  lastUpdated: '2024-01-01'
};

// =============================================================================
// END data_v2.js
