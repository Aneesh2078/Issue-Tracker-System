require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Issue = require('../models/Issue');
const Comment = require('../models/Comment');

async function renameToAneesh() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[DB] Connected to MongoDB Atlas');

  // ── 1. Find or create old user ──────────────────────────────────────────
  let oldUser = await User.findOne({ email: 'vishwambhara@exelon.com' });

  if (!oldUser) {
    console.log('  ⚠  vishwambhara@exelon.com not found — checking aneesh@exelon.com already exists...');
    const already = await User.findOne({ email: 'aneesh@exelon.com' });
    if (already) {
      console.log('  ✓ aneesh@exelon.com already exists. Ensuring name and password are correct...');
      already.name = 'Aneesh Bhat';
      already.password = 'User@12345';
      already.role = 'user';
      already.isActive = true;
      already.markModified('password');
      await already.save();
      console.log('  ✓ Updated: aneesh@exelon.com / Aneesh Bhat / User@12345');
      await mongoose.disconnect();
      process.exit(0);
    } else {
      console.error('  ✗ Neither vishwambhara@exelon.com nor aneesh@exelon.com found. Run setupVishwambharaExelonData.js first.');
      await mongoose.disconnect();
      process.exit(1);
    }
  }

  const oldId = oldUser._id;

  // ── 2. Check if aneesh@exelon.com already exists (avoid duplicate) ──────
  const conflict = await User.findOne({ email: 'aneesh@exelon.com' });
  if (conflict) {
    console.log('  ⚠  aneesh@exelon.com already exists — merging and removing old account...');
    // Re-assign all issues and comments from oldId → conflict._id
    await Issue.updateMany({ createdBy: oldId }, { createdBy: conflict._id });
    await Issue.updateMany({ assignedTo: oldId }, { assignedTo: conflict._id });
    await Comment.updateMany({ user: oldId }, { user: conflict._id });
    await User.deleteOne({ _id: oldId });
    // Now fix name/password on conflict
    conflict.name = 'Aneesh Bhat';
    conflict.password = 'User@12345';
    conflict.role = 'user';
    conflict.isActive = true;
    conflict.markModified('password');
    await conflict.save();
    console.log('  ✓ Merged and updated: aneesh@exelon.com / Aneesh Bhat / User@12345');
    await printSummary(conflict._id);
    await mongoose.disconnect();
    process.exit(0);
  }

  // ── 3. Rename in-place ───────────────────────────────────────────────────
  oldUser.email    = 'aneesh@exelon.com';
  oldUser.name     = 'Aneesh Bhat';
  oldUser.password = 'User@12345';
  oldUser.role     = 'user';
  oldUser.isActive = true;
  oldUser.markModified('password');
  await oldUser.save();

  console.log('  ✓ User renamed:');
  console.log('      Old email : vishwambhara@exelon.com');
  console.log('      New email : aneesh@exelon.com');
  console.log('      New name  : Aneesh Bhat');
  console.log('      Password  : User@12345  (unchanged)');

  // ── 4. Issues & comments automatically carry over (same _id) ────────────
  const issueCount   = await Issue.countDocuments({ $or: [{ createdBy: oldId }, { assignedTo: oldId }] });
  const commentCount = await Comment.countDocuments({ user: oldId });
  console.log(`  ✓ ${issueCount} issues still linked to this user (EX-3001 to EX-3012)`);
  console.log(`  ✓ ${commentCount} comments still linked to this user`);

  await printSummary(oldId);

  await mongoose.disconnect();
  process.exit(0);
}

async function printSummary(userId) {
  const filter = { $or: [{ createdBy: userId }, { assignedTo: userId }] };
  const open       = await Issue.countDocuments({ ...filter, status: 'Open' });
  const inProgress = await Issue.countDocuments({ ...filter, status: 'In Progress' });
  const closed     = await Issue.countDocuments({ ...filter, status: 'Closed' });

  console.log('\n════════════════════════════════════════════════════');
  console.log(' ANEESH BHAT DASHBOARD (aneesh@exelon.com)');
  console.log('════════════════════════════════════════════════════');
  console.log(`  Total Issues    : ${open + inProgress + closed}`);
  console.log(`  Open            : ${open}   (EX-3001 to EX-3006)`);
  console.log(`  In Progress     : ${inProgress}   (EX-3007 to EX-3010)`);
  console.log(`  Closed          : ${closed}   (EX-3011, EX-3012)`);
  console.log('  Login           : aneesh@exelon.com / User@12345');
  console.log('════════════════════════════════════════════════════\n');
}

renameToAneesh().catch((err) => {
  console.error('[Error]:', err.message);
  process.exit(1);
});

