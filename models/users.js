const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});

const User = sequelize.define('User', {
  provider: { type: DataTypes.STRING },
  providerId: { type: DataTypes.STRING },
  displayName: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
// WebAuthn-specific field
  webauthnId: DataTypes.STRING // optional unique identifier
});

const Credential = sequelize.define('Credential', {
  credentialID: DataTypes.STRING,
  credentialPublicKey: DataTypes.BLOB,
  counter: DataTypes.INTEGER
});


User.hasMany(Credential);
Credential.belongsTo(User);

sequelize.sync();

module.exports = { sequelize, User, Credential };
