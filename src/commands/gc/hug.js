const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { LOG_PREFIX, funCommandHandler } = require('../../utils/botutils.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hug')
		.setDescription("Hug member")        
        .addUserOption(option => option.setName('member').setDescription('Member to send hug to').setRequired(true)),
	async execute(interaction) {
        const hugRecipient = interaction.options.getUser('member');

        await funCommandHandler(hugRecipient, { name:'hug', emoji:'💌' }, interaction);
	},
};