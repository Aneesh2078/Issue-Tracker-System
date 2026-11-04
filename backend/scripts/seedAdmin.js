require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@exelon.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPass@123';
  const adminName = process.env.ADMIN_NAME || 'System Administrator';

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/issue_tracker';

  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('[Seed] Database connected successfully.');

    // Check if admin already exists
    let admin = await User.findOne({ email: adminEmail.toLowerCase() });

    if (admin) {
      console.log(`[Seed] Admin user (${adminEmail}) already exists. Ensuring admin role and active status...`);
      admin.role = 'admin';
      admin.isActive = true;
      if (adminPassword) {
        admin.password = adminPassword; // Triggers pre-save hash
      }
      await admin.save();
      console.log('[Seed] Admin account updated successfully.');
    } else {
      console.log(`[Seed] Creating new admin account for ${adminEmail}...`);
      admin = await User.create({
        name: adminName,
        email: adminEmail.toLowerCase(),
        password: adminPassword,
        role: 'admin',
        isActive: true
      });
      console.log('[Seed] Admin account created successfully.');
    }

    console.log(`[Seed Complete] Admin email: ${admin.email} (Role: ${admin.role})`);
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] Failed to seed admin user: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
