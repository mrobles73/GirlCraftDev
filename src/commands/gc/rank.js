const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const Canvacord = require('canvacord');
const { getUserStats } = require('../../utils/botutils.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rank')
		.setDescription("Show your rank card"),
	async execute(interaction) {
		await interaction.deferReply();
		const textColor = '#770737';
		const user = interaction.user;
		const userStats = getUserStats(user.id);
		//console.log(userStats);
		const requiredXP = (userStats.user.user_level + 1) * 1000;
		//const userData = 
		const status = (interaction.member.presence) ? interaction.member.presence.status : 'offline';
		const rankCard = new Canvacord.Rank()
			.renderEmojis(true)
			.setAvatar(user.displayAvatarURL({ format: 'png', dynamic: true }))
			.setCurrentXP(userStats.user.user_xp, textColor)
			.setRequiredXP(requiredXP, textColor)
			.setStatus(status, true, 5) // need to check if presence is null before
			.setLevel(userStats.user.user_level, 'LEVEL', true)
			.setLevelColor(textColor, textColor)
			.setRank(userStats.index, '⚔️ Rank #', true)
			.setRankColor(textColor, textColor)
			.setProgressBar(textColor, "COLOR")
			.setOverlay('#FFFFFF', 0.5)
			.setUsername(user.username, textColor)
			.setDiscriminator(user.discriminator, 'rgba(119, 7, 55, 0.7)')
			.setBackground('IMAGE', 'https://cdn.discordapp.com/attachments/829079179114315836/1088262504460845146/Screen_Shot_2023-03-22_at_5.46.24_PM.png');
		
		rankCard.build()
			.then(async data => {
				const attachment = new AttachmentBuilder(data, 'rank.png');
				await interaction.editReply({ files: [attachment] });
			});

	},
};