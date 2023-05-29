const { SlashCommandBuilder } = require('discord.js');
const { LOG_PREFIX, funCommandHandler } = require('../../utils/botutils.js');

const smiles = ['😃', '😁', '😄'];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('smile')
		.setDescription("Send smile to member")        
        .addUserOption(option => option.setName('member').setDescription('Member to send smile to').setRequired(true)),
	async execute(interaction) {
        const smileRecipient = interaction.options.getUser('member');
        await funCommandHandler(smileRecipient, { name:'smile', emoji:smiles[Math.floor(Math.random() * smiles.length)] }, interaction);          
	},
};