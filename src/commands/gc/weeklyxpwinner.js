const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const BotUtils = require('../../utils/botutils.js');
const { channels } = require('../../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('weeklyxpwinner')
		.setDescription("Highest point earner of the week")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {	
		if(BotUtils.xpWinners.size === 0) {
			await interaction.reply({ content:`There are no previous week winners`, ephemeral: true});
		} else {
			const channel = interaction.guild.channels.cache.get(channels.announcements);
			const t3 = [];
			BotUtils.xpWinners.forEach(user => t3.push({ member:interaction.guild.members.cache.get(user.user_id), xp:user.weekly_xp}));

			const xpWinnerEmbed = new EmbedBuilder()
				.setColor('#A2C892')
				.setDescription(`Time to announce our weekly XP winner!

:potted_plant: Top XP players are the following

･ﾟ:* ❀ 1st ${t3[0].member} (${t3[0].xp} xp)
･ﾟ:* ❀ 2nd ${t3[1].member} (${t3[1].xp} xp)
･ﾟ:* ❀ 3rd ${t3[2].member} (${t3[2].xp} xp)

**Congratulations to our top earner <@${t3[0].member.user.id}>**

Earn XP by being active in the discord!

Winner Prizes
🌟 200 XP
:lotus: Special Weekly XP Winner Role
🎨 Role Color of your choice for the week!
💗 Special big thanks from our staff team for being active in the discord! We appreciate you!

Till Next Time!`);
			channel.send({ content: '@everyone', embeds: [xpWinnerEmbed] });
			await interaction.reply({ content:`Sending out weekly xp winner announcement`, ephemeral: true});
			
			
		}
		
	},
};