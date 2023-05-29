const { SlashCommandBuilder } = require('discord.js');
const { LOG_PREFIX, funCommandHandler } = require('../../utils/botutils.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('boop')
		.setDescription("Boop member")        
        .addUserOption(option => option.setName('member').setDescription('Member to boop').setRequired(true)),
	async execute(interaction) {
        const boopRecipient = interaction.options.getUser('member');
        await funCommandHandler(boopRecipient, { name:'boop', emoji:'👉' }, interaction);         
	},
};