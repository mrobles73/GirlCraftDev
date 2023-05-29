const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { channels } = require('../../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription("Checks Bot's Ping!")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		//await interaction.reply(`Websocket heartbeat: ${interaction.client.ws.ping}ms.`);

		const member = interaction.guild.members.cache.get('1021554510239383552');

		const guildChannels = interaction.guild.channels;
        const welcomeChannel = guildChannels.cache.get(channels.welcome);

        const rulebook = guildChannels.cache.get(channels.rulebook);
        const aboutChannel = guildChannels.cache.get(channels.about);
        const applyChannel = guildChannels.cache.get(channels.apply);

        const welcomeEmbed = new EmbedBuilder()
            .setColor('#e9d0e8')
            .setTitle(`⋆⁺₊ **Welcome to GirlCraft!** ₊⁺⋆`)
			.setAuthor({ name: `﹒${member.user.tag} ﹒` })
            .setDescription(`﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆
            
            🌟 ﹒ ${rulebook} please read the rules before chatting!
            🌟 ﹒ ${aboutChannel} learn more about what GirlCraft is about!
            🌟 ﹒ ${applyChannel} apply to get verified and access the rest of the server.
            
            ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆ ﹒ . ﹒⋆`)
            .setThumbnail(member.user.displayAvatarURL({ format: 'png', dynamic: true }))
            .setFooter({ text: `you're member ${member.guild.memberCount}!` });

			
		welcomeChannel.send({ content: `Hey <@${member.user.id}>!`, embeds: [welcomeEmbed] });
		await interaction.reply(` ${interaction.channel} `);

		// const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
		// interaction.editReply(`Roundtrip latency: ${sent.createdTimestamp - interaction.createdTimestamp}ms`);
	},
};