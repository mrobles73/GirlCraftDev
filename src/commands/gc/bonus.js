const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const BotUtils = require('../../utils/botutils.js');
const { channels } = require('../../../config.json');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('bonus')
		.setDescription("Double points earned in provided amount of time")
		.addIntegerOption(option => option.setName('time').setDescription('Bonus time in minutes').setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		const time = interaction.options.getInteger('time');
		const channel = interaction.guild.channels.cache.get(channels.announcements);

		BotUtils.setDoublePoints(true);
		setTimeout(() => {
			BotUtils.setDoublePoints(false);
			console.log(`${BotUtils.LOG_PREFIX.info} Bonus time of ${time} minutes is ending`);
			const bonusEndEmbed = new EmbedBuilder()
				.setColor('#C3C1E6')
				.setDescription(`⏱️ Bonus time has ended.\n\rTill next time!`);
			channel.send({ content: '@everyone', embeds: [bonusEndEmbed] });
		}, time*60000);

		let display = '';
		if(time >= 60) {
			display = BotUtils.hoursToMinutesFormat(time);
		} else {
			display = time === 1 ? `${time} minute` : `${time} minutes`;
		}

		await interaction.reply({ content:`Setting bonus time to ${display}`, ephemeral: true});
		console.log(`${BotUtils.LOG_PREFIX.info} Setting bonus time to ${display}`);	
		const bonusStartEmbed = new EmbedBuilder()
			.setColor('#C3C1E6')
			.setDescription(`⏱️ Bonus time has started, will end ${display} from now.\n\rGood Luck!`);
		channel.send({ content: '@everyone', embeds: [bonusStartEmbed] });	
	},
};