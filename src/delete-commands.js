const { token, clientId, gcGuildId, devGuildId } = require('../config.json');
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');


const commands = ['', '', '', '', '', '', '', ''];

const rest = new REST({ version: '10' }).setToken(token);

for(const command of commands) {
    rest.delete(Routes.applicationCommand(clientId, command))
	    .then(() => console.log('Successfully deleted guild command'))
	    .catch(console.error);
}

// rest.delete(Routes.applicationGuildCommand(clientId, process.env.GUILD_ID, 'commandId'))
// 	.then(() => console.log('Successfully deleted guild command'))
// 	.catch(console.error);

// rest.delete(Routes.applicationCommand(clientId, 'commandId'))
// 	.then(() => console.log('Successfully deleted application command'))
// 	.catch(console.error);
