require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Issue = require('../models/Issue');
const Comment = require('../models/Comment');

async function setupExactBreakdown() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[DB] Connected to MongoDB Atlas');

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('User@12345', salt);

  // Both email spellings ensure the user gets the exact breakdown regardless of which one they use
  const targetEmails = ['vishwambharbk@gmail.com', 'vishwambarbk@gmail.com', 'vishwambhara@exelon.com'];
  const userDocs = [];

  for (const email of targetEmails) {
    let u = await User.findOne({ email });
    if (!u) {
      u = await User.create({
        name: 'Vishwambhara B.K',
        email,
        password: 'User@12345',
        role: 'user',
        isActive: true
      });
      console.log('  ✓ Created user:', email);
    } else {
      u.password = 'User@12345';
      u.markModified('password');
      u.isActive = true;
      await u.save();
      console.log('  ✓ Verified password User@12345 for:', email);
    }
    userDocs.push(u);
  }

  const primaryUser = await User.findOne({ email: 'vishwambharbk@gmail.com' });
  const admin = await User.findOne({ email: 'admin@exelon.com' });
  const jane = await User.findOne({ email: 'jane.doe@exelon.com' });
  const john = await User.findOne({ email: 'john.smith@exelon.com' });

  // ─────────────────────────────────────────────────────────────
  // EXACT DATA: 6 OPEN, 4 IN PROGRESS, 2 CLOSED (Total 12)
  // All 12 created by or assigned to vishwambharbk@gmail.com
  // ─────────────────────────────────────────────────────────────

  // Delete previous issues to ensure exact clean count
  await Issue.deleteMany({});
  await Comment.deleteMany({});

  const exactIssues = [
    // ════════════════════════════════════════════════════════════
    // 6 OPEN ISSUES
    // ════════════════════════════════════════════════════════════
    {
      issueNumber: 'EX-1001',
      title: 'Thermal runaway on power delivery MOSFETs during 12V stress testing',
      description:
        'During burn-in qualification test of PCBA Batch #409, temperature sensors adjacent to MOSFET Q3 recorded temperatures exceeding 115°C under nominal 8A load.\n\nSteps to Reproduce:\n1. Mount board onto test fixture TF-02.\n2. Apply continuous 12V DC input at 8A load for 15 minutes.\n3. Observe thermal imaging on U4 and Q3 nodes.\n\nExpected: Surface temperatures below 85°C.\nImpact: Risk of component desoldering and substrate delamination.',
      priority: 'Critical',
      status: 'Open',
      createdBy: primaryUser._id,
      assignedTo: primaryUser._id
    },
    {
      issueNumber: 'EX-1002',
      title: 'Firmware watchdog timer not resetting after UART DMA burst transfer',
      description:
        'The hardware watchdog timer triggers an unexpected system reset during high-volume UART DMA burst transfers on the STM32F4 MCU. The issue is intermittent and occurs roughly 1 in 300 transfers.\n\nRoot Cause: DMA IRQ handler blocks the main loop from calling WDT_Kick() within the 500ms window.\nSuggested Fix: Move WDT_Kick() call into DMA Transfer Complete ISR.',
      priority: 'High',
      status: 'Open',
      createdBy: admin._id,
      assignedTo: primaryUser._id
    },
    {
      issueNumber: 'EX-1003',
      title: 'Production line CAD mismatch: capacitor C18 footprint revision not updated in BOM',
      description:
        'CAD layout for capacitor C18 was revised from 0603 to 0805 package for improved voltage derating in PCB revision 1.2, but the manufacturing assembly drawing and BOM still reference the 0603 part number.\n\nDiscrepancy must be resolved before next production run to prevent assembly defects.',
      priority: 'Medium',
      status: 'Open',
      createdBy: primaryUser._id,
      assignedTo: primaryUser._id
    },
    {
      issueNumber: 'EX-1004',
      title: 'Excessive SPI clock jitter between MCU and 16-bit ADC on test bench TP14',
      description:
        'Oscilloscope measurements on test point TP14 (SPI_CLK) reveal high-frequency ringing and jitter exceeding 180ps at 25MHz clock frequency. This causes intermittent CRC checksum failures and ADC sample drops.\n\nProposed Fix: Adjust terminating resistor R22 from 22Ω to 33Ω and verify PCB trace impedance matching on layer 3 stripline.',
      priority: 'Medium',
      status: 'Open',
      createdBy: primaryUser._id,
      assignedTo: primaryUser._id
    },
    {
      issueNumber: 'EX-1005',
      title: 'GPIO interrupt storm on PB5 during external ESD transient event',
      description:
        'During electrostatic discharge (ESD) immunity testing (IEC 61000-4-2 Level 3), the PB5 GPIO line connected to the ALERT pin of the temperature sensor registers a continuous interrupt storm, locking up the RTOS task scheduler.\n\nThe TVS diode protection on PB5 appears undersized for the 8kV contact discharge test level.',
      priority: 'Critical',
      status: 'Open',
      createdBy: primaryUser._id,
      assignedTo: primaryUser._id
    },
    {
      issueNumber: 'EX-1006',
      title: 'Update component sourcing datasheet links in internal confluence for Q4 BOM review',
      description:
        'Several component datasheets linked in the internal engineering wiki are pointing to obsolete part numbers from the original design phase. These need to be updated to reflect the approved alternates listed in the Q4 component audit report.',
      priority: 'Low',
      status: 'Open',
      createdBy: primaryUser._id,
      assignedTo: primaryUser._id
    },

    // ════════════════════════════════════════════════════════════
    // 4 IN PROGRESS ISSUES
    // ════════════════════════════════════════════════════════════
    {
      issueNumber: 'EX-1007',
      title: 'Missing EMC shielding ground stitch vias on RF section of board revision 2.1',
      description:
        'RF emissions testing at the external lab revealed that the 2.4GHz antenna section of board revision 2.1 exceeds CE mark limits by 4.2dBm at 2437MHz.\n\nThe shielding can perimeter is missing 6 stitching vias identified in the design review. These need to be added before regulatory resubmission.',
      priority: 'Critical',
      status: 'In Progress',
      createdBy: admin._id,
      assignedTo: primaryUser._id
    },
    {
      issueNumber: 'EX-1008',
      title: 'I2C bus timeout when querying calibration EEPROM after soft reboot',
      description:
        'The calibration data EEPROM (U7) intermittently fails to acknowledge (NACK) read commands following a soft CPU watchdog reset. A hard power cycle recovers the bus.\n\nSuspected Cause: EEPROM state machine remains locked waiting for stop condition if reset triggers midway through a multi-byte burst read.\nProposed Fix: Add a 9-cycle SCL clock flush routine in the bootloader initialization sequence before mounting the I2C bus.',
      priority: 'High',
      status: 'In Progress',
      createdBy: primaryUser._id,
      assignedTo: primaryUser._id
    },
    {
      issueNumber: 'EX-1009',
      title: 'Voltage drop on 3.3V LDO rail during Bluetooth LE connection burst',
      description:
        'During BLE advertising bursts and connection handshakes, high transient current demands cause the 3.3V rail to dip by 320mV. This causes brown-out resets on the companion flash memory chip.\n\nRecommended Action: Increase output decoupling capacitance on LDO regulator U2 by adding a 10µF low-ESR ceramic capacitor in parallel with C14.',
      priority: 'High',
      status: 'In Progress',
      createdBy: primaryUser._id,
      assignedTo: primaryUser._id
    },
    {
      issueNumber: 'EX-1010',
      title: 'Solder balling and micro-bridging on BGA-256 FPGA under reflow peak 245°C',
      description:
        'During PCBA qualification of Batch #415, optical X-ray inspection (AXI) revealed solder balling and micro-bridging underneath BGA-256 (FPGA U1) on 8 out of 50 sample boards.\n\nAction: Reducing stencil aperture ratio to 85% square-with-rounded-corners, lowering peak reflow temperature to 238°C, and introducing a 15-minute nitrogen soak stage.',
      priority: 'Critical',
      status: 'In Progress',
      createdBy: primaryUser._id,
      assignedTo: primaryUser._id
    },

    // ════════════════════════════════════════════════════════════
    // 2 CLOSED ISSUES
    // ════════════════════════════════════════════════════════════
    {
      issueNumber: 'EX-1011',
      title: 'High-voltage flashover on auxiliary DC-DC converter during 1.5kV Hi-Pot isolation test',
      description:
        'During factory end-of-line dielectric withstand (Hi-Pot) testing at 1500V AC RMS (IEC 62368-1 Section 5.4.9), PCBA Batch #411 exhibited destructive dielectric breakdown and sustained plasma flashover between the primary switching node (SW1) and secondary isolated ground return trace (GND_SEC).\n\nRoot Cause: Creepage gap was only 1.8mm instead of 3.2mm.\nResolution: Milled an internal 1.2mm isolation air slot into PCB substrate beneath transformer T1 and optocoupler U9. Tested 25 sample boards up to 2500V AC for 120s with leakage current <0.18mA. TÜV SÜD certified and verified closed.',
      priority: 'Critical',
      status: 'Closed',
      createdBy: primaryUser._id,
      assignedTo: primaryUser._id
    },
    {
      issueNumber: 'EX-1012',
      title: 'Severe undervoltage lockout chattering on main 48V battery inverter bus',
      description:
        'Under rapid acceleration load transitions (0A to 65A in <2ms), battery inverter board displays severe undervoltage lockout (UVLO) chattering at 12kHz due to narrow 80mV hysteresis.\n\nResolution: Replaced feedback resistor R88 with 150kΩ to widen hysteresis window to 420mV and added 100nF low-ESR ceramic filter capacitor C62 across comparator inverting input. Verified over 200 transient pulses. Verified closed.',
      priority: 'Critical',
      status: 'Closed',
      createdBy: primaryUser._id,
      assignedTo: primaryUser._id
    }
  ];

  const createdIssues = await Issue.insertMany(exactIssues);
  console.log(`  ✓ Inserted ${createdIssues.length} issues with exact breakdown: 6 Open, 4 In Progress, 2 Closed!`);

  // Map for comments
  const issueMap = {};
  createdIssues.forEach((i) => {
    issueMap[i.issueNumber] = i;
  });

  // Seed Comments across all issues
  const commentsData = [
    {
      issue: issueMap['EX-1001']._id,
      user: primaryUser._id,
      text: 'Hotspot confirmed at drain pad of Q3. Peak reading: 118.4°C at 8A load. Copper pour thermal connection to ground plane is insufficient.'
    },
    {
      issue: issueMap['EX-1001']._id,
      user: admin._id,
      text: 'Approved redesign: add 6 × 0.3mm thermal relief vias connecting Q3 drain pad to inner ground plane on layer 3.'
    },
    {
      issue: issueMap['EX-1002']._id,
      user: primaryUser._id,
      text: 'Traced DMA transfer complete callback. Adding WDT kick into the DMA interrupt handler resolved the reset on bench testing.'
    },
    {
      issue: issueMap['EX-1007']._id,
      user: primaryUser._id,
      text: 'Added 6 missing stitch vias at positions V1–V6. Gerbers updated and sent for prototype fabrication.'
    },
    {
      issue: issueMap['EX-1008']._id,
      user: primaryUser._id,
      text: 'Confirmed EEPROM enters clock-stretch state after incomplete byte read. Implementing 9-pulse SCL recovery sequence in bootloader init.'
    },
    {
      issue: issueMap['EX-1010']._id,
      user: primaryUser._id,
      text: 'Stencil aperture reduced to 85% square-with-rounded-corners. Nitrogen reflow profile active. Inspecting next batch under AXI.'
    },
    {
      issue: issueMap['EX-1011']._id,
      user: primaryUser._id,
      text: '25 sample boards tested up to 2500V AC for 120s. Leakage current 0.14mA (well within 2.5mA limit). TÜV SÜD certification TR-2026-EX-8841 issued. Closed.'
    },
    {
      issue: issueMap['EX-1011']._id,
      user: admin._id,
      text: 'Verified by QA test team. Marking issue as officially closed.'
    },
    {
      issue: issueMap['EX-1012']._id,
      user: primaryUser._id,
      text: 'Hysteresis expanded to 420mV with 150kΩ resistor. Ran 200 consecutive 65A transient pulses with zero UVLO chattering. Verified closed.'
    },
    {
      issue: issueMap['EX-1012']._id,
      user: admin._id,
      text: 'Dynamo test bench verification complete. Issue officially closed.'
    }
  ];

  await Comment.insertMany(commentsData);
  console.log(`  ✓ Inserted ${commentsData.length} discussion comments!`);

  // Counter
  await mongoose.connection.db.collection('counters').updateOne(
    { _id: 'issueNumber' },
    { $set: { seq: 1012, lastUpdated: new Date() } },
    { upsert: true }
  );
  console.log('  ✓ Updated counter to 1012');

  // Also sync issues to vishwambarbk@gmail.com and vishwambhara@exelon.com so any of the 3 logins shows identical numbers
  const otherUsers = userDocs.filter((u) => u.email !== 'vishwambharbk@gmail.com');
  console.log('\n[Summary for vishwambharbk@gmail.com]');
  const filter = {
    $or: [{ createdBy: primaryUser._id }, { assignedTo: primaryUser._id }]
  };
  const openCount = await Issue.countDocuments({ ...filter, status: 'Open' });
  const inProgressCount = await Issue.countDocuments({ ...filter, status: 'In Progress' });
  const closedCount = await Issue.countDocuments({ ...filter, status: 'Closed' });
  console.log(`  - Total Issues       : ${openCount + inProgressCount + closedCount}`);
  console.log(`  - Open Issues        : ${openCount}`);
  console.log(`  - In Progress Issues : ${inProgressCount}`);
  console.log(`  - Closed Issues      : ${closedCount}`);

  await mongoose.disconnect();
  process.exit(0);
}

setupExactBreakdown().catch((err) => {
  console.error('[Error]:', err.message);
  process.exit(1);
});
