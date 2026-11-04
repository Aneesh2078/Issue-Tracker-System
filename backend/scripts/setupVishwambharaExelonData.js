require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Issue = require('../models/Issue');
const Comment = require('../models/Comment');

async function setupVishwambharaExelonData() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[DB] Connected to MongoDB Atlas');

  // Fetch users
  const admin = await User.findOne({ email: 'admin@exelon.com' });
  const john  = await User.findOne({ email: 'john.smith@exelon.com' });
  const jane  = await User.findOne({ email: 'jane.doe@exelon.com' });

  // Ensure vishwambhara@exelon.com exists with correct password
  let vish = await User.findOne({ email: 'vishwambhara@exelon.com' });
  if (!vish) {
    vish = await User.create({
      name: 'Vishwambhara B.K',
      email: 'vishwambhara@exelon.com',
      password: 'User@12345',
      role: 'user',
      isActive: true
    });
    console.log('  ✓ Created: vishwambhara@exelon.com');
  } else {
    vish.name = 'Vishwambhara B.K';
    vish.role = 'user';
    vish.isActive = true;
    vish.password = 'User@12345';
    vish.markModified('password');
    await vish.save();
    console.log('  ✓ Password verified: vishwambhara@exelon.com / User@12345');
  }

  // Remove any old EX-3xxx issues + orphan comments
  await Issue.deleteMany({ issueNumber: /^EX-3/ });
  console.log('  ✓ Cleared old EX-3xxx issues');

  // ═════════════════════════════════════════════════════════════
  // 12 issues: 6 Open | 4 In Progress | 2 Closed
  // EX-3001 to EX-3012  — all Hardware/Firmware/PCB domain
  // ═════════════════════════════════════════════════════════════
  const issues = [

    // ─────────────────── 6 OPEN ISSUES ───────────────────────
    {
      issueNumber: 'EX-3001',
      title: 'Oscillator startup failure on cold boot below -20°C on TCXO XO-32-C2 module',
      description:
        'The TCXO oscillator (XO-32-C2) fails to start within the required 5ms startup window on cold boots at temperatures below -20°C. The STM32 MCU proceeds before the clock is stable, causing system hang.\n\n' +
        'Steps to Reproduce:\n' +
        '1. Place board in climate chamber at -25°C for 30 minutes.\n' +
        '2. Apply 3.3V power and observe MCU startup via UART debug port.\n' +
        '3. UART shows garbled output — PLL locks before TCXO output is stable.\n\n' +
        'Impact: All units intended for cold-chain (-30°C) deployment fail field startup.\n\n' +
        'Proposed Fix: Add a 10ms hardware delay via RC circuit on MCU NRST pin, allowing TCXO to stabilize before MCU exits reset state.',
      priority: 'Critical',
      status: 'Open',
      createdBy: vish._id,
      assignedTo: vish._id
    },
    {
      issueNumber: 'EX-3002',
      title: 'Firmware over-the-air (FOTA) update corrupts application image on 10% of devices',
      description:
        'During FOTA rollout of firmware v3.5.0, 10% of field devices (batch deployed Nov 2026) reported boot failure after update. OTA agent reported successful write but CRC verification of flash memory shows corrupted sectors.\n\n' +
        'Root Cause Investigation:\n' +
        'Flash write operations are interrupted by ADC DMA bursts competing for the same AHB bus matrix bandwidth. This causes incomplete page writes in certain sectors.\n\n' +
        'Proposed Fix: Suspend ADC DMA during FOTA flash write operations using HAL_ADC_Stop_DMA() before each 256-byte flash page write sequence.',
      priority: 'Critical',
      status: 'Open',
      createdBy: admin._id,
      assignedTo: vish._id
    },
    {
      issueNumber: 'EX-3003',
      title: 'Hall-effect current sensor ACS712 output offset drift exceeding ±50mV after 500 hours',
      description:
        'Field telemetry from units deployed for over 500 operational hours shows the ACS712 current sensor output voltage drifting from 2.500V (zero-current baseline) to 2.552V, introducing a systematic 2.6A measurement error.\n\n' +
        'Likely Cause: Self-heating of the ACS712 internal sense resistor changes the quiescent output voltage over time, particularly in high-ambient-temperature environments.\n\n' +
        'Proposed Fix: Implement a periodic auto-zero calibration routine in firmware that samples the sensor output during confirmed zero-load intervals and updates the digital offset correction table.',
      priority: 'High',
      status: 'Open',
      createdBy: vish._id,
      assignedTo: vish._id
    },
    {
      issueNumber: 'EX-3004',
      title: 'PCB warpage exceeding 0.75% bow and twist on 6-layer FR4 board after reflow',
      description:
        'Post-reflow bow and twist measurement using IPC-TM-650 Method 2.4.22 shows PCB warpage of 0.82% on the 6-layer FR4 board (200mm × 150mm). IPC-A-610 Class 3 maximum allowable is 0.75% for SMT boards.\n\n' +
        'Root Cause: Asymmetric copper distribution between top and bottom layers creates uneven CTE mismatch during reflow thermal cycling.\n\n' +
        'Proposed Fix: Add copper balance fills on bottom layers 5 and 6 to match the copper density of layers 1 and 2 (target: within 10% copper weight differential).',
      priority: 'Medium',
      status: 'Open',
      createdBy: vish._id,
      assignedTo: vish._id
    },
    {
      issueNumber: 'EX-3005',
      title: 'SPI Flash W25Q128 read corruption when supply voltage droops below 2.7V during peak load',
      description:
        'During simultaneous MCU core active computation and SPI flash read operations, the 3.3V supply rail droops to 2.65V. The W25Q128 SPI Flash requires a minimum 2.7V for reliable read operations, causing data corruption on 1 in 10,000 reads.\n\n' +
        'Steps to Reproduce:\n' +
        '1. Run intensive FFT computation on MCU core (100% CPU utilization).\n' +
        '2. Simultaneously initiate a 256-byte SPI flash read on CS1.\n' +
        '3. Compare read data with known golden reference — 0.01% byte errors observed.\n\n' +
        'Proposed Fix: Add a 100µF bulk electrolytic capacitor and 10µF ceramic decoupling capacitor directly on the W25Q128 VCC pin.',
      priority: 'High',
      status: 'Open',
      createdBy: vish._id,
      assignedTo: vish._id
    },
    {
      issueNumber: 'EX-3006',
      title: 'Missing revision block on schematic page 7 for board revision 2.3 release',
      description:
        'Schematic page 7 (Power Distribution Architecture) for PCBA-EX-9200 board revision 2.3 is missing the standard revision block table with ECO numbers, revision dates, and engineer sign-off fields.\n\n' +
        'This violates the internal engineering document control procedure PROC-DES-012 Section 4.2 and must be rectified before submission to the external contract manufacturer.',
      priority: 'Low',
      status: 'Open',
      createdBy: vish._id,
      assignedTo: vish._id
    },

    // ─────────────── 4 IN PROGRESS ISSUES ────────────────────
    {
      issueNumber: 'EX-3007',
      title: 'Switching noise from DC-DC converter coupling into precision op-amp signal chain',
      description:
        'The 500kHz switching frequency of the LM5146 synchronous buck converter couples into the signal chain of the adjacent INA226 current sense amplifier via shared ground plane, introducing 8mV peak-to-peak noise on measured outputs.\n\n' +
        'This exceeds the 2mV noise budget for the precision measurement subsystem.\n\n' +
        'Current Action: Adding ground plane split between switcher and analog signal sections with a single-point ground bridge. Installing pi-filter (10µH + 10µF) on INA226 power supply pin.',
      priority: 'Critical',
      status: 'In Progress',
      createdBy: vish._id,
      assignedTo: vish._id
    },
    {
      issueNumber: 'EX-3008',
      title: 'I2S audio codec initialization fails randomly on power-up — requires 3–5 retries',
      description:
        'The WM8960 audio codec fails I2S initialization via I2C register configuration on first power-up in approximately 30% of cold-boot sequences. The host MCU must retry the codec initialization loop 3–5 times before the codec becomes responsive.\n\n' +
        'Likely Cause: Codec internal power-on-reset sequence requires 10ms minimum before I2C registers are accessible. Current firmware begins I2C initialization 6ms after codec power-enable GPIO assertion.\n\n' +
        'Current Action: Increasing firmware delay from 6ms to 15ms after CODEC_EN GPIO assertion and adding I2C ACK polling loop to confirm readiness.',
      priority: 'High',
      status: 'In Progress',
      createdBy: admin._id,
      assignedTo: vish._id
    },
    {
      issueNumber: 'EX-3009',
      title: 'Differential pair impedance mismatch on USB 2.0 high-speed traces — TDR shows 42Ω',
      description:
        'TDR (Time Domain Reflectometry) measurement of the USB 2.0 HS differential pair traces (D+/D-) on board revision 2.2 shows a characteristic impedance of 42Ω instead of the required 90Ω ±10%.\n\n' +
        'The USB protocol requires 90Ω differential impedance. The 42Ω mismatch causes signal reflections that fail USB 2.0 High Speed eye diagram compliance testing.\n\n' +
        'Current Action: Recalculating trace width and spacing for inner layer 2 (prepreg Er=4.2, 0.1mm substrate). PCB revision 2.3 layout in progress with corrected USB trace geometry (W=0.15mm, S=0.18mm).',
      priority: 'High',
      status: 'In Progress',
      createdBy: vish._id,
      assignedTo: vish._id
    },
    {
      issueNumber: 'EX-3010',
      title: 'Bootloader fails to verify firmware signature when RSA-2048 key is stored in external OTP flash',
      description:
        'The secure boot verification step fails when the RSA-2048 public key is read from external OTP flash (DS28E16) over 1-Wire protocol. Verification passes when the key is hardcoded in internal MCU flash.\n\n' +
        'Root Cause Investigation: 1-Wire read timing is sensitive to CPU clock jitter. At system frequencies above 160MHz, 1-Wire bit timing resolution is insufficient, causing occasional byte read errors that corrupt the 256-byte public key.\n\n' +
        'Current Action: Implementing bit-bang 1-Wire driver with microsecond-accurate delay using DWT cycle counter instead of SysTick timer.',
      priority: 'Critical',
      status: 'In Progress',
      createdBy: vish._id,
      assignedTo: vish._id
    },

    // ─────────────────── 2 CLOSED ISSUES ─────────────────────
    {
      issueNumber: 'EX-3011',
      title: 'LCD backlight driver TPS61165 entering shutdown on high-brightness sustained illumination',
      description:
        'The TPS61165 LCD backlight driver IC enters thermal shutdown after 45 minutes of sustained maximum-brightness operation (100% PWM duty cycle), causing display blackout.\n\n' +
        'Root Cause: TPS61165 junction temperature exceeded 150°C due to insufficient thermal path. The IC is placed on the top layer with no copper pour connected to the exposed pad.\n\n' +
        'Resolution:\n' +
        '1. Added 20 × 0.3mm thermal vias beneath TPS61165 exposed pad connecting to inner ground copper pour.\n' +
        '2. Added 400mm² copper pour on bottom layer beneath the IC location.\n' +
        '3. Thermal simulation (Ansys Icepak): Junction temperature at 100% brightness now 94°C. Verified over 8 hours of continuous operation at 25°C ambient. Verified closed.',
      priority: 'High',
      status: 'Closed',
      createdBy: vish._id,
      assignedTo: vish._id
    },
    {
      issueNumber: 'EX-3012',
      title: 'RS-232 level translator SP3232 output stuck at +5.4V when powered from 3.0V rail',
      description:
        'The SP3232 RS-232 level translator generates an output of +5.4V on the RS-232 TX line when powered from a 3.0V supply instead of the rated 3.3V. This exceeds the RS-232 EIA/TIA-232 output voltage specification of ±5V maximum.\n\n' +
        'Root Cause: Charge pump capacitors C21 and C22 (100nF) were undersized for the 3.0V supply rail, causing the charge pump to overcharge and exceed the regulated output clamp threshold.\n\n' +
        'Resolution:\n' +
        '1. Replaced C21 and C22 with 220nF charge pump capacitors as specified in the SP3232 datasheet Table 1 for sub-3.3V operation.\n' +
        '2. Measured RS-232 TX output: now ±4.8V at 3.0V supply, within EIA/TIA-232 specification.\n' +
        '3. 100 units tested in environmental chamber across -20°C to +70°C. Zero output voltage violations observed. Verified closed.',
      priority: 'Medium',
      status: 'Closed',
      createdBy: vish._id,
      assignedTo: vish._id
    }
  ];

  const createdIssues = await Issue.insertMany(issues);
  console.log(`  ✓ Inserted ${createdIssues.length} issues for vishwambhara@exelon.com (EX-3001 to EX-3012)`);

  const issueMap = {};
  createdIssues.forEach((i) => { issueMap[i.issueNumber] = i; });

  // ─────────────────────────────────────────────────────────────
  // COMMENTS — Detailed activity threads
  // ─────────────────────────────────────────────────────────────
  const comments = [
    // EX-3001 (TCXO cold boot)
    { issue: issueMap['EX-3001']._id, user: vish._id, text: 'Reproduced at -25°C. UART shows "Clock Not Ready" debug flag set. RC delay circuit on NRST pin being prototyped on bench evaluation board.' },
    { issue: issueMap['EX-3001']._id, user: admin._id, text: 'Cold-chain deployment shipment put on hold. This is a Critical field defect. Prioritize RC delay fix and test on 20 boards before resuming shipment.' },

    // EX-3002 (FOTA corruption)
    { issue: issueMap['EX-3002']._id, user: vish._id, text: 'Identified AHB bus contention between DMA and flash write operations using STM32CubeMonitor trace tool. HAL_ADC_Stop_DMA() inserted before each flash page write in OTA agent firmware patch v3.5.1.' },
    { issue: issueMap['EX-3002']._id, user: admin._id, text: 'Test v3.5.1 on 50 devices before resuming field rollout. Confirm CRC passes on all 50 units before greenlighting the remaining fleet.' },

    // EX-3005 (SPI Flash corruption)
    { issue: issueMap['EX-3005']._id, user: vish._id, text: 'Added 100µF electrolytic bulk cap and 10µF X7R ceramic directly at W25Q128 VCC pin. Supply rail now holds above 2.85V during peak CPU + SPI concurrent load. Re-running 1 million read test cycles.' },

    // EX-3007 (Switcher noise coupling)
    { issue: issueMap['EX-3007']._id, user: vish._id, text: 'Ground plane split implemented with single-point bridge near connector J3. Pi-filter installed on INA226 VCC. Noise on signal chain reduced from 8mV to 1.4mV peak-to-peak. Continuing monitoring.' },
    { issue: issueMap['EX-3007']._id, user: admin._id, text: 'Good progress. 1.4mV is within the 2mV budget. Continue 48-hour thermal soak testing before closing this issue.' },

    // EX-3008 (I2S codec init failure)
    { issue: issueMap['EX-3008']._id, user: vish._id, text: 'Increased CODEC_EN delay from 6ms to 15ms and added I2C ACK polling with 50ms timeout. Cold boot success rate improved from 70% to 99.6% over 500 test boots.' },

    // EX-3009 (USB impedance mismatch)
    { issue: issueMap['EX-3009']._id, user: vish._id, text: 'PCB revision 2.3 layout complete with corrected USB trace geometry (W=0.15mm, S=0.18mm targeting 90Ω). Sent to PCBWay for prototype fabrication. Expected in 7 business days.' },
    { issue: issueMap['EX-3009']._id, user: admin._id, text: 'Mark issue blocked pending prototype delivery. Once boards arrive, run TDR and USB 2.0 HS eye diagram test before closing.' },

    // EX-3010 (Bootloader RSA signature)
    { issue: issueMap['EX-3010']._id, user: vish._id, text: 'Bit-bang 1-Wire driver implemented using DWT cycle counter. 1,000 consecutive RSA-2048 key reads verified with zero byte errors at 168MHz system clock. Running integration test with full secure boot sequence.' },

    // EX-3011 (LCD backlight shutdown - CLOSED)
    { issue: issueMap['EX-3011']._id, user: vish._id, text: 'Added 20 thermal vias and 400mm² copper pour on bottom layer beneath TPS61165. Thermal simulation shows 94°C junction temperature at 100% brightness. 8-hour continuous test passed. Closing issue.' },
    { issue: issueMap['EX-3011']._id, user: admin._id, text: 'Thermal verification report received. QA sign-off complete. Issue officially closed.' },

    // EX-3012 (RS-232 level translator - CLOSED)
    { issue: issueMap['EX-3012']._id, user: vish._id, text: '220nF charge pump caps soldered on 100 production units. RS-232 TX measures ±4.8V at 3.0V supply. Passed -20°C to +70°C environmental test on all 100 units. Verified closed.' },
    { issue: issueMap['EX-3012']._id, user: admin._id, text: 'Component change captured in BOM revision 4.2. Assembly drawing updated. Issue officially closed.' }
  ];

  await Comment.insertMany(comments);
  console.log(`  ✓ Inserted ${comments.length} detailed engineering comments!`);

  // Update counter
  await mongoose.connection.db.collection('counters').updateOne(
    { _id: 'issueNumber' },
    { $set: { seq: 3012, lastUpdated: new Date() } },
    { upsert: true }
  );
  console.log('  ✓ Counter updated to 3012 (next new issue via UI: EX-3013)');

  // Final verification
  const filter = { $or: [{ createdBy: vish._id }, { assignedTo: vish._id }] };
  const openCount = await Issue.countDocuments({ ...filter, status: 'Open' });
  const inProgressCount = await Issue.countDocuments({ ...filter, status: 'In Progress' });
  const closedCount = await Issue.countDocuments({ ...filter, status: 'Closed' });

  console.log('\n════════════════════════════════════════════════════');
  console.log(' VISHWAMBHARA EXELON DASHBOARD (vishwambhara@exelon.com)');
  console.log('════════════════════════════════════════════════════');
  console.log(`  Total Issues    : ${openCount + inProgressCount + closedCount}`);
  console.log(`  Open            : ${openCount}   (EX-3001 to EX-3006)`);
  console.log(`  In Progress     : ${inProgressCount}   (EX-3007 to EX-3010)`);
  console.log(`  Closed          : ${closedCount}   (EX-3011, EX-3012)`);
  console.log('  Login           : vishwambhara@exelon.com / User@12345');
  console.log('════════════════════════════════════════════════════\n');

  await mongoose.disconnect();
  process.exit(0);
}

setupVishwambharaExelonData().catch((err) => {
  console.error('[Error]:', err.message);
  process.exit(1);
});

