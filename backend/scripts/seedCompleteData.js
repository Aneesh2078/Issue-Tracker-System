require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Issue = require('../models/Issue');
const Comment = require('../models/Comment');

const seedAll = async () => {
  const mongoUri = process.env.MONGODB_URI;

  try {
    console.log('[Seed] Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log(`[Seed] Connected to: ${mongoose.connection.name}`);

    // ─────────────────────────────────────────────────
    // 1. USERS
    // ─────────────────────────────────────────────────
    console.log('\n[1/4] Seeding Users...');

    // Admin
    let admin = await User.findOneAndUpdate(
      { email: 'admin@exelon.com' },
      {
        name: 'System Administrator',
        email: 'admin@exelon.com',
        password: 'AdminPass@123',
        role: 'admin',
        isActive: true
      },
      { upsert: true, new: true }
    );
    // Re-fetch clean so pre-save hash fires properly on new doc
    admin = await User.findOne({ email: 'admin@exelon.com' });
    console.log('  ✓ Admin              : admin@exelon.com / AdminPass@123');

    // Vishwambhara (the primary normal user the demo uses)
    let vishwambhara = await User.findOne({ email: 'vishwambhara@exelon.com' });
    if (!vishwambhara) {
      vishwambhara = await User.create({
        name: 'Vishwambhara B.K',
        email: 'vishwambhara@exelon.com',
        password: 'User@12345',
        role: 'user',
        isActive: true
      });
    }
    console.log('  ✓ Normal User        : vishwambhara@exelon.com / User@12345');

    // Additional engineer users
    let jane = await User.findOne({ email: 'jane.doe@exelon.com' });
    if (!jane) {
      jane = await User.create({
        name: 'Jane Doe',
        email: 'jane.doe@exelon.com',
        password: 'UserPass@123',
        role: 'user',
        isActive: true
      });
    }
    console.log('  ✓ Normal User        : jane.doe@exelon.com / UserPass@123');

    let john = await User.findOne({ email: 'john.smith@exelon.com' });
    if (!john) {
      john = await User.create({
        name: 'John Smith',
        email: 'john.smith@exelon.com',
        password: 'UserPass@123',
        role: 'user',
        isActive: true
      });
    }
    console.log('  ✓ Normal User        : john.smith@exelon.com / UserPass@123');

    let priya = await User.findOne({ email: 'priya.kumar@exelon.com' });
    if (!priya) {
      priya = await User.create({
        name: 'Priya Kumar',
        email: 'priya.kumar@exelon.com',
        password: 'UserPass@123',
        role: 'user',
        isActive: false   // deactivated account to show admin toggle feature
      });
    }
    console.log('  ✓ Deactivated User   : priya.kumar@exelon.com / UserPass@123 [INACTIVE]');

    // ─────────────────────────────────────────────────
    // 2. ISSUES  (clear old data first to avoid duplicates)
    // ─────────────────────────────────────────────────
    console.log('\n[2/4] Seeding Issues...');
    await Issue.deleteMany({});
    await Comment.deleteMany({});

    const issues = await Issue.insertMany([
      // ── Issues created BY ADMIN (admin-side data) ──────────────────
      {
        issueNumber: 'EX-1001',
        title: 'Thermal runaway on power delivery MOSFETs during 12V stress testing',
        description:
          'During the burn-in qualification test of PCBA Batch #409, temperature sensors adjacent to MOSFET Q3 recorded temperatures exceeding 115°C under nominal 8A load.\n\n' +
          'Steps to Reproduce:\n' +
          '1. Mount board onto test fixture TF-02.\n' +
          '2. Apply continuous 12V DC input at 8A load for 15 minutes.\n' +
          '3. Observe thermal imaging on U4 and Q3 nodes.\n\n' +
          'Expected: Surface temperatures below 85°C.\n' +
          'Impact: Risk of component desoldering and substrate delamination.',
        priority: 'Critical',
        status: 'In Progress',
        createdBy: admin._id,
        assignedTo: vishwambhara._id
      },
      {
        issueNumber: 'EX-1002',
        title: 'Firmware watchdog timer not resetting after UART DMA burst transfer',
        description:
          'The hardware watchdog timer triggers an unexpected system reset during high-volume UART DMA burst transfers on the STM32F4 MCU. The issue is intermittent and occurs roughly 1 in 300 transfers.\n\n' +
          'Root Cause: DMA IRQ handler blocks the main loop from calling WDT_Kick() within the 500ms window.\n\n' +
          'Suggested Fix: Move WDT_Kick() call into DMA Transfer Complete ISR.',
        priority: 'High',
        status: 'Open',
        createdBy: admin._id,
        assignedTo: john._id
      },
      {
        issueNumber: 'EX-1003',
        title: 'Production line CAD mismatch: capacitor C18 footprint revision not updated in BOM',
        description:
          'CAD layout for capacitor C18 was revised from 0603 to 0805 package for improved voltage derating in PCB revision 1.2, but the manufacturing assembly drawing and BOM still reference the 0603 part number.\n\n' +
          'This discrepancy must be resolved before the next production run to prevent assembly defects.',
        priority: 'Medium',
        status: 'Open',
        createdBy: admin._id,
        assignedTo: null
      },
      {
        issueNumber: 'EX-1004',
        title: 'Missing EMC shielding ground stitch vias on RF section of board revision 2.1',
        description:
          'RF emissions testing at the external lab revealed that the 2.4GHz antenna section of board revision 2.1 exceeds CE mark limits by 4.2dBm at 2437MHz.\n\n' +
          'The shielding can perimeter is missing 6 stitching vias identified in the design review. These need to be added before regulatory resubmission.',
        priority: 'Critical',
        status: 'In Progress',
        createdBy: admin._id,
        assignedTo: jane._id
      },
      {
        issueNumber: 'EX-1005',
        title: 'Assembly line reject rate spike: solder bridging on QFN-48 component U12',
        description:
          'Weekly quality report shows solder bridging reject rate has increased from 0.4% to 3.2% on the QFN-48 package for U12 (power management IC) since introduction of the new solder paste vendor.\n\n' +
          'Investigation should cover stencil aperture sizing, paste rheology comparison, and reflow profile optimization.',
        priority: 'High',
        status: 'Closed',
        createdBy: admin._id,
        assignedTo: vishwambhara._id
      },

      // ── Issues created BY VISHWAMBHARA (user-side data) ─────────────
      {
        issueNumber: 'EX-1006',
        title: 'I2C bus timeout when querying calibration EEPROM after soft reboot',
        description:
          'The calibration data EEPROM (U7) intermittently fails to acknowledge (NACK) read commands following a soft CPU watchdog reset. A hard power cycle recovers the bus.\n\n' +
          'Suspected Cause: EEPROM state machine remains locked waiting for stop condition if reset triggers midway through a multi-byte burst read.\n\n' +
          'Proposed Fix: Add a 9-cycle SCL clock flush routine in the bootloader initialization sequence before mounting the I2C bus.',
        priority: 'High',
        status: 'In Progress',
        createdBy: vishwambhara._id,
        assignedTo: vishwambhara._id
      },
      {
        issueNumber: 'EX-1007',
        title: 'Excessive SPI clock jitter between MCU and 16-bit ADC on test bench TP14',
        description:
          'Oscilloscope measurements on test point TP14 (SPI_CLK) reveal high-frequency ringing and jitter exceeding 180ps at 25MHz clock frequency. This causes intermittent CRC checksum failures and ADC sample drops.\n\n' +
          'Proposed Fix: Adjust terminating resistor R22 from 22Ω to 33Ω and verify PCB trace impedance matching on layer 3 stripline.',
        priority: 'Medium',
        status: 'Open',
        createdBy: vishwambhara._id,
        assignedTo: null
      },
      {
        issueNumber: 'EX-1008',
        title: 'GPIO interrupt storm on PB5 during external ESD transient event',
        description:
          'During electrostatic discharge (ESD) immunity testing (IEC 61000-4-2 Level 3), the PB5 GPIO line connected to the ALERT pin of the temperature sensor registers a continuous interrupt storm, locking up the RTOS task scheduler.\n\n' +
          'The TVS diode protection on PB5 appears undersized for the 8kV contact discharge test level.',
        priority: 'Critical',
        status: 'Open',
        createdBy: vishwambhara._id,
        assignedTo: null
      },
      {
        issueNumber: 'EX-1009',
        title: 'USB enumeration fails on Windows 11 hosts with CDC-ACM virtual COM port driver',
        description:
          'The embedded USB CDC-ACM virtual COM port fails to enumerate on Windows 11 build 22H2 hosts. Device Manager shows "Device Descriptor Request Failed" (Code 43).\n\n' +
          'The same firmware enumerates successfully on Windows 10 and Linux. This suggests a USB descriptor compliance issue introduced in the Windows 11 USB stack.',
        priority: 'High',
        status: 'Closed',
        createdBy: vishwambhara._id,
        assignedTo: vishwambhara._id
      },
      {
        issueNumber: 'EX-1010',
        title: 'Update component sourcing datasheet links in internal confluence for Q4 BOM review',
        description:
          'Several component datasheets linked in the internal engineering wiki are pointing to obsolete part numbers from the original design phase. These need to be updated to reflect the approved alternates listed in the Q4 component audit report.',
        priority: 'Low',
        status: 'Open',
        createdBy: vishwambhara._id,
        assignedTo: null
      }
    ]);

    console.log(`  ✓ ${issues.length} issues inserted (EX-1001 to EX-1010)`);

    // Map issue numbers to documents for comment references
    const issueMap = {};
    issues.forEach(i => { issueMap[i.issueNumber] = i; });

    // ─────────────────────────────────────────────────
    // 3. COMMENTS
    // ─────────────────────────────────────────────────
    console.log('\n[3/4] Seeding Comments...');

    const comments = await Comment.insertMany([
      // EX-1001 comments (Thermal runaway – assigned to Vishwambhara)
      {
        issue: issueMap['EX-1001']._id,
        user: vishwambhara._id,
        text: 'Performed thermal imaging analysis using FLIR E60 camera. Hotspot is confirmed at the drain pad of Q3. Peak reading: 118.4°C at 8A load, 25°C ambient. Copper pour thermal connection to inner ground plane appears insufficient.'
      },
      {
        issue: issueMap['EX-1001']._id,
        user: admin._id,
        text: 'Acknowledged. Approving redesign action: add 6 × 0.3mm thermal relief vias connecting Q3 drain pad to inner ground plane on layer 3. Assign to layout team for ECO-0291 implementation. Target build: Batch #412.'
      },
      {
        issue: issueMap['EX-1001']._id,
        user: vishwambhara._id,
        text: 'ECO-0291 implemented in Altium layout. Thermal simulation (Ansys Icepak) now shows 72°C at same load condition. Sending updated Gerbers to fab for Batch #412 prototype confirmation.'
      },

      // EX-1004 comments (EMC shielding – assigned to Jane)
      {
        issue: issueMap['EX-1004']._id,
        user: jane._id,
        text: 'Added 6 missing stitch vias at positions V1–V6 as per RF design review document RF-REV-21-003. Gerbers updated and sent for prototype fabrication.'
      },
      {
        issue: issueMap['EX-1004']._id,
        user: admin._id,
        text: 'Prototype received and re-submitted to external EMC lab (TÜV Rheinland). Awaiting test report. Expected turnaround: 5 business days.'
      },

      // EX-1005 comments (Solder bridging – closed, assigned to Vishwambhara)
      {
        issue: issueMap['EX-1005']._id,
        user: vishwambhara._id,
        text: 'Root cause confirmed: new solder paste vendor paste viscosity is 15% lower than spec. Stencil aperture reduction from 100% to 85% ratio resolved bridging. Reject rate returned to 0.3% over 2000 unit run. Closing issue.'
      },
      {
        issue: issueMap['EX-1005']._id,
        user: admin._id,
        text: 'Issue verified closed. Updated approved vendor list and stencil specification sheet in production process control document PCD-ASM-007. Good work team.'
      },

      // EX-1006 comments (I2C timeout – created by Vishwambhara, assigned to self)
      {
        issue: issueMap['EX-1006']._id,
        user: vishwambhara._id,
        text: 'Reproduced issue on 3 of 5 boards. Confirmed EEPROM (Atmel AT24C256) enters clock-stretch state after incomplete byte read. Implementing 9-pulse SCL recovery sequence in bootloader init (HAL_I2C_Init_Recovery).'
      },
      {
        issue: issueMap['EX-1006']._id,
        user: john._id,
        text: 'I saw a similar issue on a previous project. The recovery routine should also include a soft reset of the I2C peripheral registers using HAL_I2C_DeInit / HAL_I2C_Init cycle after the 9-pulse flush. That fixed it for us.'
      },

      // EX-1009 comments (USB enumeration – closed, created by Vishwambhara)
      {
        issue: issueMap['EX-1009']._id,
        user: vishwambhara._id,
        text: 'Fixed by correcting the USB Device Descriptor: wMaxPacketSize for the control endpoint was set to 32 bytes instead of 64 bytes, which Windows 11 strict USB 2.0 host controller rejects. Firmware patch v2.5.3 deployed. Tested on 4 Windows 11 machines – all enumerate successfully.'
      },
      {
        issue: issueMap['EX-1009']._id,
        user: admin._id,
        text: 'Confirmed fix validated by QA team. Updated firmware release notes and closing issue. Well done on the root cause analysis.'
      }
    ]);

    console.log(`  ✓ ${comments.length} comments inserted across 5 issues`);

    // ─────────────────────────────────────────────────
    // 4. COUNTERS
    // ─────────────────────────────────────────────────
    console.log('\n[4/4] Seeding Counters...');
    const db = mongoose.connection.db;
    await db.collection('counters').updateOne(
      { _id: 'issueNumber' },
      { $set: { seq: 1010, lastUpdated: new Date() } },
      { upsert: true }
    );
    console.log('  ✓ issueNumber counter set to 1010 (next new issue: EX-1011)');

    // ─────────────────────────────────────────────────
    // SUMMARY
    // ─────────────────────────────────────────────────
    console.log('\n════════════════════════════════════════════════════');
    console.log(' SEED COMPLETE — MongoDB Atlas Data Summary');
    console.log('════════════════════════════════════════════════════');
    console.log(` users      : ${await User.countDocuments()} documents`);
    console.log(` issues     : ${await Issue.countDocuments()} documents`);
    console.log(` comments   : ${await Comment.countDocuments()} documents`);
    console.log(` counters   : 1 document`);
    console.log('────────────────────────────────────────────────────');
    console.log(' Accounts:');
    console.log('  ADMIN  → admin@exelon.com         / AdminPass@123');
    console.log('  USER   → vishwambhara@exelon.com  / User@12345');
    console.log('  USER   → jane.doe@exelon.com      / UserPass@123');
    console.log('  USER   → john.smith@exelon.com    / UserPass@123');
    console.log('  USER   → priya.kumar@exelon.com   / UserPass@123 [DEACTIVATED]');
    console.log('════════════════════════════════════════════════════\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err.message);
    process.exit(1);
  }
};

seedAll();
