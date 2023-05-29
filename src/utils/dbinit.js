/* 

Used to initialize or update database
run node dbinit.js --force or node dbinit.js -f to force sync

*/

const Sequelize = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: '../../db/botdb.sqlite',
});

require('./models/Users.js')(sequelize, Sequelize.DataTypes);
require('./models/XPWinner.js')(sequelize, Sequelize.DataTypes);
require('./models/Votes.js')(sequelize, Sequelize.DataTypes);
require('./models/Voters.js')(sequelize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(async () => {
    console.log('Database synced');
    sequelize.close();
}).catch(console.error);