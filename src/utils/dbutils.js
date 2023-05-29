const Sequelize = require('sequelize');
const path = require('node:path');

const dbPath = path.join(__dirname, '../../db/botdb.sqlite');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    logging: false, //console.log
    storage: dbPath,
});

const Users = require('./models/Users.js')(sequelize, Sequelize.DataTypes);
const XPWinner = require('./models/XPWinner.js')(sequelize, Sequelize.DataTypes);
const Votes = require('./models/Votes.js')(sequelize, Sequelize.DataTypes);
const Voters = require('./models/Voters.js')(sequelize, Sequelize.DataTypes);

module.exports = { Users, XPWinner, Votes, Voters };