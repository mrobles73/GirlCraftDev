const { SlashCommandBuilder } = require('discord.js');
const { LOG_PREFIX, funCommandHandler } = require('../../utils/botutils.js');

const flowers = [ { name:'Tulip', emoji:'🌷' }, { name:'Rose', emoji:'🌹'}, { name:'Lotus', emoji:':lotus:' }, { name:'Hibiscus', emoji:'🌺' }, { name:'Cherry Blossom', emoji:'🌸' }, { name:'Blossom', emoji:'🌼' }, { name:'Sunflower', emoji:'🌻' }, { name:'Bouquet', emoji:'💐' } ]

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sendflower')
		.setDescription("Send flower to member")        
        .addUserOption(option => option.setName('member').setDescription('Member to send flower to').setRequired(true)),
	async execute(interaction) {
        const flowerRecipient = interaction.options.getUser('member');
        const flower = flowers[Math.floor(Math.random() * flowers.length)];
        const description = `You have a delivery! 💌\n\r${interaction.user} has sent you a ${flower.name} ${flower.emoji}\n﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆`
        await funCommandHandler(flowerRecipient, { name:'flower' }, interaction, description);         
	},
};