require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Issue = require('../models/Issue');
const Comment = require('../models/Comment');

async function setupJohnSmithData() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[DB] Connected to MongoDB Atlas');

  // Fetch existing users
  const admin = await User.findOne({ email: 'admin@exelon.com' });
  const john = await User.findOne({ email: 'john.smith@exelon.com' });
  const jane = await User.findOne({ email: 'jane.doe@exelon.com' });

  if (!john) {
    console.error('John Smith not found in DB!');
    process.exit(1);
  }

  // Reset his password cleanly
  john.password = 'UserPass@123';
  john.markModified('password');
  john.isActive = true;
  await john.save();
  console.log('  ✓ Password verified: john.smith@exelon.com / UserPass@123');

  // ─────────────────────────────────────────────────────────────
  // Build 12 new issues dedicated to John (EX-2001 to EX-2012)
  // 6 Open, 4 In Progress, 2 Closed
  // All created by John or assigned to John
  // Using EX-2000 series to avoid conflict with Vishwambhara's EX-1000 series
  // ─────────────────────────────────────────────────────────────

  // Remove any old EX-2xxx issues
  await Issue.deleteMany({ issueNumber: /^EX-2/ });
  await Comment.deleteMany({});  // also clean up orphan comments

  const johnIssues = [
    // ══════════════════════════════════════════════
    // 6 OPEN ISSUES
    // ══════════════════════════════════════════════
    {
      issueNumber: 'EX-2001',
      title: 'CAN bus frame loss during simultaneous multi-node broadcast on 500kbps network',
      description:
        'During stress testing with 12 active CAN nodes broadcasting at 500kbps, the STM32 CAN peripheral drops 1 in 400 frames. The error counter (REC) increments rapidly during peak traffic.\n\n' +
        'Steps to Reproduce:\n' +
        '1. Set up 12-node CAN network on CANH/CANL differential pair with 120Ω termination at both ends.\n' +
        '2. Broadcast 500 byte frames simultaneously from all nodes at 500kbps.\n' +
        '3. Monitor TX/RX success counters and CAN error interrupt flags.\n' +
        '4. Observe 0.25% frame loss with REC counter incrementing beyond threshold.\n\n' +
        'Impact: Packet loss in a safety-critical ECU communication bus is a regulatory compliance failure under ISO 11898.\n\n' +
        'Proposed Fix: Increase CAN IRQ priority in NVIC above UART IRQ; implement FIFO-based DMA receive buffer.',
      priority: 'Critical',
      status: 'Open',
      createdBy: john._id,
      assignedTo: john._id
    },
    {
      issueNumber: 'EX-2002',
      title: 'RTOS task stack overflow in sensor fusion task during IMU burst sampling',
      description:
        'The sensor fusion RTOS task (priority 5, stack: 512 bytes) overflows its stack during IMU burst sampling at 1kHz with 6-axis data. The overflow corrupts adjacent task control blocks, triggering a hard fault.\n\n' +
        'Steps to Reproduce:\n' +
        '1. Enable IMU burst sampling mode at 1000Hz.\n' +
        '2. Enable sensor fusion Kalman filter with 6DoF pose estimation.\n' +
        '3. Observe HardFault_Handler interrupt triggered within 90 seconds.\n\n' +
        'Root Cause: Kalman filter state matrix (12x12 float) requires 576 bytes of stack. Task stack was undersized.\n\n' +
        'Proposed Fix: Increase sensor fusion task stack to 1024 bytes and add stack watermark monitoring with vTaskGetInfo().',
      priority: 'High',
      status: 'Open',
      createdBy: admin._id,
      assignedTo: john._id
    },
    {
      issueNumber: 'EX-2003',
      title: 'SWD debug interface unresponsive after enabling deep sleep mode on STM32L476',
      description:
        'Once the STM32L476 MCU enters STOP2 deep sleep mode (all clocks gated except LSE), the SWD debug interface becomes unresponsive. Connecting a J-Link Pro debugger returns "Could not connect to device. Target connection failed."\n\n' +
        'Issue is intermittent: occurs on 60% of boards from Batch #413, possibly related to debug port lockup on wake-from-stop POR sequence.\n\n' +
        'Proposed Fix: Enable DBGMCU wake-from-stop mode by setting DBG_STOP bit in DBGMCU_CR register, allowing SWD to remain active during low-power modes.',
      priority: 'High',
      status: 'Open',
      createdBy: john._id,
      assignedTo: john._id
    },
    {
      issueNumber: 'EX-2004',
      title: 'EEPROM write cycle endurance failure on AT24C512 after 95k write cycles in production',
      description:
        'Field-returned units from Site A exhibit corrupted calibration data after 95,000 EEPROM write cycles. AT24C512 is rated for 1,000,000 endurance cycles, suggesting premature wear or over-voltage stress.\n\n' +
        'Investigation:\n' +
        '1. Measure EEPROM supply voltage across write cycles — found 3.65V during writes (spec max: 3.6V).\n' +
        '2. I2C clock speed set to 400kHz (Fast mode) but EEPROM rated for 100kHz Standard mode operation on this voltage rail.\n\n' +
        'Corrective Action: Review LDO voltage setting for EEPROM supply rail; switch I2C bus to 100kHz for EEPROM transactions only.',
      priority: 'Medium',
      status: 'Open',
      createdBy: john._id,
      assignedTo: john._id
    },
    {
      issueNumber: 'EX-2005',
      title: 'PWM motor driver output stuck HIGH on FAULT condition causing uncontrolled motor spin',
      description:
        'During over-current fault detection (DRV8835 motor driver IC), the PWM output pin latches HIGH instead of going to High-Z. This causes the motor to spin uncontrolled at maximum duty cycle during a fault.\n\n' +
        'Safety Risk: Uncontrolled motor spin in a fault state is a safety-critical issue under IEC 62061 for functional safety.\n\n' +
        'Root Cause: FAULT pin is not wired to MCU GPIO; firmware does not poll nFAULT signal. When fault occurs, firmware continues driving PWM without entering protected braking mode.\n\n' +
        'Fix: Wire nFAULT to MCU GPIO PA4 with external pull-up. Configure EXTI interrupt to trigger coast mode (all PWM LOW) on falling edge.',
      priority: 'Critical',
      status: 'Open',
      createdBy: john._id,
      assignedTo: john._id
    },
    {
      issueNumber: 'EX-2006',
      title: 'Missing conformal coating specification on assembly drawing for outdoor deployment variant',
      description:
        'Assembly drawing revision 4.1 for the IP65-rated outdoor deployment variant of PCBA-EX-5100 does not specify conformal coating type, thickness, or masking instructions for connector J1 and J2 areas.\n\n' +
        'Without specification, the contract manufacturer applied Humiseal 1B31 (acrylic) at 50µm, which is incompatible with the board\'s operating temperature range of -40°C to +85°C.\n\n' +
        'Required Fix: Update assembly drawing with Electrolube HPA conformal coating specification (100µm) with explicit masking exclusions for all RJ45 and CAN connectors.',
      priority: 'Low',
      status: 'Open',
      createdBy: john._id,
      assignedTo: john._id
    },

    // ══════════════════════════════════════════════
    // 4 IN PROGRESS ISSUES
    // ══════════════════════════════════════════════
    {
      issueNumber: 'EX-2007',
      title: 'ADC reference voltage instability causing ±15 LSB measurement drift at high temperature',
      description:
        'During thermal soak testing at +85°C, the 12-bit ADC reference voltage (VREF: 2.048V from ADR4520 reference IC) drifts from 2.048V to 2.054V, causing ±15 LSB error on all pressure sensor channels.\n\n' +
        'This exceeds the 0.1% measurement accuracy requirement for the load cell amplifier subsystem.\n\n' +
        'Current Action: Evaluating ADR4520BRMZ-R7 (B-grade, 10ppm/°C TC) as replacement for the current ADR4520ARMZ (A-grade, 25ppm/°C) reference IC. PCB footprint is pin-compatible.',
      priority: 'Critical',
      status: 'In Progress',
      createdBy: admin._id,
      assignedTo: john._id
    },
    {
      issueNumber: 'EX-2008',
      title: 'USB-C PD negotiation timeout when connected to third-party 65W GaN chargers',
      description:
        'The embedded USB-C Power Delivery 3.0 controller (FUSB302) fails to negotiate above 15W (5V/3A) when connected to third-party 65W GaN chargers from Anker and Baseus. The device falls back to 5V instead of negotiating 20V/3.25A (65W).\n\n' +
        'Wireshark-compatible VBUS monitoring shows PD messages are being sent but ACK timeout occurs after 25ms instead of the spec-defined 15ms response window.\n\n' +
        'Current Action: Reviewing firmware PD state machine timing constants and I2C polling rate for FUSB302 interrupt handling.',
      priority: 'High',
      status: 'In Progress',
      createdBy: john._id,
      assignedTo: john._id
    },
    {
      issueNumber: 'EX-2009',
      title: 'Optical encoder Z-index pulse missing on 15% of units after SMT reflow',
      description:
        'During end-of-line functional testing, 15% of units (EX-ENCODER-V3) fail the Z-index pulse verification test. The quadrature A/B signals are present but the index Z pulse is completely absent.\n\n' +
        'Hardware Investigation:\n' +
        '1. Measured photo-interrupter U6 pin 3 (emitter): 0V instead of expected 0.7V.\n' +
        '2. Optical sensor channel is active but Z-output latch IC (74HC74) Q-output is permanently LOW.\n' +
        '3. Cross-sectional X-ray reveals cold solder joint on pin 2 of 74HC74 on 3 of 5 inspected failures.\n\n' +
        'Current Action: Increasing reflow peak temperature from 235°C to 242°C for the 74HC74 package. Additional solder volume analysis in progress.',
      priority: 'High',
      status: 'In Progress',
      createdBy: john._id,
      assignedTo: john._id
    },
    {
      issueNumber: 'EX-2010',
      title: 'JTAG boundary scan failure on CPLD XC2C64A after wave soldering on through-hole variant',
      description:
        'The CPLD XC2C64A on the through-hole PCB variant fails JTAG boundary scan (SVF playback returns COMPARE FAILURE on 3 output pins: TDI, TMS, TCK).\n\n' +
        'The SMT variant of the same design passes 100% of boundary scan. Issue is specific to wave-soldered through-hole units.\n\n' +
        'Current Investigation:\n' +
        'Measuring JTAG signal integrity on through-hole units: TDI shows 400mV undershoot during scan clock edges due to 15cm unshielded PCB trace adjacent to switching power supply inductor L3.\n\n' +
        'Current Action: Rerouting JTAG traces to inner layer 3 (ground-referenced stripline) in PCB revision 1.6.',
      priority: 'Critical',
      status: 'In Progress',
      createdBy: john._id,
      assignedTo: john._id
    },

    // ══════════════════════════════════════════════
    // 2 CLOSED ISSUES
    // ══════════════════════════════════════════════
    {
      issueNumber: 'EX-2011',
      title: 'CAN bus transceiver entering silent mode unexpectedly on high bus traffic above 75% load',
      description:
        'The CAN transceiver IC (TCAN1042) intermittently goes into standby mode when bus load exceeds 75%. Root cause was traced to a floating STB pin due to an unpopulated pull-down resistor R31 in production Batch #407.\n\n' +
        'Steps to Reproduce:\n' +
        '1. Apply 80% bus load on CAN network using Vector CANalyzer injection tool.\n' +
        '2. Monitor transceiver current draw on 5V_CAN rail.\n' +
        '3. Transceiver current drops from 7mA to 0.4mA (sleep mode) randomly within 2 minutes.\n\n' +
        'Root Cause: R31 (10kΩ pull-down on STB pin) was omitted from assembly BOM during component shortage substitution in Batch #407.\n\n' +
        'Resolution:\n' +
        '1. All Batch #407 units reworked with manually soldered R31 (10kΩ 0402 pull-down).\n' +
        '2. BOM critical component flag added to prevent future substitution.\n' +
        '3. Verification: 20 units passed 24-hour CAN frame stress test at 95% bus load without entering sleep mode. Verified closed.',
      priority: 'Critical',
      status: 'Closed',
      createdBy: john._id,
      assignedTo: john._id
    },
    {
      issueNumber: 'EX-2012',
      title: 'UART baud rate error exceeding 2.5% on 921600bps at 3.3V with 8MHz HSI oscillator',
      description:
        'At 921600 bps UART configuration using the STM32F4 internal 8MHz HSI oscillator, baud rate error was measured at 3.1% (exceeding the 2.5% maximum for UART without synchronization). This causes byte misalignment during long-duration data logging bursts.\n\n' +
        'Root Cause: HSI oscillator has ±1% accuracy at 25°C with ±2% over temperature. At 921600bps, this compounds to exceed UART receiver tolerance window.\n\n' +
        'Resolution:\n' +
        '1. Switched PLL source from HSI to external 12MHz HSE crystal oscillator (accuracy: ±20ppm).\n' +
        '2. Recalculated USART_BRR register for 921600bps with 72MHz system clock (error: 0.03%).\n' +
        '3. Verified over 10 million bytes of continuous UART data logging with zero framing errors. Verified closed.',
      priority: 'High',
      status: 'Closed',
      createdBy: john._id,
      assignedTo: john._id
    }
  ];

  const createdIssues = await Issue.insertMany(johnIssues);
  console.log(`  ✓ Inserted ${createdIssues.length} issues for John Smith (EX-2001 to EX-2012)`);

  const issueMap = {};
  createdIssues.forEach((i) => { issueMap[i.issueNumber] = i; });

  // ─────────────────────────────────────────────────────────────
  // COMMENTS — Detailed activity threads on all 12 issues
  // ─────────────────────────────────────────────────────────────
  const johnComments = [
    // EX-2001 (CAN bus frame loss)
    { issue: issueMap['EX-2001']._id, user: john._id, text: 'Captured frame loss events with CANalyzer. REC counter reaches 128 at 85% bus load. Increasing CAN IRQ priority above UART in NVIC configuration table.' },
    { issue: issueMap['EX-2001']._id, user: admin._id, text: 'This is a safety-compliance issue under ISO 11898. Treat as Priority-1 and prepare root cause report for the QA team before Batch #416 ships.' },

    // EX-2002 (RTOS stack overflow)
    { issue: issueMap['EX-2002']._id, user: john._id, text: 'Analyzed stack watermark using uxTaskGetStackHighWaterMark(). Sensor fusion task peak usage was 497/512 bytes. Increased stack to 1024 bytes and re-flashed 10 units. Running 48-hour soak test.' },
    { issue: issueMap['EX-2002']._id, user: admin._id, text: 'Confirm stack watermark report is added to the firmware design document as a living metric. All future RTOS tasks must specify stack requirement justification in design review checklist.' },

    // EX-2005 (PWM motor driver FAULT)
    { issue: issueMap['EX-2005']._id, user: john._id, text: 'Wired nFAULT to PA4 GPIO with 10kΩ pull-up. EXTI interrupt now correctly triggers coast mode on fault. Tested 50 simulated over-current events. Motor stops within 2ms of fault detection.' },
    { issue: issueMap['EX-2005']._id, user: admin._id, text: 'Safety verification approved. Update firmware change log with version v3.1.2 and add nFAULT wiring to schematic and BOM review checklist for next hardware revision.' },

    // EX-2007 (ADC reference voltage)
    { issue: issueMap['EX-2007']._id, user: john._id, text: 'Ordered 20 units of ADR4520BRMZ-R7 (B-grade, 10ppm/°C). Will solder and re-test across -20°C to +85°C temperature range on bench over the next 3 days.' },
    { issue: issueMap['EX-2007']._id, user: admin._id, text: 'Good initiative. Document temperature vs. VREF voltage profile in the test report. If B-grade passes, update approved component list immediately.' },

    // EX-2008 (USB-C PD negotiation)
    { issue: issueMap['EX-2008']._id, user: john._id, text: 'Found the issue: I2C interrupt polling for FUSB302 was delayed by 8ms due to SPI DMA contention. Separated I2C bus onto dedicated DMA channel. PD negotiation now reaches 65W on all 4 test chargers.' },

    // EX-2010 (JTAG boundary scan)
    { issue: issueMap['EX-2010']._id, user: john._id, text: 'Inner layer rerouting of JTAG traces completed on PCB rev 1.6. Sent for prototype fabrication at PCBWay. Expected delivery in 5 business days for validation testing.' },
    { issue: issueMap['EX-2010']._id, user: admin._id, text: 'Mark this issue blocked pending prototype delivery. Update status once rev 1.6 arrives and JTAG scan passes on 10 consecutive units.' },

    // EX-2011 (CAN transceiver silent mode - CLOSED)
    { issue: issueMap['EX-2011']._id, user: john._id, text: 'All 847 Batch #407 units scheduled for rework. First 200 units reworked with R31 pull-down. 20 sample units passed 24-hour CAN stress test at 95% bus load. Zero transceiver sleep events observed.' },
    { issue: issueMap['EX-2011']._id, user: admin._id, text: 'Rework complete on all Batch #407 units. BOM lock applied for R31. QA sign-off received. Issue verified and officially closed.' },

    // EX-2012 (UART baud rate - CLOSED)
    { issue: issueMap['EX-2012']._id, user: john._id, text: 'PLL reconfigured to 12MHz HSE crystal as reference. Measured UART baud rate error at 921600bps: 0.03%. Ran 10 million byte continuous logging test with zero framing errors. Closing issue.' },
    { issue: issueMap['EX-2012']._id, user: admin._id, text: 'Verified in production build v3.1.4. Crystal oscillator specification added to BOM design guidelines. Issue officially closed.' }
  ];

  await Comment.insertMany(johnComments);
  console.log(`  ✓ Inserted ${johnComments.length} detailed engineering comments across all 12 issues!`);

  // Update counter to reflect new highest issue number
  await mongoose.connection.db.collection('counters').updateOne(
    { _id: 'issueNumber' },
    { $set: { seq: 2012, lastUpdated: new Date() } },
    { upsert: true }
  );
  console.log('  ✓ Counter updated to 2012 (next new issue via UI: EX-2013)');

  // Final verification
  const filter = { $or: [{ createdBy: john._id }, { assignedTo: john._id }] };
  const openCount = await Issue.countDocuments({ ...filter, status: 'Open' });
  const inProgressCount = await Issue.countDocuments({ ...filter, status: 'In Progress' });
  const closedCount = await Issue.countDocuments({ ...filter, status: 'Closed' });

  console.log('\n════════════════════════════════════════════════════');
  console.log(' JOHN SMITH DASHBOARD BREAKDOWN (john.smith@exelon.com)');
  console.log('════════════════════════════════════════════════════');
  console.log(`  Total Issues    : ${openCount + inProgressCount + closedCount}`);
  console.log(`  Open            : ${openCount}   (EX-2001 to EX-2006)`);
  console.log(`  In Progress     : ${inProgressCount}   (EX-2007 to EX-2010)`);
  console.log(`  Closed          : ${closedCount}   (EX-2011, EX-2012)`);
  console.log('  Login           : john.smith@exelon.com / UserPass@123');
  console.log('════════════════════════════════════════════════════\n');

  await mongoose.disconnect();
  process.exit(0);
}

setupJohnSmithData().catch((err) => {
  console.error('[Error]:', err.message);
  process.exit(1);
});

