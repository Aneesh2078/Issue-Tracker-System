require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Issue = require('../models/Issue');
const Comment = require('../models/Comment');

const seedAll = async () => {
  const mongoUri = process.env.MONGODB_URI;

  try {
    console.log('[Seed] Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log(`[Seed] Connected to database: ${mongoose.connection.name}`);

    // ─────────────────────────────────────────────────
    // 1. USERS — Ensure all demo accounts exist with valid bcrypt hashes
    // ─────────────────────────────────────────────────
    console.log('\n[1/4] Ensuring and updating user accounts...');

    const salt = await bcrypt.genSalt(10);
    const adminPassHash = await bcrypt.hash('AdminPass@123', salt);
    const userPassHash = await bcrypt.hash('User@12345', salt);
    const generalPassHash = await bcrypt.hash('UserPass@123', salt);

    // Admin
    let admin = await User.findOne({ email: 'admin@exelon.com' });
    if (!admin) {
      admin = await User.create({
        name: 'System Administrator',
        email: 'admin@exelon.com',
        password: 'AdminPass@123',
        role: 'admin',
        isActive: true
      });
    } else {
      admin.name = 'System Administrator';
      admin.role = 'admin';
      admin.isActive = true;
      admin.password = 'AdminPass@123';
      admin.markModified('password');
      await admin.save();
    }
    console.log('  ✓ Admin               : admin@exelon.com / AdminPass@123');

    // Vishwambhara (Company email)
    let vishwambhara = await User.findOne({ email: 'vishwambhara@exelon.com' });
    if (!vishwambhara) {
      vishwambhara = await User.create({
        name: 'Vishwambhara B.K',
        email: 'vishwambhara@exelon.com',
        password: 'User@12345',
        role: 'user',
        isActive: true
      });
    } else {
      vishwambhara.name = 'Vishwambhara B.K';
      vishwambhara.role = 'user';
      vishwambhara.isActive = true;
      vishwambhara.password = 'User@12345';
      vishwambhara.markModified('password');
      await vishwambhara.save();
    }
    console.log('  ✓ User (Exelon)       : vishwambhara@exelon.com / User@12345');

    // Vishwambhara (Personal Gmail)
    let vishwambharGmail = await User.findOne({ email: 'vishwambarbk@gmail.com' });
    if (!vishwambharGmail) {
      vishwambharGmail = await User.create({
        name: 'Vishwambhara B.K',
        email: 'vishwambarbk@gmail.com',
        password: 'User@12345',
        role: 'user',
        isActive: true
      });
    } else {
      vishwambharGmail.name = 'Vishwambhara B.K';
      vishwambharGmail.role = 'user';
      vishwambharGmail.isActive = true;
      vishwambharGmail.password = 'User@12345';
      vishwambharGmail.markModified('password');
      await vishwambharGmail.save();
    }
    console.log('  ✓ User (Gmail)        : vishwambarbk@gmail.com / User@12345');

    // Jane Doe
    let jane = await User.findOne({ email: 'jane.doe@exelon.com' });
    if (!jane) {
      jane = await User.create({
        name: 'Jane Doe',
        email: 'jane.doe@exelon.com',
        password: 'UserPass@123',
        role: 'user',
        isActive: true
      });
    } else {
      jane.name = 'Jane Doe';
      jane.role = 'user';
      jane.isActive = true;
      jane.password = 'UserPass@123';
      jane.markModified('password');
      await jane.save();
    }
    console.log('  ✓ User                : jane.doe@exelon.com / UserPass@123');

    // John Smith
    let john = await User.findOne({ email: 'john.smith@exelon.com' });
    if (!john) {
      john = await User.create({
        name: 'John Smith',
        email: 'john.smith@exelon.com',
        password: 'UserPass@123',
        role: 'user',
        isActive: true
      });
    } else {
      john.name = 'John Smith';
      john.role = 'user';
      john.isActive = true;
      john.password = 'UserPass@123';
      john.markModified('password');
      await john.save();
    }
    console.log('  ✓ User                : john.smith@exelon.com / UserPass@123');

    // Priya Kumar (Deactivated to show toggle in admin table)
    let priya = await User.findOne({ email: 'priya.kumar@exelon.com' });
    if (!priya) {
      priya = await User.create({
        name: 'Priya Kumar',
        email: 'priya.kumar@exelon.com',
        password: 'UserPass@123',
        role: 'user',
        isActive: false
      });
    } else {
      priya.name = 'Priya Kumar';
      priya.role = 'user';
      priya.isActive = false;
      priya.password = 'UserPass@123';
      priya.markModified('password');
      await priya.save();
    }
    console.log('  ✓ Deactivated User    : priya.kumar@exelon.com / UserPass@123 [INACTIVE]');

    // ─────────────────────────────────────────────────
    // 2. ISSUES — ALL fields completely filled (NO nulls!)
    // ─────────────────────────────────────────────────
    console.log('\n[2/4] Seeding Issues with ALL fields filled...');
    await Issue.deleteMany({});
    await Comment.deleteMany({});

    const issuesData = [
      // Issue 1: Admin created -> Assigned to Vishwambhara (In Progress)
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

      // Issue 2: Admin created -> Assigned to John Smith (Open)
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

      // Issue 3: Admin created -> Assigned to Vishwambhar Gmail (Open)
      {
        issueNumber: 'EX-1003',
        title: 'Production line CAD mismatch: capacitor C18 footprint revision not updated in BOM',
        description:
          'CAD layout for capacitor C18 was revised from 0603 to 0805 package for improved voltage derating in PCB revision 1.2, but the manufacturing assembly drawing and BOM still reference the 0603 part number.\n\n' +
          'This discrepancy must be resolved before the next production run to prevent assembly defects.',
        priority: 'Medium',
        status: 'Open',
        createdBy: admin._id,
        assignedTo: vishwambharGmail._id
      },

      // Issue 4: Admin created -> Assigned to Jane Doe (In Progress)
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

      // Issue 5: Admin created -> Assigned to Vishwambhara (Closed)
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

      // Issue 6: Created by Vishwambhara -> Assigned to Admin (In Progress)
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
        assignedTo: admin._id
      },

      // Issue 7: Created by Vishwambhara -> Assigned to Jane Doe (Open)
      {
        issueNumber: 'EX-1007',
        title: 'Excessive SPI clock jitter between MCU and 16-bit ADC on test bench TP14',
        description:
          'Oscilloscope measurements on test point TP14 (SPI_CLK) reveal high-frequency ringing and jitter exceeding 180ps at 25MHz clock frequency. This causes intermittent CRC checksum failures and ADC sample drops.\n\n' +
          'Proposed Fix: Adjust terminating resistor R22 from 22Ω to 33Ω and verify PCB trace impedance matching on layer 3 stripline.',
        priority: 'Medium',
        status: 'Open',
        createdBy: vishwambhara._id,
        assignedTo: jane._id
      },

      // Issue 8: Created by Vishwambhara -> Assigned to John Smith (Open)
      {
        issueNumber: 'EX-1008',
        title: 'GPIO interrupt storm on PB5 during external ESD transient event',
        description:
          'During electrostatic discharge (ESD) immunity testing (IEC 61000-4-2 Level 3), the PB5 GPIO line connected to the ALERT pin of the temperature sensor registers a continuous interrupt storm, locking up the RTOS task scheduler.\n\n' +
          'The TVS diode protection on PB5 appears undersized for the 8kV contact discharge test level.',
        priority: 'Critical',
        status: 'Open',
        createdBy: vishwambhara._id,
        assignedTo: john._id
      },

      // Issue 9: Created by Vishwambhara -> Assigned to Vishwambhara (Closed)
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

      // Issue 10: Created by Vishwambhar Gmail -> Assigned to Admin (Open)
      {
        issueNumber: 'EX-1010',
        title: 'Update component sourcing datasheet links in internal confluence for Q4 BOM review',
        description:
          'Several component datasheets linked in the internal engineering wiki are pointing to obsolete part numbers from the original design phase. These need to be updated to reflect the approved alternates listed in the Q4 component audit report.',
        priority: 'Low',
        status: 'Open',
        createdBy: vishwambharGmail._id,
        assignedTo: admin._id
      },

      // Issue 11: Created by Jane Doe -> Assigned to Vishwambhar Gmail (In Progress)
      {
        issueNumber: 'EX-1011',
        title: 'Voltage drop on 3.3V LDO rail during Bluetooth LE connection burst',
        description:
          'During BLE advertising bursts and connection handshakes, high transient current demands cause the 3.3V rail to dip by 320mV. This causes brown-out resets on the companion flash memory chip.\n\n' +
          'Recommended Action: Increase output decoupling capacitance on LDO regulator U2 by adding a 10µF low-ESR ceramic capacitor in parallel with C14.',
        priority: 'High',
        status: 'In Progress',
        createdBy: jane._id,
        assignedTo: vishwambharGmail._id
      },

      // Issue 12: Created by John Smith -> Assigned to Vishwambhara (Closed)
      {
        issueNumber: 'EX-1012',
        title: 'CAN bus transceiver entering silent mode unexpectedly on high bus traffic',
        description:
          'The CAN transceiver IC (TCAN1042) intermittently goes into standby mode when bus load exceeds 75%. Root cause was traced to a floating STB pin due to an unpopulated pull-down resistor R31 in production batch #407.\n\n' +
          'Verification: Manually jumpered pull-down on 20 sample units. All passed 24-hour continuous CAN frame stress test without entering sleep mode.',
        priority: 'Critical',
        status: 'Closed',
        createdBy: john._id,
        assignedTo: vishwambhara._id
      }
    ];

    const issues = await Issue.insertMany(issuesData);
    console.log(`  ✓ ${issues.length} issues successfully created (EX-1001 to EX-1012). Every single issue has a non-null assignedTo!`);

    const issueMap = {};
    issues.forEach(i => { issueMap[i.issueNumber] = i; });

    // ─────────────────────────────────────────────────
    // 3. COMMENTS — Comprehensive activity across ALL issues
    // ─────────────────────────────────────────────────
    console.log('\n[3/4] Seeding Comments across all issues...');

    const commentsData = [
      // EX-1001
      {
        issue: issueMap['EX-1001']._id,
        user: vishwambhara._id,
        text: 'Performed thermal imaging analysis using FLIR E60 camera. Hotspot is confirmed at the drain pad of Q3. Peak reading: 118.4°C at 8A load, 25°C ambient.'
      },
      {
        issue: issueMap['EX-1001']._id,
        user: admin._id,
        text: 'Acknowledged. Approving redesign action: add 6 × 0.3mm thermal relief vias connecting Q3 drain pad to inner ground plane on layer 3. Target build: Batch #412.'
      },
      {
        issue: issueMap['EX-1001']._id,
        user: vishwambhara._id,
        text: 'ECO-0291 implemented in Altium layout. Thermal simulation now shows 72°C at same load condition. Updated Gerbers sent to fab.'
      },

      // EX-1002
      {
        issue: issueMap['EX-1002']._id,
        user: john._id,
        text: 'Traced DMA transfer complete callback. Adding WDT kick into the DMA interrupt handler resolved the reset on the bench test.'
      },
      {
        issue: issueMap['EX-1002']._id,
        user: admin._id,
        text: 'Please prepare PR against master branch and run 10,000-cycle automated test script before closing.'
      },

      // EX-1003
      {
        issue: issueMap['EX-1003']._id,
        user: vishwambharGmail._id,
        text: 'Checking BOM database vs CAD part library. Updating SAP ERP part number reference to 0805 specification.'
      },
      {
        issue: issueMap['EX-1003']._id,
        user: admin._id,
        text: 'Thanks! Make sure assembly team is notified once updated BOM is released.'
      },

      // EX-1004
      {
        issue: issueMap['EX-1004']._id,
        user: jane._id,
        text: 'Added 6 missing stitch vias at positions V1–V6 as per RF design review document RF-REV-21-003. Gerbers updated.'
      },
      {
        issue: issueMap['EX-1004']._id,
        user: admin._id,
        text: 'Prototype submitted to external EMC lab. Awaiting test certificate.'
      },

      // EX-1005
      {
        issue: issueMap['EX-1005']._id,
        user: vishwambhara._id,
        text: 'Root cause confirmed: new solder paste vendor paste viscosity is 15% lower than spec. Stencil aperture reduction from 100% to 85% ratio resolved bridging. Reject rate dropped to 0.3%.'
      },
      {
        issue: issueMap['EX-1005']._id,
        user: admin._id,
        text: 'Issue verified closed. Updated approved vendor list and stencil specification sheet in production process document.'
      },

      // EX-1006
      {
        issue: issueMap['EX-1006']._id,
        user: vishwambhara._id,
        text: 'Reproduced issue on 3 of 5 boards. Confirmed EEPROM enters clock-stretch state after incomplete byte read. Implementing 9-pulse SCL recovery sequence.'
      },
      {
        issue: issueMap['EX-1006']._id,
        user: admin._id,
        text: 'Tested the recovery routine on bench setup. Recovery works reliably after simulated brownouts.'
      },

      // EX-1007
      {
        issue: issueMap['EX-1007']._id,
        user: jane._id,
        text: 'R22 value adjusted to 33Ω. Signal reflection on TP14 reduced from 420mV peak-to-peak to under 60mV.'
      },

      // EX-1008
      {
        issue: issueMap['EX-1008']._id,
        user: john._id,
        text: 'Tested clamping response of new TVS diode array (PESD5V0X1BCAL). Clamping voltage is now 7.2V at 8kV ESD pulse. RTOS interrupt load is stable.'
      },

      // EX-1009
      {
        issue: issueMap['EX-1009']._id,
        user: vishwambhara._id,
        text: 'Fixed by correcting USB Device Descriptor wMaxPacketSize from 32 bytes to 64 bytes. Firmware patch v2.5.3 deployed and verified across 4 Windows 11 machines.'
      },
      {
        issue: issueMap['EX-1009']._id,
        user: admin._id,
        text: 'Verified by QA test suite. Closing issue.'
      },

      // EX-1010
      {
        issue: issueMap['EX-1010']._id,
        user: vishwambharGmail._id,
        text: 'Updated 14 obsolete component datasheets on Confluence space ENG-BOM-2026. Audit complete.'
      },

      // EX-1011
      {
        issue: issueMap['EX-1011']._id,
        user: jane._id,
        text: 'Simulated BLE transmission peaks with electronic load. 10µF ceramic capacitor soldered across C14 eliminates the rail dip.'
      },
      {
        issue: issueMap['EX-1011']._id,
        user: vishwambharGmail._id,
        text: 'Reviewing layout to fit the 10µF 0603 footprint in the next board spin.'
      },

      // EX-1012
      {
        issue: issueMap['EX-1012']._id,
        user: john._id,
        text: 'R31 pull-down resistor added to assembly drawing. SMT placement program updated to populate component.'
      },
      {
        issue: issueMap['EX-1012']._id,
        user: vishwambhara._id,
        text: 'Verified 50 production units. Zero CAN sleep dropouts observed. Verified closed.'
      }
    ];

    const comments = await Comment.insertMany(commentsData);
    console.log(`  ✓ ${comments.length} comments inserted across all 12 issues!`);

    // ─────────────────────────────────────────────────
    // 4. COUNTER — Set sequence for next issue
    // ─────────────────────────────────────────────────
    console.log('\n[4/4] Setting Issue Number Counter...');
    const db = mongoose.connection.db;
    await db.collection('counters').updateOne(
      { _id: 'issueNumber' },
      { $set: { seq: 1012, lastUpdated: new Date() } },
      { upsert: true }
    );
    console.log('  ✓ issueNumber counter set to 1012 (next issue created via UI will be EX-1013)');

    // ─────────────────────────────────────────────────
    // SUMMARY
    // ─────────────────────────────────────────────────
    console.log('\n════════════════════════════════════════════════════════════════');
    console.log(' SEED COMPLETE — MongoDB Atlas Fully Populated');
    console.log('════════════════════════════════════════════════════════════════');
    console.log(` Total Users    : ${await User.countDocuments()}`);
    console.log(` Total Issues   : ${await Issue.countDocuments()}`);
    console.log(` Total Comments : ${await Comment.countDocuments()}`);
    console.log('────────────────────────────────────────────────────────────────');
    console.log(' All issues have 100% of fields populated:');
    console.log('  - issueNumber, title, description, priority, status');
    console.log('  - createdBy is populated on all issues');
    console.log('  - assignedTo is populated on ALL issues (0 nulls)');
    console.log('  - activity comments exist on ALL issues');
    console.log('────────────────────────────────────────────────────────────────');
    console.log(' Logins:');
    console.log('  ADMIN : admin@exelon.com         / AdminPass@123');
    console.log('  USER  : vishwambhara@exelon.com  / User@12345');
    console.log('  USER  : vishwambarbk@gmail.com   / User@12345');
    console.log('  USER  : jane.doe@exelon.com      / UserPass@123');
    console.log('  USER  : john.smith@exelon.com    / UserPass@123');
    console.log('════════════════════════════════════════════════════════════════\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err.message);
    process.exit(1);
  }
};

seedAll();
