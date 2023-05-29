const { token, clientId, gcGuildId, devGuildId } = require('../config.json');
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');


const gcCommands = [];
const commandsPath = path.join(__dirname, 'commands/gc');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const devCommands = [];
const devCommandsPath = path.join(__dirname, 'commands/devutility');
const devCommandFiles = fs.readdirSync(devCommandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/gc/${file}`);
	gcCommands.push(command.data.toJSON());
}

for (const file of devCommandFiles) {
	const command = require(`./commands/devutility/${file}`);
	devCommands.push(command.data.toJSON());
}

devCommands.push.apply(devCommands, gcCommands);

const rest = new REST({ version: '10' }).setToken(token);

// rest.delete(Routes.applicationGuildCommand(clientId, process.env.GUILD_ID, 'commandId'))
// 	.then(() => console.log('Successfully deleted guild command'))
// 	.catch(console.error);

// rest.delete(Routes.applicationCommand(clientId, 'commandId'))
// 	.then(() => console.log('Successfully deleted application command'))
// 	.catch(console.error);

(async () => {
	try {
		let commandsLength = gcCommands.length + devCommands.length;
		console.log(`Started refreshing ${devCommands.length} application (/) commands.`);

		// const data = await rest.put(			
		// 	Routes.applicationGuildCommands(clientId, gcGuildId),
		// 	{ body: gcCommands },
		// );

		// console.log(`Successfully reloaded ${data.length} gc (/) commands.`);

		const devData = await rest.put(
			Routes.applicationGuildCommands(clientId, devGuildId),
			{ body: devCommands },
		);
		console.log(`Successfully reloaded ${devData.length} dev (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();
