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
    console.log(`[Seed] Connected to database: ${mongoose.connection.name}`);

    // 1. Seed Users
    console.log('[Seed] Seeding Users...');
    let admin = await User.findOne({ email: 'admin@exelon.com' });
    if (!admin) {
      admin = await User.create({
        name: 'System Administrator',
        email: 'admin@exelon.com',
        password: process.env.ADMIN_PASSWORD || 'AdminPass@123',
        role: 'admin',
        isActive: true
      });
      console.log('  -> Admin created: admin@exelon.com');
    } else {
      console.log('  -> Admin already exists.');
    }

    let engineer1 = await User.findOne({ email: 'jane.doe@exelon.com' });
    if (!engineer1) {
      engineer1 = await User.create({
        name: 'Jane Doe',
        email: 'jane.doe@exelon.com',
        password: 'UserPass@123',
        role: 'user',
        isActive: true
      });
      console.log('  -> Engineer created: jane.doe@exelon.com');
    }

    let engineer2 = await User.findOne({ email: 'john.smith@exelon.com' });
    if (!engineer2) {
      engineer2 = await User.create({
        name: 'John Smith',
        email: 'john.smith@exelon.com',
        password: 'UserPass@123',
        role: 'user',
        isActive: true
      });
      console.log('  -> Engineer created: john.smith@exelon.com');
    }

    // 2. Seed Issues
    console.log('[Seed] Seeding Issues...');
    let issue1 = await Issue.findOne({ issueNumber: 'EX-1001' });
    if (!issue1) {
      issue1 = await Issue.create({
        issueNumber: 'EX-1001',
        title: 'Thermal runaway on power delivery MOSFETs during 12V stress testing',
        description: 'During the burn-in qualification test of PCBA Batch #409, temperature sensors adjacent to MOSFET Q3 recorded temperatures exceeding 115°C under nominal 8A load.\n\nSteps to Reproduce:\n1. Mount board onto test fixture TF-02.\n2. Apply continuous 12V DC input at 8A load for 15 minutes.\n3. Observe thermal imaging on U4 and Q3 nodes.\n\nExpected: Surface temperatures below 85°C.',
        priority: 'Critical',
        status: 'In Progress',
        createdBy: admin._id,
        assignedTo: engineer1._id
      });
      console.log('  -> Issue created: EX-1001');
    }

    let issue2 = await Issue.findOne({ issueNumber: 'EX-1002' });
    if (!issue2) {
      issue2 = await Issue.create({
        issueNumber: 'EX-1002',
        title: 'Excessive clock jitter on SPI bus between MCU and ADC',
        description: 'Oscilloscope measurements on test point TP14 (SPI_CLK) reveal high-frequency ringing and jitter exceeding 180ps at 25MHz clock frequency, causing intermittent checksum failures.\n\nProposed Fix: Adjust terminating resistor R22 to 33Ω and verify impedance matching.',
        priority: 'High',
        status: 'Open',
        createdBy: engineer1._id,
        assignedTo: engineer2._id
      });
      console.log('  -> Issue created: EX-1002');
    }

    let issue3 = await Issue.findOne({ issueNumber: 'EX-1003' });
    if (!issue3) {
      issue3 = await Issue.create({
        issueNumber: 'EX-1003',
        title: 'I2C bus timeout when querying EEPROM after soft reboot',
        description: 'The calibration data EEPROM (U7) intermittently fails to acknowledge (NACK) read commands following a soft CPU watchdog reset. Hard power cycle recovers the bus.\n\nResolved by implementing a 9-cycle clock flush in the bootloader init routine.',
        priority: 'Medium',
        status: 'Closed',
        createdBy: engineer2._id,
        assignedTo: engineer1._id
      });
      console.log('  -> Issue created: EX-1003');
    }

    let issue4 = await Issue.findOne({ issueNumber: 'EX-1004' });
    if (!issue4) {
      issue4 = await Issue.create({
        issueNumber: 'EX-1004',
        title: 'Update Bill of Materials (BOM) for capacitor C18 footprint revision',
        description: 'CAD layout for capacitor C18 was updated from 0603 package to 0805 for improved voltage derating in revision 1.2. Update BOM documentation before manufacturing release.',
        priority: 'Low',
        status: 'Open',
        createdBy: engineer1._id,
        assignedTo: null
      });
      console.log('  -> Issue created: EX-1004');
    }

    // 3. Seed Comments
    console.log('[Seed] Seeding Comments...');
    const commentCount = await Comment.countDocuments({ issue: issue1._id });
    if (commentCount === 0) {
      await Comment.create([
        {
          issue: issue1._id,
          user: engineer1._id,
          text: 'Verified thermal dissipation using FLIR thermal camera. Hotspot appears isolated to the drain pad trace.'
        },
        {
          issue: issue1._id,
          user: admin._id,
          text: 'Approved redesign: adding 4 thermal relief vias connecting directly to the internal ground plane layer.'
        }
      ]);
      console.log('  -> Comments added to EX-1001');
    }

    const commentCount2 = await Comment.countDocuments({ issue: issue3._id });
    if (commentCount2 === 0) {
      await Comment.create([
        {
          issue: issue3._id,
          user: engineer1._id,
          text: 'Patch merged into firmware build v2.4.1-rc3. Validated with 500 consecutive soft reboots with zero NACKs.'
        }
      ]);
      console.log('  -> Comment added to EX-1003');
    }

    // 4. Seed Counters collection if exists
    console.log('[Seed] Seeding Counters collection...');
    const db = mongoose.connection.db;
    await db.collection('counters').updateOne(
      { _id: 'issueNumber' },
      { $set: { seq: 1004, lastUpdated: new Date() } },
      { upsert: true }
    );
    console.log('  -> Counter initialized: issueNumber -> 1004');

    console.log('\n[Seed Complete] Successfully populated data into all MongoDB Atlas collections:');
    console.log(' - users: Admin and Engineers');
    console.log(' - issues: EX-1001, EX-1002, EX-1003, EX-1004');
    console.log(' - comments: Discussion threads with timestamps');
    console.log(' - counters: Sequence tracking records');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err.message);
    process.exit(1);
  }
};

seedAll();

