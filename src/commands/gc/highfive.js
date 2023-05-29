const { SlashCommandBuilder } = require('discord.js');
const { LOG_PREFIX, funCommandHandler } = require('../../utils/botutils.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('highfive')
		.setDescription("High five member")        
        .addUserOption(option => option.setName('member').setDescription('Member to high five').setRequired(true)),
	async execute(interaction) {
        const highFiveRecipient = interaction.options.getUser('member');
        await funCommandHandler(highFiveRecipient, { name:'high five', emoji:'🙌' }, interaction);          
	},
};