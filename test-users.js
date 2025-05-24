// test-users.js
const { sequelize, User } = require('./models/users');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection established.');

    const users = await User.findAll();
    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      console.log(`Found ${users.length} user(s):`);
      users.forEach(user => {
        console.log(`🧍 ID: ${user.id}, Provider: ${user.provider}, Name: ${user.displayName}, Email: ${user.email}`);
      });
    }

    await sequelize.close();
  } catch (err) {
    console.error('❌ Error querying users:', err);
  }
})();
