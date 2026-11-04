require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Issue = require('../models/Issue');
const Comment = require('../models/Comment');

async function addCriticalClosedData() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[DB] Connected to MongoDB Atlas');

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('User@12345', salt);

  // Ensure BOTH email spellings exist with password User@12345
  const emails = ['vishwambharbk@gmail.com', 'vishwambarbk@gmail.com'];
  let primaryUser = null;

  for (const email of emails) {
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
    if (email === 'vishwambharbk@gmail.com') primaryUser = u;
  }

  const admin = await User.findOne({ email: 'admin@exelon.com' });

  // 1. Critical Closed Issue EX-1013
  const ex1013 = await Issue.findOneAndUpdate(
    { issueNumber: 'EX-1013' },
    {
      issueNumber: 'EX-1013',
      title: 'High-voltage flashover on auxiliary DC-DC converter during 1.5kV Hi-Pot isolation test',
      description: 
        'During factory end-of-line dielectric withstand (Hi-Pot) testing at 1500V AC RMS (IEC 62368-1 Section 5.4.9), PCBA Batch #411 exhibited destructive dielectric breakdown and sustained plasma flashover between the primary switching node (SW1) and secondary isolated ground return trace (GND_SEC).\n\n' +
        'Steps to Reproduce:\n' +
        '1. Fixture board into automated Hi-Pot testing station HPT-04.\n' +
        '2. Apply ramp voltage: 0 to 1500V AC at 500V/s, hold for 60 seconds.\n' +
        '3. Monitor leakage current with trip threshold set to 2.5mA.\n' +
        '4. Flashover occurs at approximately 1180V AC across creepage gap CG-07.\n\n' +
        'Root Cause Analysis:\n' +
        'PCB layout review revealed the minimum physical creepage distance between the primary transformer T1 pad (high voltage) and secondary optocoupler feedback trace was only 1.8mm. The required creepage distance for Pollution Degree 2 at 1500V is 3.2mm. Solder mask clearance cutout was inadvertently omitted from fabrication layer 12.\n\n' +
        'Corrective Action & Resolution:\n' +
        '1. Implemented Engineering Change Order ECO-0312: Milled an internal 1.2mm isolation air slot into the PCB substrate directly beneath transformer T1 and optocoupler U9.\n' +
        '2. Increased physical copper-to-copper creepage separation from 1.8mm to 4.1mm on Revision 2.4 gerbers.\n' +
        '3. Re-spun 25 prototype boards (Batch #412-A). All 25 boards successfully passed 2500V AC Hi-Pot test for 120 seconds with leakage current under 0.18mA.\n' +
        '4. Certified by TÜV SÜD test lab under Report Ref: TR-2026-EX-8841. Verified closed.',
      priority: 'Critical',
      status: 'Closed',
      createdBy: primaryUser._id,
      assignedTo: primaryUser._id
    },
    { upsert: true, new: true }
  );
  console.log('  ✓ Created Critical & Closed issue EX-1013 (ID:', ex1013._id, ')');

  // Comments for EX-1013
  await Comment.deleteMany({ issue: ex1013._id });
  await Comment.insertMany([
    {
      issue: ex1013._id,
      user: primaryUser._id,
      text: 'Hi-Pot test failure reproduced in safety lab on TF-04. Flashover confirmed at CG-07. Halt production shipment on Batch #411 immediately until ECO-0312 isolation slot routing is validated.'
    },
    {
      issue: ex1013._id,
      user: admin._id,
      text: 'Shipment hold placed on Batch #411. Priority escalated to Critical. Approving emergency NRE for revision 2.4 PCB milling with 1.2mm isolation air-gap.'
    },
    {
      issue: ex1013._id,
      user: primaryUser._id,
      text: 'Received Batch #412-A prototypes with milled isolation slots. Tested 25 sample boards up to 2500V AC for 120s. Leakage current measured 0.14mA (well below 2.5mA limit). TÜV SÜD certification TR-2026-EX-8841 issued. Production line released. Issue closed.'
    },
    {
      issue: ex1013._id,
      user: admin._id,
      text: 'Excellent root cause analysis and rapid turnaround on the isolation slot design. QA verification complete. Marking as officially closed.'
    }
  ]);

  // 2. Critical Closed Issue EX-1014
  const ex1014 = await Issue.findOneAndUpdate(
    { issueNumber: 'EX-1014' },
    {
      issueNumber: 'EX-1014',
      title: 'Severe undervoltage lockout chattering on main 48V battery inverter bus',
      description:
        'Under rapid acceleration load transitions (0A to 65A in <2ms), battery inverter board displays severe undervoltage lockout (UVLO) chattering. Comparator IC U14 oscillates between ENABLE and FAULT states at 12kHz, inducing acoustic noise and burning gate driver resistors R45/R46.\n\n' +
        'Steps to Reproduce:\n' +
        '1. Connect board to 48V DC programmable power supply with 10mΩ lead resistance.\n' +
        '2. Apply pulsed electronic load: 60A step with 100µs slew rate.\n' +
        '3. Probe UVLO comparator output pin 7 on oscilloscope.\n' +
        '4. Observe continuous burst oscillations around the 36.2V cutoff threshold.\n\n' +
        'Root Cause:\n' +
        'Comparator U14 lacked adequate positive feedback hysteresis (currently configured with only 80mV hysteresis). Large bus voltage dips during transient surge triggered repeated tripping across the threshold.\n\n' +
        'Resolution:\n' +
        'Replaced feedback resistor R88 (470kΩ) with 150kΩ to expand hysteresis window from 80mV to 420mV. Added 100nF low-ESR ceramic filter capacitor C62 directly across the comparator inverting input to eliminate ground-bounce noise.',
      priority: 'Critical',
      status: 'Closed',
      createdBy: primaryUser._id,
      assignedTo: primaryUser._id
    },
    { upsert: true, new: true }
  );
  console.log('  ✓ Created Critical & Closed issue EX-1014 (ID:', ex1014._id, ')');

  await Comment.deleteMany({ issue: ex1014._id });
  await Comment.insertMany([
    {
      issue: ex1014._id,
      user: primaryUser._id,
      text: 'Oscilloscope captures show 12kHz oscillation on UVLO pin during 60A step load. Modifying hysteresis feedback resistor R88 on bench unit.'
    },
    {
      issue: ex1014._id,
      user: primaryUser._id,
      text: 'Tested 150kΩ resistor with 100nF input filter. Hysteresis expanded to 420mV. Ran 200 consecutive 65A transient pulses with zero UVLO chattering. Gate driver temperatures remained steady at 48°C. Closing issue.'
    },
    {
      issue: ex1014._id,
      user: admin._id,
      text: 'Verified on dynamo test bench with full motor load. Performance is rock solid. ECO signed off and issue closed.'
    }
  ]);

  // Update counters
  await mongoose.connection.db.collection('counters').updateOne(
    { _id: 'issueNumber' },
    { $set: { seq: 1014, lastUpdated: new Date() } },
    { upsert: true }
  );

  console.log('\n[Done] All Critical & Closed issues and comments successfully seeded in MongoDB Atlas!');
  process.exit(0);
}

addCriticalClosedData().catch(err => {
  console.error('[Error]:', err.message);
  process.exit(1);
});
