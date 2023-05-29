const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { userxp } = require('../../utils/botutils.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription("See xp leaderboard"),
	async execute(interaction) {
		userxp.sort((userA, userB) => userB.user_xp - userA.user_xp);
		
		let userNameValues = "";
		let levelValues = "";
		let xpValues = "";

		let t10 = userxp.first(10);
		let lines = ``;
		t10.forEach((user, index) => {
			const member = interaction.guild.members.cache.get(user.user_id);
			userNameValues += `**${index+1}.** ${member}\n`;
			levelValues += `${user.user_level}\n`;
			xpValues += `${user.user_xp}\n`;
			lines += `**${index+1}.** ${member}　　${user.user_xp}xp\n`

		});

		const leaderboardEmbed = new EmbedBuilder()
			.setColor('#D2C6E8')
			.setTitle('🏆 Leaderboard 🏆')
			.addFields(
				{ name: 'Top 10', value: lines, inline: true },
				
			);
			//.setURL('https://google.com');
			// { name: 'Level', value: levelValues, inline: true },
			// 	{ name: 'XP', value: xpValues, inline: true },
			//.setDescription(lines)
			

		await interaction.reply({ embeds: [leaderboardEmbed] })

	},
};